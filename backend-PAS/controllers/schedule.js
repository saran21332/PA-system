const db = require('../db');
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

exports.getTaskList = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const userRow = await db.oneOrNone(
      'SELECT id_zycootoken FROM "users" WHERE id=$1', [userId]
    );
    if (!userRow) return res.status(400).json({ message: 'User not found' });

    const zycooUserId = userRow.id_zycootoken;
    const tokenRow = await db.oneOrNone(
      `SELECT token FROM user_tokens WHERE userid = $1 ORDER BY created_at DESC LIMIT 1`,
      [zycooUserId]
    );
    if (!tokenRow) return res.status(400).json({ message: 'No token found' });
    const zycooToken = tokenRow.token;
    const dbTasks = await db.any('SELECT id, task_type FROM task');
    const myTaskIds = dbTasks.map(row => String(row.id));
    const taskTypeMap = {};
    dbTasks.forEach(row => {
      taskTypeMap[String(row.id)] = row.task_type;
    });

    if (myTaskIds.length === 0) {
      return res.json({ count: 0, rows: [] });
    }

    const zycooRes = await axios.get(
      `${process.env.API_URL}/plugin-coopaging/task?limit=100&page=1`,
      {
        headers: {
          Authorization: `Bearer ${zycooToken}`,
          accept: 'application/json'
        }
      }
    );
    let zycooRows = zycooRes.data.rows || [];
    const filteredRows = zycooRows
      .filter(task => myTaskIds.includes(String(task.id)))
      .map(task => ({
        ...task,
        task_type: taskTypeMap[String(task.id)] || null
      }));

    res.json({ count: filteredRows.length, rows: filteredRows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createSchedule = async (req, res) => {
  const { name, playlistId, extensions, timeRange, weekDays } = req.body;
  const userId = req.user.id;

  if (!playlistId || !Array.isArray(extensions) || extensions.length === 0 || !Array.isArray(weekDays) || weekDays.length === 0) {
    return res.status(400).json({ message: 'request is Invalid' });
  }

 if (timeRange[0] >= timeRange[1]) {
    return res.status(400).json({ message: 'Start time should be before end time' });
  }

  try {
    const tokenRow = await db.oneOrNone(
      'SELECT token FROM user_tokens ORDER BY created_at DESC LIMIT 1'
    );
    if (!tokenRow) return res.status(401).json({ message: 'No token found in user_tokens' });
    const token = tokenRow.token;
    const today = new Date().toISOString().slice(0, 10);
    const overlap = await db.oneOrNone(
      `SELECT 1 FROM task
       WHERE task_type IN ('schedule', 'calendar')
         AND extensions && $1::text[]
         AND week_days && $2::text[]
         AND (
              (start_date IS NULL OR start_date <= $3::date)
              AND (end_date IS NULL OR end_date >= $4::date)
         )
         AND NOT (end_time <= $5::time OR start_time >= $6::time)
       LIMIT 1`,
      [
        extensions,
        weekDays,
        today, 
        today,
        timeRange[0],
        timeRange[1],
      ]
    );

    if (overlap) {
      return res.status(400).json({
        message: `ไม่สามารถใช้ช่วงเวลา ${timeRange[0]}-${timeRange[1]} ของวัน${weekDays.join(', ')} ได้ เพราะมีการตั้งเวลาอื่นอยู่แล้ว`
      });
    }

    const taskName = name?.trim() || `schedule-${playlistId}`;
    const taskPayload = {
      task: {
        enable: "yes",
        name: taskName,
        type: "timerule",
        paging_type: "normal",
        sound_type: "music",
        source_info: { sourceId: playlistId },
        extensions,
        conditions: { mode: "loop", time: timeRange, weekDays },
      }
    };

    const zycooRes = await axios.post(
      `${process.env.API_URL}/plugin-coopaging/task`,
      taskPayload,
      {
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const task = zycooRes.data;

    await db.none(
      `INSERT INTO task (
        id, name, source_id, extensions, start_time, end_time,
        week_days, volume, task_type, user_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        task.id,
        task.name,
        task.source_info.sourceId,
        extensions,
        timeRange[0],
        timeRange[1],
        weekDays,
        task.volume,
        'schedule',
        userId 
      ]
    );

    res.status(201).json({ message: 'Schedule created successfully', zycooResponse: task });

  } catch (err) {
    console.error('Create schedule error:', err.response?.data || err.message);
    res.status(500).json({
      message: 'Failed to create schedule',
      error: err.response?.data || err.message
    });
  }
};

exports.createCalendar = async (req, res) => {
  const { name, playlistId, extensions, timeRange, dates, weekDays } = req.body;
  const userId = req.user.id;

  if (
    !playlistId ||
    !Array.isArray(extensions) || extensions.length === 0 ||
    !Array.isArray(dates) || dates.length !== 2 ||
    !Array.isArray(weekDays) || weekDays.length === 0
  ) {
    return res.status(400).json({ message: 'request is Invalid' });
  }

  if (timeRange[0] >= timeRange[1]) {
    return res.status(400).json({ message: 'Start time should be before end time' });
  }

  try {
    const tokenRow = await db.oneOrNone(
      'SELECT token FROM user_tokens ORDER BY created_at DESC LIMIT 1'
    );
    if (!tokenRow) return res.status(401).json({ message: 'No token found' });
    const token = tokenRow.token;

    const overlap = await db.oneOrNone(
      `SELECT 1 FROM task
        WHERE task_type IN ('schedule', 'calendar')
          AND extensions && $1::text[]
          AND week_days && $2::text[]
          AND ( (start_date IS NULL OR start_date <= $3::date)
                AND (end_date IS NULL OR end_date >= $4::date) )
          AND NOT (end_time <= $5::time OR start_time >= $6::time)
        LIMIT 1`,
      [
        extensions,
        weekDays,
        dates[1],
        dates[0],
        timeRange[0],
        timeRange[1],
      ]
    );

    if (overlap) {
      return res.status(400).json({
        message: `ไม่สามารถใช้ช่วงเวลา ${timeRange[0]}-${timeRange[1]} ของวัน${weekDays.join(', ')} ได้ เพราะมีการตั้งเวลาอื่นอยู่แล้ว`});
    }

    const taskName = name?.trim() || `calendar-${playlistId}`;
    const taskPayload = {
      task: {
        enable: "yes",
        name: taskName,
        type: "timerule",
        paging_type: "normal",
        sound_type: "music",
        source_info: { sourceId: playlistId },
        extensions,
        conditions: {
          mode: "loop",
          date: dates,
          time: timeRange,
          weekDays: weekDays
        },
      }
    };

    const zycooRes = await axios.post(
      `${process.env.API_URL}/plugin-coopaging/task`,
      taskPayload,
      {
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const task = zycooRes.data;

    await db.none(
      `INSERT INTO task (
        id, name, source_id, extensions, start_time, end_time,
        start_date, end_date, week_days, volume, task_type, user_id
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
      [
        task.id,
        task.name,
        task.source_info.sourceId,
        extensions,
        timeRange[0],
        timeRange[1],
        dates[0],
        dates[1],
        weekDays,
        task.volume,
        'calendar',
        userId 
      ]
    );

    res.status(201).json({ message: 'Calendar schedule created', zycooResponse: task });

  } catch (err) {
    console.error('Create calendar schedule error:', err.response?.data || err.message);
    res.status(500).json({
      message: 'Failed to create calendar',
      error: err.response?.data || err.message
    });
  }
};

exports.deleteTask = async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "id are require" });
  }

  try {
    const tokenRow = await db.oneOrNone(
      'SELECT token FROM user_tokens ORDER BY created_at DESC LIMIT 1'
    );
    if (!tokenRow) return res.status(401).json({ message: 'No token found' });
    const token = tokenRow.token;

    await axios.delete(
      `${process.env.API_URL}/plugin-coopaging/task/${id}`,
      {
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${token}`
        }
      }
    );
    await db.none('DELETE FROM task WHERE id = $1', [id]);

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error('Delete Task Error:', err.response?.data || err.message);
    res.status(500).json({
      message: 'Failed to delete Task',
      error: err.response?.data || err.message
    });
  }
}