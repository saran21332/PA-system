const db = require('../db');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

exports.announce = async (req, res) => {
  const { speaker_id, speaker_ids, group_id } = req.body;
  const user_id = req.user?.id;

  try {
    let speakers = [];
    let actual_group_id = group_id || null;

    if (speaker_ids?.length) {
      speakers = await db.any(
        'SELECT id, speaker_name, extension_number FROM speakers WHERE id = ANY($1)',
        [speaker_ids]
      );
      if (!speakers.length) return res.status(404).json({ message: 'No speakers found' });
    } else if (speaker_id) {
      const s = await db.oneOrNone(
        'SELECT id, speaker_name, extension_number FROM speakers WHERE id=$1',
        [speaker_id]
      );
      if (!s) return res.status(404).json({ message: 'dont found speaker' });
      speakers = [s];
    } else if (group_id) {
      speakers = await db.any(
        `SELECT s.id, s.speaker_name, s.extension_number
         FROM speaker_group_members m
         JOIN speakers s ON m.speaker_id = s.id
         WHERE m.group_id=$1`,
        [group_id]
      );
      if (!speakers.length) return res.status(404).json({ message: 'dont found speaker in group' });
    } else {
      return res.status(400).json({ message: 'please enter speaker_id, speaker_ids, or group_id' });
    }

    const tokenRow = await db.oneOrNone(`SELECT token FROM user_tokens ORDER BY created_at DESC LIMIT 1`);
    if (!tokenRow) return res.status(401).json({ message: 'No token found in user_tokens' });

    const extensions = speakers.map(s => s.extension_number.toString());
    await axios.post(
      `${process.env.API_URL}/plugin-asterisk/paging/click-paging`,
      { dst: extensions },
      { headers: { accept: 'application/json', Authorization: `Bearer ${tokenRow.token}` } }
    );

    const now = new Date();
    await db.none(
      `
      DELETE FROM current_playbacks 
      WHERE status='playing' 
        AND task_type='announce'
        AND (group_id = $1 OR extension_number && $2::text[])
      `,
      [actual_group_id, extensions]
    );
    await db.none(
      `INSERT INTO current_playbacks 
        (extension_number, group_id, task_type, task_id, start_at, status)
       VALUES ($1, $2, 'announce', NULL, $3, 'playing')`,
      [extensions, actual_group_id, now]
    );
    await db.none(
      `INSERT INTO playback_logs 
        (date, start_at, end_at, task_type, task_id, task_name, extension_number, user_id, group_name)
       VALUES ($1, $2, NULL, $3, NULL, NULL, $4, $5, NULL)`,
      [now.toISOString().split('T')[0], now, 'announce', `{${extensions.join(',')}}`, user_id]
    );
    try {
  const io = req.app.get('io');
  // ดึง status ล่าสุดเพื่อ broadcast
  const currAnnounce = await db.oneOrNone(
    `SELECT * FROM current_playbacks WHERE task_type='announce' AND status='playing'`
  );
  if (currAnnounce && io) {
    io.emit('announce_status', currAnnounce); // ใช้ชื่อ event 'announce_status'
  }
} catch(e) {
  console.error('Websocket emit error (announce):', e.message);
}
    res.status(200).json({ message: 'success', target_count: extensions.length, targets: speakers });
  } catch (err) {
    console.error('Error announcing:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};

exports.stopAnnounce = async (req, res) => {
  try {
    const tokenRow = await db.oneOrNone(`SELECT token FROM user_tokens ORDER BY created_at DESC LIMIT 1`);
    if (!tokenRow) return res.status(401).json({ message: 'No token found in user_tokens' });

    const extensions = ['2004'];
    await axios.post(
      `${process.env.API_URL}/plugin-asterisk/extension/hangup`,
      { extensions },
      { headers: { accept: 'application/json', Authorization: `Bearer ${tokenRow.token}` } }
    );

    const now = new Date();
    await db.none(
      `UPDATE current_playbacks 
   SET status='stopped', end_at=$1 
   WHERE status='playing' AND task_type='announce'`,
      [now]
    )
    for (const ext of extensions) {
      await db.none(
        `UPDATE playback_logs 
   SET end_at=$1 
   WHERE end_at IS NULL AND task_type='announce'`,
        [now]
      );
    }
    try {
  const io = req.app.get('io');
  io.emit('announce_status', null);
} catch(e) {
  console.error('Websocket emit error (stopAnnounce):', e.message);
}

    res.status(200).json({ message: 'Successfully stopped announcement' });
  } catch (err) {
    console.error('Error stopping announcement:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};
