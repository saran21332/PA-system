const db = require('../db');
const { DateTime } = require('luxon');
const dotenv = require('dotenv');
dotenv.config();

async function updateCurrentPlaybacks() {
  try {
    const now = DateTime.local();
    const nowDate = now.toFormat('yyyy-MM-dd');
    const nowTime = now.toFormat('HH:mm:ss');
    const weekdayNames = [null, 'mon', 'tues', 'wed', 'thur', 'fri', 'sat', 'sun'];
    const nowWeekdayStr = weekdayNames[now.weekday];
    console.log('nowWeekdayStr:', nowWeekdayStr, 'nowDate:', nowDate, 'nowTime:', nowTime);
    const playingTasks = await db.any(`
      SELECT *
      FROM task
      WHERE task_type IN ('schedule','calendar')
        AND $1 = ANY(week_days)
        AND (start_date IS NULL OR start_date <= $2)
        AND (end_date IS NULL OR end_date >= $2)
        AND start_time <= $3
        AND end_time > $3
    `, [nowWeekdayStr, nowDate, nowTime]);
    console.log('playingTasks:', playingTasks);
    for (const task of playingTasks) {
      const extArray = task.extensions;
      const startAt = DateTime.fromFormat(nowDate + ' ' + task.start_time.slice(0,5), 'yyyy-MM-dd HH:mm').toISO();
      const expectedEndAt = DateTime.fromFormat(nowDate + ' ' + task.end_time.slice(0,5), 'yyyy-MM-dd HH:mm').toISO();
      const exist = await db.oneOrNone(`
        SELECT id FROM current_playbacks
        WHERE extension_number = $1
          AND task_id = $2
          AND status = 'playing'
      `, [extArray, task.id]);
      if (exist) {
        console.log('[Update current_playbacks]', extArray, task.task_type, task.id, startAt, expectedEndAt);
        await db.none(`
          UPDATE current_playbacks
          SET
            task_type = $1,
            start_at = $2,
            end_at   = $3
          WHERE id = $4
        `, [task.task_type, startAt, expectedEndAt, exist.id]);
      } else {
        console.log('[Insert current_playbacks]', extArray, task.task_type, task.id, startAt, expectedEndAt);
        await db.none(`
          INSERT INTO current_playbacks
            (extension_number, task_type, task_id, status, start_at, end_at)
          VALUES
            ($1, $2, $3, 'playing', $4, $5)
        `, [extArray, task.task_type, task.id, startAt, expectedEndAt]);
      }
    }
    const playingRows = await db.any(`
      SELECT * FROM current_playbacks 
      WHERE status = 'playing' AND task_type IN ('schedule','calendar')
    `);
    for (const row of playingRows) {
      const found = playingTasks.find(
        t => t.id === row.task_id && JSON.stringify(t.extensions) === JSON.stringify(row.extension_number)
      );
      if (!found) {
        let taskInfo = await db.oneOrNone(`SELECT id, name, user_id FROM task WHERE id = $1`, [row.task_id]);
        if (!taskInfo) taskInfo = { name: '', user_id: null };

        const endAt = row.end_at ? row.end_at : now.toISO();
        const dateStr = row.start_at 
          ? DateTime.fromJSDate(new Date(row.start_at)).toFormat('yyyy-MM-dd') 
          : nowDate;

        console.log('Insert playback_logs (schedule/calendar):', {
          date: dateStr,
          start_at: row.start_at,
          end_at: endAt,
          task_type: row.task_type,
          task_id: row.task_id,
          task_name: taskInfo.name,
          extension_number: row.extension_number,
          user_id: taskInfo.user_id
        });
        await db.none(`
          INSERT INTO playback_logs
            (date, start_at, end_at, task_type, task_id, task_name, extension_number, user_id)
          VALUES
            ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
          dateStr,
          row.start_at,
          endAt,
          row.task_type,
          row.task_id,
          taskInfo.name,
          row.extension_number,
          taskInfo.user_id
        ]);
        await db.none(`
          UPDATE current_playbacks
          SET status = 'stopped', end_at = $1
          WHERE id = $2 AND status = 'playing'
        `, [endAt, row.id]);
      }
    }
    console.log(`[${now.toFormat('yyyy-MM-dd HH:mm:ss')}] Current playback + logs updated`);
  } catch (err) {
    console.error('Error in updateCurrentPlaybacks:', err.message, err.stack);
  }
}

setInterval(updateCurrentPlaybacks, 10 * 1000);

module.exports = updateCurrentPlaybacks;
