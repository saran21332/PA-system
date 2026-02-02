const db = require('../db');
const axios = require('axios');

exports.createPlaylist = async (req, res) => {
  try {
    const { playList } = req.body;
    if (!playList || !playList.name || !Array.isArray(playList.musicLibraryIds)) {
      return res.status(400).json({ message: 'Invalid request body' });
    }

    const { id: userId } = req.user;
    const userRow = await db.oneOrNone(
      'SELECT id_zycootoken FROM "users" WHERE id=$1',
      [userId]
    );
    if (!userRow) return res.status(400).json({ message: 'User not found' });

    const zycooUserId = userRow.id_zycootoken;
    const tokenRow = await db.oneOrNone(
      `SELECT token 
       FROM user_tokens 
       WHERE userid = $1 
       ORDER BY created_at DESC LIMIT 1`,
      [zycooUserId]
    );
    if (!tokenRow) return res.status(400).json({ message: 'No ZYCOO token found' });

    const zycooToken = tokenRow.token;
    const musicRows = await db.manyOrNone(
      `SELECT id, zycoo_music_id 
       FROM music_library 
       WHERE zycoo_music_id = ANY($1::int[])`,
      [playList.musicLibraryIds]
    );

    if (musicRows.length !== playList.musicLibraryIds.length) {
      return res.status(400).json({ message: 'Some musicLibraryIds are invalid' });
    }
    const zycooIdToLibraryId = {};
    musicRows.forEach(m => {
      zycooIdToLibraryId[m.zycoo_music_id] = m.id;
    });

    const zycooIds = playList.musicLibraryIds;
    const zycooPayload = {
      playList: {
        name: playList.name,
        musicLibraryIds: zycooIds,
        remark: playList.remark || ''
      }
    };

    const zycooRes = await axios.post(
      `${process.env.API_URL}/plugin-player/playlist`,
      zycooPayload,
      { headers: { Authorization: `Bearer ${zycooToken}` } }
    );

    const rawSourceId = zycooRes.data?.data?.sourceId || null;
    let numericSourceId = null;
    if (rawSourceId) {
      const match = rawSourceId.match(/\d+/);
      numericSourceId = match ? parseInt(match[0], 10) : null;
    }

    const dbInsert = await db.one(
      `INSERT INTO playlist (name, remark, source_id, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())
       RETURNING *`,
      [playList.name, playList.remark || '', numericSourceId]
    );

    for (let i = 0; i < playList.musicLibraryIds.length; i++) {
      const zycooId = playList.musicLibraryIds[i];
      const libraryId = zycooIdToLibraryId[zycooId];
      await db.none(
        `INSERT INTO playlist_item (playlist_id, music_library_id, position, created_at)
         VALUES ($1, $2, $3, NOW())`,
        [dbInsert.id, libraryId, i]
      );
    }

    res.status(200).json({
      message: 'Playlist created successfully',
      playlist: dbInsert
    });

  } catch (err) {
    console.error('Error creating playlist:', err);
    res.status(500).json({ message: 'Failed to create playlist', error: err.message });
  }
};

// exports.getAllPlaylists = async (req, res) => {
//   try {
//     const { id: userId } = req.user;
//     const playlists = await db.manyOrNone(
//       `SELECT id, name, remark, source_id, created_at, updated_at
//        FROM playlist
//        ORDER BY created_at DESC`
//     );

//     if (!playlists.length) {
//       return res.status(200).json({ message: 'No playlists found', playlists: [] });
//     }
//     const playlistIds = playlists.map(p => p.id);
//     const playlistItems = await db.manyOrNone(
//       `SELECT pi.playlist_id, ml.id AS music_id, ml.zycoo_music_id, ml.name
//        FROM playlist_item pi
//        JOIN music_library ml ON pi.music_library_id = ml.id
//        WHERE pi.playlist_id = ANY($1::int[])`,
//       [playlistIds]
//     );
//    const playlistsWithSongs = playlists.map(p => ({
//   ...p,
//   songs: playlistItems
//     .filter(item => Number(item.playlist_id) === p.id)
// }));

//     res.status(200).json({
//       message: 'Playlists retrieved successfully',
//       playlists: playlistsWithSongs
//     });

//   } catch (err) {
//     console.error('Error fetching playlists:', err);
//     res.status(500).json({ message: 'Failed to fetch playlists', error: err.message });
//   }
// };

exports.getAllPlaylists = async (req, res) => {
  try {
    const playlists = await db.manyOrNone(
      `SELECT id, name, remark, source_id, created_at, updated_at
       FROM playlist
       ORDER BY created_at DESC`
    );

    if (!playlists.length) {
      return res.status(200).json({ message: 'No playlists found', playlists: [] });
    }

    const playlistIds = playlists.map(p => p.id);

    const playlistItems = await db.manyOrNone(
      `SELECT pi.playlist_id, ml.id AS music_id, ml.zycoo_music_id, ml.name, pi.position
       FROM playlist_item pi
       JOIN music_library ml ON pi.music_library_id = ml.id
       WHERE pi.playlist_id = ANY($1::int[])
       ORDER BY pi.playlist_id, pi.position ASC`,
      [playlistIds]
    );

    const playlistsWithSongs = playlists.map(p => {
      const songs = playlistItems.filter(item => item.playlist_id === p.id);
      return { ...p, songs };
    });

    res.status(200).json({
      message: 'Playlists retrieved successfully',
      playlists: playlistsWithSongs
    });
  } catch (err) {
    console.error('Error fetching playlists:', err);
    res.status(500).json({ message: 'Failed to fetch playlists', error: err.message });
  }
};

exports.updatePlaylist = async (req, res) => {
  try {
    const { id: playlistId, name, remark, ids: zycooIdsFromBody } = req.body;

    if (!playlistId || !Array.isArray(zycooIdsFromBody)) {
      return res.status(400).json({ message: 'Invalid request body' });
    }

    const { id: userId } = req.user;
    const userRow = await db.oneOrNone(
      'SELECT id_zycootoken FROM "users" WHERE id=$1',
      [userId]
    );
    if (!userRow) return res.status(400).json({ message: 'User not found' });

    const zycooUserId = userRow.id_zycootoken;
    const tokenRow = await db.oneOrNone(
      `SELECT token 
       FROM user_tokens 
       WHERE userid = $1 
       ORDER BY created_at DESC LIMIT 1`,
      [zycooUserId]
    );
    if (!tokenRow) return res.status(400).json({ message: 'No ZYCOO token found' });

    const zycooToken = tokenRow.token;
    const dbPlaylist = await db.oneOrNone(
      'SELECT * FROM playlist WHERE id=$1',
      [playlistId]
    );
    if (!dbPlaylist) return res.status(404).json({ message: 'Playlist not found' });

    const musicRows = await db.manyOrNone(
      `SELECT id, zycoo_music_id 
       FROM music_library 
       WHERE zycoo_music_id = ANY($1::int[])`,
      [zycooIdsFromBody]
    );

    if (musicRows.length !== zycooIdsFromBody.length) {
      return res.status(400).json({ message: 'Some ZYCOO music IDs are invalid' });
    }

    const zycooPayload = {
      playList: {
        action: 'update',
        name: name || dbPlaylist.name,
        remark: remark || dbPlaylist.remark || '',
        ids: zycooIdsFromBody
      }
    };

    await axios.put(
      `${process.env.API_URL}/plugin-player/playlist/${dbPlaylist.source_id}`,
      zycooPayload,
      { headers: { Authorization: `Bearer ${zycooToken}` } }
    );

    await db.none(
      'UPDATE playlist SET name=$1, remark=$2, updated_at=NOW() WHERE id=$3',
      [name || dbPlaylist.name, remark || dbPlaylist.remark, playlistId]
    );

    await db.none('DELETE FROM playlist_item WHERE playlist_id=$1', [playlistId]);

    const zycooIdToLibraryId = {};
    musicRows.forEach(m => {
      zycooIdToLibraryId[m.zycoo_music_id] = m.id;
    });

    for (let i = 0; i < zycooIdsFromBody.length; i++) {
      const zycooId = zycooIdsFromBody[i];
      const libraryId = zycooIdToLibraryId[zycooId];
      await db.none(
        `INSERT INTO playlist_item (playlist_id, music_library_id, position, created_at)
         VALUES ($1, $2, $3, NOW())`,
        [playlistId, libraryId, i]
      );
    }

    res.status(200).json({ status: 'success', message: 'update success' });

  } catch (err) {
    console.error('Error updating playlist:', err);
    res.status(500).json({ message: 'Failed to update playlist', error: err.message });
  }
};

exports.deletePlaylist = async (req, res) => {
  try {
    const { id: playlistId } = req.body;
    if (!playlistId) {
      return res.status(400).json({ message: 'Playlist ID is required' });
    }

    const { id: userId } = req.user;
    const playlist = await db.oneOrNone(
      'SELECT * FROM playlist WHERE id=$1',
      [playlistId]
    );
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    const userRow = await db.oneOrNone(
      'SELECT id_zycootoken FROM "users" WHERE id=$1',
      [userId]
    );
    if (!userRow) return res.status(400).json({ message: 'User not found' });

    const zycooUserId = userRow.id_zycootoken;
    const tokenRow = await db.oneOrNone(
      `SELECT token 
       FROM user_tokens 
       WHERE userid=$1 
       ORDER BY created_at DESC LIMIT 1`,
      [zycooUserId]
    );
    if (!tokenRow) return res.status(400).json({ message: 'No ZYCOO token found' });

    const zycooToken = tokenRow.token;
    await db.none('DELETE FROM playlist_item WHERE playlist_id=$1', [playlistId]);
    await db.none('DELETE FROM playlist WHERE id=$1', [playlistId]);

    if (playlist.source_id) {
      try {
        await axios.delete(
          `${process.env.API_URL}/plugin-player/playlist/${playlist.source_id}`,
          { headers: { Authorization: `Bearer ${zycooToken}` } }
        );
      } catch (zycooErr) {
        console.error('Failed to delete playlist on ZYCOO:', zycooErr.response?.data || zycooErr.message);
      }
    }

    res.status(200).json({ status: 'success', message: 'Playlist deleted successfully' });

  } catch (err) {
    console.error('Error deleting playlist:', err);
    res.status(500).json({ message: 'Failed to delete playlist', error: err.message });
  }
};

