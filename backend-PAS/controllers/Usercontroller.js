const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db'); 

exports.createUser = async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ 
      message: 'Username and password are required' 
    });
  }

  try {
    const existingUserQuery = `SELECT id FROM users WHERE username = $1 LIMIT 1`;
    const existingUser = await db.oneOrNone(existingUserQuery, [username]);    
    if (existingUser) {
      return res.status(409).json({ 
        message: 'Username already exists' 
      });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const insertSql = `
      INSERT INTO users (username, password)
      VALUES ($1, $2)
      RETURNING id, username
    `;
    const result = await db.one(insertSql, [username, password_hash,]);

    res.status(201).json({ 
      message: 'User created successfully',
      res: {
        id: result.id,
        username: result.username,
      }
    });

  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ 
      message: 'Internal server error',
      error: err.message
    });
  }
};

const MAX_ATTEMPTS = 10;
const COOLDOWN_MINUTES = 5;

exports.login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    const userQuery = `
      SELECT id, username, password, failed_attempts, last_failed 
      FROM users WHERE username = $1 LIMIT 1`;
    const user = await db.oneOrNone(userQuery, [username]);

    if (!user) {
      return res.status(401).json({ message: 'Username not found' });
    }

    if (user.failed_attempts >= MAX_ATTEMPTS) {
      const lastFailed = new Date(user.last_failed);
      const now = new Date();
      const diff = (now - lastFailed) / 1000 / 60;
      if (diff < COOLDOWN_MINUTES) {
        return res.status(429).json({
          message: `Too many failed attempts. Please wait ${Math.ceil(
            COOLDOWN_MINUTES - diff
          )} minute(s).`
        });
      } else {
        await db.none(
          `UPDATE users SET failed_attempts = 0 WHERE id = $1`,
          [user.id]
        );
      }
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      await db.none(
        `UPDATE users 
         SET failed_attempts = failed_attempts + 1, last_failed = NOW() 
         WHERE id = $1`,
        [user.id]
      );
      return res.status(401).json({ message: 'Invalid password' });
    }
    await db.none(
      `UPDATE users SET failed_attempts = 0 WHERE id = $1`,
      [user.id]
    );

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    await db.none(`UPDATE users SET token = $1 WHERE id = $2`, [token, user.id]);

    res.status(200).json({
      message: 'Login successful',
      res: { id: user.id, username: user.username, token }
    });

  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};

exports.logout = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    await db.none(`UPDATE users SET token = NULL WHERE id = $1`, [decoded.id]);

    res.status(200).json({ message: 'Logout successful' });
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};


exports.getPlaybackLogs = async (req, res) => {
  try {
    const logs = await db.any(`
      SELECT 
        l.id,
        l.date,
        l.start_at,
        l.end_at,
        l.task_type,
        l.task_id,
        l.task_name,
        l.extension_number,
        l.user_id,
        u.username,
        l.group_name
      FROM playback_logs l
      LEFT JOIN users u ON l.user_id = u.id
      ORDER BY l.start_at DESC
    `);
    const speakers = await db.any(`SELECT speaker_code, extension_number FROM speakers`);
    const logsWithSpeakerCode = logs.map(l => {
      const speakerCodes = (l.extension_number || []).map(ext => {
        const sp = speakers.find(s => s.extension_number === ext);
        return sp ? sp.speaker_code : ext; 
      });

      const dateThai = new Date(l.date)
        .toLocaleDateString('th-TH', { timeZone: 'Asia/Bangkok' })
        .split(' ')[0];
      const startAtThai = new Date(l.start_at)
        .toLocaleTimeString('th-TH', { timeZone: 'Asia/Bangkok' });
      const endAtThai = new Date(l.end_at)
        .toLocaleTimeString('th-TH', { timeZone: 'Asia/Bangkok' });

      return {
        ...l,
        date: dateThai,
        start_at: startAtThai,
        end_at: endAtThai,
        speaker_code: speakerCodes 
      };
    });

    res.status(200).json({ message: 'Playback logs fetched successfully', res: logsWithSpeakerCode });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};

exports.deletePlaybackLogs = async (req, res) => {
  const { id } = req.body;
  if (!Array.isArray(id) || id.length === 0) {
    return res.status(400).json({ message: 'Must provide array of ids to delete' });
  }
  try {
    const result = await db.result(
      'DELETE FROM playback_logs WHERE id IN ($1:csv)',
      [id]
    );
    res.status(200).json({ message: `Deleted ${result.rowCount} logs` });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};

exports.clearPlaybackLogs = async (req, res) => {
  try {
    await db.none('TRUNCATE TABLE playback_logs RESTART IDENTITY');
    res.status(200).json({ message: 'All logs cleared successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};
