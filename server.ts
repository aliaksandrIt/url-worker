import express, { Request, Response, NextFunction } from 'express';
import { pool } from './db/db';
import migrate  from 'node-pg-migrate';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/tasks', async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { rows } = await client.query(`
      SELECT id, url, status, http_code
      FROM tasks
      ORDER BY id
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error getting tasks list');
  } finally {
    client.release();
  }
});

app.post('/tasks', async (req: Request, res: Response) => {
  const { url } = req.body;
  if (!url) {
     res.status(400).send('Необходимо передать url');
  }
  const client = await pool.connect();
  try {
    const insertResult = await client.query(
      `INSERT INTO tasks (url, status)
       VALUES ($1, 'NEW')
       RETURNING id, url, status, http_code`,
      [url]
    );
    res.status(201).json(insertResult.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка при добавлении задачи');
  } finally {
    client.release();
  }
});

app.post('/reset-db', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const databaseUrl =
      process.env.DATABASE_URL ||
      'postgres://postgres:password@localhost:5432/postgres';

    await migrate({
      direction: 'down',
      databaseUrl,
      migrationsTable: 'pgmigrations',
      dir: 'migrations',
    });

    await migrate({
      direction: 'up',
      databaseUrl,
      migrationsTable: 'pgmigrations',
      dir: 'migrations',
    });

    res.status(200).send('Done');
  } catch (err) {
    console.error('Error:', err);
    next(err);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
