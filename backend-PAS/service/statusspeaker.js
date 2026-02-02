const axios = require('axios');
const db = require('../db');
const dotenv = require('dotenv');

dotenv.config();

async function updateSpeakersStatus() {
  try {
    const tokenResult = await db.oneOrNone(
      'SELECT token, created_at FROM user_tokens ORDER BY created_at DESC LIMIT 1'
    );

    if (!tokenResult) {
      console.log('No API token found. Cannot update speakers.');
      return;
    }

    const now = new Date();
    const response = await axios.get(
      `${process.env.API_URL}/plugin-asterisk/extension/extension-hints-status`,
      {
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${tokenResult.token}`,
        },
      }
    );

    if (response.data.status !== 'success') {
      console.error('Failed to fetch speaker statuses');
      return;
    }

    const statuses = response.data.data;
    const nowMs = now.getTime();
    let anyUpdate = false;

    for (const ext of statuses) {
      const result = await db.oneOrNone(
        'SELECT last_status_update FROM speakers WHERE extension_number = $1',
        [ext.Exten]
      );
      if (
        !result?.last_status_update || 
        result.is_online !== (ext.Status === "0")
      ) {
        anyUpdate = true;
        const isOnline = ext.Status === "0";
        await db.none(
          `UPDATE speakers 
          SET is_online = $1, last_status_update = NOW() 
          WHERE extension_number = $2`,
          [isOnline, ext.Exten]
        );
      }
    }

    console.log(anyUpdate ? 'Speakers status updated.' : 'No update needed.');
  } catch (err) {
    console.error('Error updating speakers status:', err.message);
  }
}

setInterval(updateSpeakersStatus, 1 * 60 * 1000);

module.exports = updateSpeakersStatus;
