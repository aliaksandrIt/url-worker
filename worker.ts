import axios from 'axios';
import { pool } from './db/db';

const CONCURRENCY_LIMIT = 10;

async function fetchAndLockTasks(limit: number): Promise<{id: number; url: string}[]> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const selectResult = await client.query(
      `SELECT id, url
       FROM tasks
       WHERE status = 'NEW'
       ORDER BY id
       LIMIT $1
       FOR UPDATE SKIP LOCKED`,
      [limit]
    );
    const tasks = selectResult.rows;
    if (tasks.length === 0) {
      await client.query('COMMIT');
      return [];
    }

    const ids = tasks.map((t) => t.id);
    await client.query(
      `UPDATE tasks
       SET status = 'PROCESSING'
       WHERE id = ANY($1::int[])`,
      [ids]
    );

    await client.query('COMMIT');
    return tasks;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function updateTask(id: number, status: string, httpCode?: number | null) {
  const client = await pool.connect();
  try {
    await client.query(
      `UPDATE tasks
       SET status = $1,
           http_code = $2
       WHERE id = $3`,
      [status, httpCode ?? null, id]
    );
  } finally {
    client.release();
  }
}

async function processBatch() {
  const tasks = await fetchAndLockTasks(CONCURRENCY_LIMIT);
  if (tasks.length === 0) {
    return;
  }

  const promises = tasks.map(async (task) => {
    const { id, url } = task;
    try {
      const response = await axios.get(url);
      await updateTask(id, 'DONE', response.status);
      console.log(`[DONE] ID=${id}, URL=${url}, code=${response.status}`);
    } catch (error: any) {
      let httpCode = null;
      if (error.response && error.response.status) {
        httpCode = error.response.status;
      }
      await updateTask(id, 'ERROR', httpCode);
      console.error(`[ERROR] ID=${id}, URL=${url}, code=${httpCode ?? 'n/a'}`);
    }
  });

  await Promise.all(promises);
}

const INTERVAL_MS = 5000; // Every 5 seconds

async function main() {
  console.log('Worker started. Press Ctrl+C to stop.');
  setInterval(async () => {
    try {
      await processBatch();
    } catch (err) {
      console.error('Error processing batch:', err);
    }
  }, INTERVAL_MS);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
