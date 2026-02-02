const db = require('../db');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

exports.controlDevice = async (req, res) => {
  const { speaker_ids, group_id, action, sourceId, hardVolume } = req.body;
  const user_id = req.user?.id;

  if (!action) {
    return res.status(400).json({ message: 'action is required' });
  }

  let speakers = [];
  if (group_id) {
    speakers = await db.any(
      `SELECT s.id, s.speaker_name, s.extension_number 
       FROM speaker_group_members m 
       JOIN speakers s ON m.speaker_id = s.id
       WHERE m.group_id = $1`,
      [group_id]
    );
    if (!speakers.length) {
      return res.status(404).json({ message: 'No speakers found in this group' });
    }
  } else if (speaker_ids && Array.isArray(speaker_ids) && speaker_ids.length > 0) {
    speakers = await db.any(
      'SELECT id, speaker_name, extension_number FROM speakers WHERE id = ANY($1)',
      [speaker_ids]
    );
    if (!speakers.length) {
      return res.status(404).json({ message: 'No speakers found' });
    }
  } else {
    return res.status(400).json({ message: 'Must provide either group_id or speaker_ids' });
  }

  try {
    const extensions = speakers.map(s => s.extension_number.toString());
    const tokenRow = await db.oneOrNone(
      'SELECT token FROM user_tokens ORDER BY created_at DESC LIMIT 1'
    );
    if (!tokenRow) {
      return res.status(401).json({ message: 'No token found in user_tokens' });
    }
    const token = tokenRow.token;
    const payload = { extensions, action };
    if (action === 'play' && sourceId) payload.sourceId = sourceId;
    if (action === 'set-hard-volume' && typeof hardVolume === 'number') payload.hardVolume = hardVolume;
    await axios.put(
      `${process.env.API_URL}/plugin-coopaging/devicecontrol`,
      payload,
      {
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    if (action === 'play' && sourceId) {
      const playlistId = parseInt(sourceId.split('-')[1]);
      const now = new Date();
      const playing = await db.any(
        `SELECT task_id, start_at FROM current_playbacks WHERE status='playing'`
      );
      const oldTasks = playing.filter(p => p.task_id !== playlistId).map(p => p.task_id);
      if (oldTasks.length) {
        const oldPlaybacks = await db.any(
          `SELECT task_id, start_at FROM current_playbacks WHERE status='playing' AND task_id = ANY($1::int[])`,
          [oldTasks]
        );
        await db.none(
          `UPDATE current_playbacks
           SET status='stopped', end_at=$1
           WHERE status='playing' AND task_id = ANY($2::int[])`,
          [now, oldTasks]
        );

        const oldPlaylists = await db.any(
          `SELECT id, name, source_id FROM playlist WHERE source_id = ANY($1::int[])`,
          [oldTasks]
        );

        for (const p of oldPlaylists) {
          const playback = oldPlaybacks.find(pb => pb.task_id === p.source_id);
          const startAtFromDB = playback?.start_at || now;
          try {
            await db.none(
              `INSERT INTO playback_logs (
                date, start_at, end_at, task_type, task_id, task_name, extension_number, user_id
              )
              VALUES ($1, $2, $3, 'playlist', $4, $5, $6, $7)`,
              [
                now.toISOString().split('T')[0],
                startAtFromDB,
                now,
                p.source_id,
                p.name,
                extensions,
                user_id
              ]
            );
          } catch (e) {
            console.error('Failed to insert playback log for old playlist:', e.message);
          }
        }
      }
      const isPlaying = playing.some(p => p.task_id === playlistId);
      if (!isPlaying) {
        await db.none(
          `INSERT INTO current_playbacks 
            (extension_number, group_id, task_type, task_id, start_at, status, current_song_index, elapsed_time, is_paused, volume)
           VALUES 
            ($1::text[], $2, 'playlist', $3, $4, 'playing', 0, 0, false, $5)
           ON CONFLICT (task_id) DO UPDATE
            SET extension_number=$1, group_id=$2, start_at=$4, status='playing', end_at=NULL, current_song_index=0, elapsed_time=0, is_paused=false, volume=$5`,
          [
            extensions,
            group_id || null,
            playlistId,
            now,
            typeof hardVolume === 'number' ? hardVolume : null
          ]
        );
      } else {
        await db.none(
          `UPDATE current_playbacks
           SET extension_number = $1, group_id = $2, volume=$3
           WHERE status='playing' AND task_id = $4`,
          [
            extensions,
            group_id || null,
            typeof hardVolume === 'number' ? hardVolume : null,
            playlistId
          ]
        );
      }
    }
    if (action === 'set-hard-volume' && typeof hardVolume === 'number') {
      await db.none(
        `UPDATE current_playbacks
        SET volume = $1
        WHERE extension_number && $2::text[]`,
        [hardVolume, extensions]
      );
      const io = req.app.get('io');
      const currPlayback = await db.oneOrNone(`
        SELECT * FROM current_playbacks 
        WHERE task_type='playlist' AND status IN ('playing','paused')
      `);
      if (currPlayback && io) {
        io.emit('playback_status', currPlayback);
      }
    }

    res.status(200).json({
      message: 'Success',
      target_count: speakers.length,
      targets: speakers
    });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error', error: err.response?.data || err.message });
  }
};

exports.controlBroadcast = async (req, res) => {
  const { sourceId, action } = req.body;
  const user_id = req.user?.id || null;

  if (!sourceId) return res.status(400).json({ message: 'sourceId is required' });

  const validActions = ['pause', 'next', 'previous'];
  if (!action || !validActions.includes(action)) {
    return res.status(400).json({ message: `Invalid action. Must be one of: ${validActions.join(', ')}` });
  }

  try {
    const tokenRow = await db.oneOrNone('SELECT token FROM user_tokens ORDER BY created_at DESC LIMIT 1');
    if (!tokenRow) return res.status(401).json({ message: 'No token found in user_tokens' });

    const token = tokenRow.token;
    const sourceIdNum = parseInt((sourceId || '').split('-')[1]);
    const playlistRow = await db.oneOrNone(
      'SELECT id FROM playlist WHERE source_id = $1',
      [sourceIdNum]
    );
    if (!playlistRow) return res.status(404).json({ message: 'Playlist not found by this sourceId!' });
    const truePlaylistId = playlistRow.id;
    const playback = await db.oneOrNone(`
      SELECT * FROM current_playbacks WHERE task_type='playlist' AND status='playing' AND task_id=$1
      `, [sourceIdNum]);
    if (!playback) return res.status(404).json({ message: 'No playlist playback found!' });
    const zycooResp = await axios.put(
      `${process.env.API_URL}/plugin-coopaging/castcontrol/${sourceId}`,
      { action },
      {
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    let songCount = 0;
    try {
      const r = await db.one(`
        SELECT COUNT(*)::int AS count FROM playlist_item WHERE playlist_id=$1
      `, [truePlaylistId]);
      songCount = r.count || 0;
    } catch (e) {
      songCount = 0;
    }
    let newSongIndex = playback.current_song_index || 0;
    if (action === "pause") {
      await db.none(`
        UPDATE current_playbacks SET is_paused = NOT is_paused WHERE id=$1
      `, [playback.id]);
    } else if (action === "next") {
      newSongIndex = (newSongIndex + 1) % (songCount || 1);
      await db.none(`
        UPDATE current_playbacks SET current_song_index=$1, elapsed_time=0, is_paused=false WHERE id=$2
      `, [newSongIndex, playback.id]);
    } else if (action === "previous") {
      newSongIndex = (newSongIndex - 1 + songCount) % (songCount || 1);
      await db.none(`
        UPDATE current_playbacks SET current_song_index=$1, elapsed_time=0, is_paused=false WHERE id=$2
      `, [newSongIndex, playback.id]);
    }
    console.log('DEBUG:', { 
      sourceId, 
      sourceIdNum, 
      truePlaylistId, 
      action, 
      songCount, 
      newSongIndex, 
      playbackId: playback.id 
    });
try {
  const io = req.app.get('io');
  const currPlayback = await db.oneOrNone(`
    SELECT * FROM current_playbacks WHERE task_type='playlist' AND status IN ('playing','paused')
  `);
  if (currPlayback && io) {
    io.emit('playback_status', currPlayback);
  }
} catch (e) {
  console.error("Websocket emit error: ", e.message);
}
    res.status(200).json({
      message: `Broadcast action '${action}' executed successfully`,
      zycooResponse: zycooResp.data,
      dbPlayback: { id: playback.id, current_song_index: newSongIndex }
    });
  } catch (err) {
    console.error('Error controlling broadcast:', err.response?.data || err.message);
    res.status(500).json({ message: 'Internal server error', error: err.response?.data || err.message });
  }
};