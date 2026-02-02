const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const db = require('../db');

exports.uploadMusic = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const apiUserToken = req.user.id;
    const userRow = await db.oneOrNone(
      'SELECT id_zycootoken FROM "users" WHERE id = $1',
      [apiUserToken]
    );
    if (!userRow) {
      return res.status(400).json({ message: 'User not found with provided API token' });
    }

    const zycooUserId = userRow.id_zycootoken;
    const tokenRow = await db.oneOrNone(
      `SELECT token FROM user_tokens WHERE userid = $1 ORDER BY created_at DESC LIMIT 1`,
      [zycooUserId]
    );
    if (!tokenRow) {
      return res.status(400).json({ message: 'No ZYCOO token found for user' });
    }
    const zycooToken = tokenRow.token;
    const originalName = Buffer.from(req.file.originalname, 'latin1').toString('utf8');
    const ext = path.extname(originalName); 
    const base = path.basename(originalName, ext);
    const secretCode = 'Tal' + Math.floor(1000 + Math.random() * 9000);
    const zycooMusicName = `${base}-${secretCode}${ext}`;
    const uploadPathNew = path.join(path.dirname(req.file.path), zycooMusicName);
    fs.renameSync(req.file.path, uploadPathNew);
    const formData = new FormData();
    formData.append('name', zycooMusicName);
    formData.append('file', fs.createReadStream(uploadPathNew), zycooMusicName);
    formData.append('type', 'music');
    await axios.post(
      `${process.env.API_URL}/plugin-player/musiclibrary`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${zycooToken}`,
          ...formData.getHeaders(),
        },
      }
    );
    const zycooListRes = await axios.get(
      `${process.env.API_URL}/plugin-player/musiclibrary?limit=1000&page=1&type=music`,
      { headers: { Authorization: `Bearer ${zycooToken}` } }
    );
    const uploadedSong = zycooListRes.data.rows.find( s => s.name === zycooMusicName);
    if (!uploadedSong) { return res.status(500).json({ message: 'Cannot find uploaded song in Zycoo' })}
    const insertQuery = `
      INSERT INTO music_library
        (zycoo_music_id, zycoo_music_name, name, path, created_at)
      VALUES
        ($1, $2, $3, $4, NOW())
      RETURNING id, zycoo_music_id, zycoo_music_name, name, path, created_at;
    `;
    const dbRes = await db.one(insertQuery, [
      uploadedSong.id,
      zycooMusicName,
      originalName,
      uploadPathNew
    ]);
    res.status(200).json({
      message: 'Upload success',
      data: {
        id: dbRes.id,  
        zycoo_music_id: dbRes.zycoo_music_id,
        name: dbRes.name,
        zycoo_music_name: dbRes.zycoo_music_name,
        path: dbRes.path,
        created_at: dbRes.created_at,
        size: req.file.size, 
        mimetype: req.file.mimetype,
        duration: uploadedSong?.duration || 0 
      }
    });

  } catch (err) {
    console.error('Error uploading music:', err);
    res.status(500).json({
      message: 'Upload failed',
      error: err.message
    });
  }
};

exports.getMySongs = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const userRow = await db.oneOrNone(
      'SELECT id_zycootoken FROM "users" WHERE id=$1',
      [userId]
    );
    if (!userRow) {
      return res.status(400).json({ message: 'User not found' });
    }
    const zycooUserId = userRow.id_zycootoken;
    console.log(zycooUserId)
    const tokenRow = await db.oneOrNone(
      `SELECT token FROM user_tokens WHERE userid = $1 ORDER BY created_at DESC LIMIT 1`,
      [zycooUserId]
    );
    if (!tokenRow) {
      return res.status(400).json({ message: 'No token found' });
    }
    const zycooToken = tokenRow.token;
    const zycooRes = await axios.get(
      `${process.env.API_URL}/plugin-player/musiclibrary?limit=1000&page=1&type=music`,
      {
        headers: {
          Authorization: `Bearer ${zycooToken}`,
        },
      }
    );
    const allSongs = zycooRes.data.rows;
    const mySongs = allSongs.filter(song => /-Tal\d{4}\.mp3$/i.test(song.name));
    res.json(mySongs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteMusic = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ message: 'Missing zycoo_music_id' });

    const musicRow = await db.oneOrNone(
      'SELECT * FROM music_library WHERE zycoo_music_id=$1',
      [id]
    );
    if (!musicRow) return res.status(404).json({ message: 'Music not found' });
    const userRow = await db.oneOrNone(
      'SELECT id_zycootoken FROM "users" WHERE id=$1',
      [req.user.id]
    );
    if (!userRow) return res.status(400).json({ message: 'User not found' });

    const zycooUserId = userRow.id_zycootoken;
    const tokenRow = await db.oneOrNone(
      `SELECT token FROM user_tokens WHERE userid = $1 ORDER BY created_at DESC LIMIT 1`,
      [zycooUserId]
    );
    if (!tokenRow) return res.status(400).json({ message: 'No ZYCOO token found' });

    const zycooToken = tokenRow.token;
    const playlistsContaining = await db.manyOrNone(
      `SELECT DISTINCT p.id, p.source_id
       FROM playlist p
       JOIN playlist_item pi ON pi.playlist_id = p.id
       WHERE pi.music_library_id = $1`,
      [musicRow.id]
    );
    for (const pl of playlistsContaining) {
      await db.none('DELETE FROM playlist_item WHERE playlist_id=$1', [pl.id]);
      await db.none('DELETE FROM playlist WHERE id=$1', [pl.id]);

      if (pl.source_id) {
        try {
          await axios.delete(
            `${process.env.API_URL}/plugin-player/playlist/${pl.source_id}`,
            { headers: { Authorization: `Bearer ${zycooToken}` } }
          );
        } catch (zycooErr) {
          console.error('Failed to delete playlist on ZYCOO:', zycooErr.response?.data || zycooErr.message);
        }
      }
    }
    await axios.delete(
      `${process.env.API_URL}/plugin-player/musiclibrary/${id}`,
      {
        headers: {
          Authorization: `Bearer ${zycooToken}`,
          accept: 'application/json',
        },
      }
    );

    if (fs.existsSync(musicRow.path)) fs.unlinkSync(musicRow.path);
    await db.none('DELETE FROM music_library WHERE zycoo_music_id=$1', [id]);

    res.status(200).json({ message: 'Music and related playlists deleted successfully' });

  } catch (err) {
    console.error('Error deleting music:', err);
    res.status(500).json({ message: 'Delete failed', error: err.message });
  }
};