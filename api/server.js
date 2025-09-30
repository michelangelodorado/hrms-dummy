import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { query } from './db.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || '*' }));

// Ensure table exists (idempotent)
async function ensureSchema() {
  await query(`
    CREATE TABLE IF NOT EXISTS employees (
      id SERIAL PRIMARY KEY,
      first_name VARCHAR(50) NOT NULL,
      last_name VARCHAR(50) NOT NULL,
      nric VARCHAR(12) NOT NULL,
      email VARCHAR(120) NOT NULL,
      phone VARCHAR(32),
      dob DATE,
      address TEXT,
      position VARCHAR(100),
      department VARCHAR(100),
      date_of_joining DATE,
      salary INTEGER,
      employment_type VARCHAR(32),
      manager VARCHAR(100)
    );
  `);
}

app.get('/api/health', (_, res) => res.json({ ok: true }));

// GET /api/employees?q=...
app.get('/api/employees', async (req, res) => {
  const { q } = req.query;
  let sql = 'SELECT * FROM employees';
  const params = [];
  if (q && q.trim() !== '') {
    params.push(`%${q}%`);
    sql += ` WHERE first_name ILIKE $1 OR last_name ILIKE $1 OR nric ILIKE $1 
             OR email ILIKE $1 OR position ILIKE $1 OR department ILIKE $1`;
  }
  sql += ' ORDER BY id';
  const { rows } = await query(sql, params);
  res.json(rows);
});

// POST /api/employees
app.post('/api/employees', async (req, res) => {
  const {
    first_name, last_name, nric, email, phone, dob, address,
    position, department, date_of_joining,
    salary, employment_type, manager
  } = req.body || {};

  if (!first_name || !last_name || !nric || !email) {
    return res.status(400).json({ error: 'first_name, last_name, nric, and email are required' });
  }
  const { rows } = await query(
    `INSERT INTO employees
     (first_name, last_name, nric, email, phone, dob, address, position, department, date_of_joining, salary, employment_type, manager)
     VALUES ($1,$2,$3,$4,$5, NULLIF($6,'')::date, $7, $8, $9, NULLIF($10,'')::date, $11, $12, $13)
     RETURNING *;`,
    [
      first_name, last_name, nric, email, phone,
      dob ?? '',                       // may be '' from the form
      address, position, department,
      date_of_joining ?? '',           // may be '' from the form
      (salary === null || salary === '' ? null : Number(salary)),
      employment_type, manager
    ]
  );
  res.status(201).json(rows[0]);
});

await query(`CREATE INDEX IF NOT EXISTS idx_emp_first_name ON employees (lower(first_name));`);
await query(`CREATE INDEX IF NOT EXISTS idx_emp_last_name  ON employees (lower(last_name));`);
await query(`CREATE INDEX IF NOT EXISTS idx_emp_email      ON employees (lower(email));`);
await query(`CREATE INDEX IF NOT EXISTS idx_emp_nric       ON employees (lower(nric));`);


const port = process.env.PORT || 8080;
ensureSchema().then(() => {
  app.listen(port, () => console.log(`API listening on :${port}`));
});
