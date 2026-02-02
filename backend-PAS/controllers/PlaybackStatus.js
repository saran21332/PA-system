const db = require('../db');
const dotenv = require('dotenv');

dotenv.config();

exports.getPlaybackStatus = async (req, res) => {
  try {
    const row = await db.oneOrNone(
      `SELECT * FROM current_playbacks 
       WHERE task_type='playlist' AND status IN ('playing','paused')`
    );
    res.json(row || {});
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updatePlaybackStatus = async (req, res) => {
  const { 
    playlistId, 
    current_song_index, 
    elapsed_time, 
    is_paused, 
    is_playing, 
    group_id, 
    extension_number 
  } = req.body;

  if (!playlistId) {
    return res.status(400).json({ message: "playlistId is required" });
  }

  try {
    await db.none(
      `UPDATE current_playbacks
       SET 
         current_song_index = COALESCE($1, current_song_index),
         elapsed_time = COALESCE($2, elapsed_time),
         is_paused = COALESCE($3, is_paused),
         status = COALESCE($4, status),
         group_id = COALESCE($5, group_id),
         extension_number = COALESCE($6, extension_number)
       WHERE task_id = $7 AND task_type='playlist'`,
      [
        current_song_index,
        elapsed_time,
        is_paused,
        typeof is_playing === 'boolean' ? (is_playing ? 'playing' : 'stopped') : null,
        group_id,
        extension_number,
        playlistId
      ]
    );
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
    res.json({ message: "Playback status updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
