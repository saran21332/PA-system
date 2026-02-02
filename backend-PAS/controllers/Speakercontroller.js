const db = require('../db');

exports.getAllSpeakers = async (req, res) => {
  try {
    const query = `
      SELECT *
      FROM speakers
      ORDER BY speaker_name
    `;

    const speakers = await db.any(query);

    res.status(200).json({
      message: 'All speakers retrieved successfully',
      data: speakers
    });

  } catch (err) {
    console.error('Error getting all speakers:', err);
    res.status(500).json({ 
      message: 'Internal server error',
      error: err.message 
    });
  }
};

exports.createSpeakerGroup = async (req, res) => {
  const { group_name, speaker_id = [] } = req.body;
  try {
    const group = await db.one(
      `INSERT INTO speaker_groups (group_name) 
       VALUES ($1) 
       RETURNING id, group_name, created_at`,
      [group_name]
    );

    if (speaker_id.length > 0) {
      const values = speaker_id.map(sid => `(${group.id}, ${sid})`).join(',');
      await db.none(`
        INSERT INTO speaker_group_members (group_id, speaker_id) 
        VALUES ${values}
        ON CONFLICT (group_id, speaker_id) DO NOTHING
      `);
    }

    const speakers = await db.any(
      `SELECT s.id, s.speaker_name, s.is_online
       FROM speakers s
       JOIN speaker_group_members m ON s.id = m.speaker_id
       WHERE m.group_id = $1`,
      [group.id]
    );

    res.status(201).json({
      message: 'Speaker group created successfully',
      data: {
        ...group,
        speakers,
        speaker_count: speakers.length
      }
    });

  } catch (err) {
    console.error('Error creating speaker group:', err);
    res.status(500).json({
      message: 'Internal server error',
      error: err.message
    });
  }
};

exports.updateSpeakerGroup = async (req, res) => {
  const { id, group_name, speaker_id = [] } = req.body;

  if (!id) {
    return res.status(400).json({ message: 'Group id is required' });
  }

  try {
    const updatedGroup = await db.oneOrNone(
      `UPDATE speaker_groups 
       SET group_name = $1
       WHERE id = $2
       RETURNING id, group_name, created_at`,
      [group_name, id]
    );

    if (!updatedGroup) {
      return res.status(404).json({ message: 'Speaker group not found' });
    }

    await db.none(
      'DELETE FROM speaker_group_members WHERE group_id = $1',
      [id]
    );

    if (speaker_id.length > 0) {
      const values = speaker_id.map(sid => `(${id}, ${sid})`).join(',');
      await db.none(`
        INSERT INTO speaker_group_members (group_id, speaker_id)
        VALUES ${values}
        ON CONFLICT (group_id, speaker_id) DO NOTHING
      `);
    }

    res.status(200).json({
      message: 'Speaker group updated successfully',
      data: updatedGroup
    });

  } catch (err) {
    console.error('Error updating speaker group:', err);
    res.status(500).json({
      message: 'Internal server error',
      error: err.message
    });
  }
};

exports.getAllSpeakerGroups = async (req, res) => {
  try {
    const query = `
      SELECT 
        g.id,
        g.group_name,
        g.created_at,
        COUNT(m.speaker_id) AS speaker_count,
        COALESCE(
          json_agg(
            json_build_object(
              'id', s.id,
              'name', s.speaker_name,
              'is_online', s.is_online,
              'speaker_code', s.speaker_code,
              'extension_number', s.extension_number
            )
          ) FILTER (WHERE s.id IS NOT NULL),
          '[]'
        ) AS speakers
      FROM speaker_groups g
      LEFT JOIN speaker_group_members m ON g.id = m.group_id
      LEFT JOIN speakers s ON m.speaker_id = s.id
      GROUP BY g.id
      ORDER BY g.group_name;
    `;

    const groups = await db.any(query);

    res.status(200).json({
      message: 'Speaker groups retrieved successfully',
      data: groups
    });
  } catch (err) {
    console.error('Error getting speaker groups:', err);
    res.status(500).json({
      message: 'Internal server error',
      error: err.message
    });
  }
};

exports.deleteSpeakerGroup = async (req, res) => {
  const { id } = req.body;

  try {
    const result = await db.result(
      'DELETE FROM speaker_groups WHERE id = $1',
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Speaker group not found' });
    }

    res.status(200).json({
      message: 'Speaker group deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting speaker group:', err);
    res.status(500).json({
      message: 'Internal server error',
      error: err.message
    });
  }
};