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
      name VARCHAR(100) NOT NULL,
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

// GET /api/employees → list employees
app.get('/api/employees', async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM employees ORDER BY id');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

// POST /api/employees → add employee
app.post('/api/employees', async (req, res) => {
  const {
    name, nric, email, phone, dob, address,
    position, department, date_of_joining,
    salary, employment_type, manager
  } = req.body || {};

  if (!name || !nric || !email) {
    return res.status(400).json({ error: 'name, nric, and email are required' });
  }
  try {
    const { rows } = await query(
      `INSERT INTO employees
       (name, nric, email, phone, dob, address, position, department, date_of_joining, salary, employment_type, manager)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING *;`,
      [name, nric, email, phone, dob, address, position, department, date_of_joining, salary, employment_type, manager]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create employee' });
  }
});

const port = process.env.PORT || 8080;
ensureSchema().then(() => {
  app.listen(port, () => console.log(`API listening on :${port}`));
});
