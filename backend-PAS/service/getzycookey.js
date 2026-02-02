const axios = require('axios');
const dotenv = require('dotenv');
const qs = require('qs');
const db = require('../db');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dotenv.config();
dayjs.extend(utc);
dayjs.extend(timezone);

async function loginAndSaveToken() {
  try {
    const timeZone = 'Asia/Bangkok';
    const currentTime = dayjs().tz(timeZone);
    const loginResponse = await axios.post(`${process.env.API_URL}/local/login`, qs.stringify({
      username: process.env.API_USERNAME,
      password: process.env.API_PASSWORD
    }), {
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (loginResponse.data.status !== 'success') {
      console.error('Authentication failed.');
      return;
    }
    const { userId, token } = loginResponse.data;
    const result = await db.oneOrNone('SELECT * FROM user_tokens WHERE userId = $1', [userId]);

    if (result) {
      const { created_at } = result;
      const createdAt = dayjs(created_at).tz(timeZone);
      const isStillValid = currentTime.isBefore(createdAt.add(6, 'hour'));
      if (isStillValid) {
        console.log('Token is still valid. No need to update.');
        return;
      }
    }

    const currentBangkokTime = currentTime.format('YYYY-MM-DDTHH:mm:ssZ');
    await db.none(
      `
        INSERT INTO user_tokens(userId, token, created_at)
        VALUES($1, $2, $3)
        ON CONFLICT (userId)
        DO UPDATE SET token = EXCLUDED.token, created_at = EXCLUDED.created_at;
      `,
      [userId, token, currentBangkokTime]
    );
    console.log('Token saved or updated successfully.');
  } catch (error) {
    console.error('Error during login:', error);
  }
}

module.exports = loginAndSaveToken;