import { Pool } from 'pg';

export const pool = new Pool({
 connectionString: process.env.DATABASE_URL || 'postgres://postgres:password@db:5432/postgres'
});
