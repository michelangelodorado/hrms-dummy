import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({
  host: process.env.PGHOST || 'localhost',
  user: process.env.PGUSER || 'hrms',
  password: process.env.PGPASSWORD || 'hrmspass',
  database: process.env.PGDATABASE || 'hrms_db',
  port: Number(process.env.PGPORT || 5432)
});

export const query = (text, params) => pool.query(text, params);
