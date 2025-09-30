# Project Structure

```
hrms-dummy/
├─ docker-compose.yml
├─ .env               # env for API (loaded by docker-compose)
├─ api/
│  ├─ package.json
│  ├─ server.js
│  ├─ db.js
│  ├─ employees.sql   # schema only (optional for reference)
│  └─ README.md
├─ db/
│  └─ init/
│     ├─ 01_schema.sql
│     └─ 02_seed.sql
└─ client/
   ├─ index.html
   ├─ package.json
   ├─ postcss.config.js
   ├─ tailwind.config.js
   └─ src/
      ├─ main.jsx
      ├─ App.jsx
      ├─ components/
      │  ├─ EmployeeList.jsx
      │  └─ EmployeeForm.jsx
      └─ lib/api.js
```

---

## docker-compose.yml

```yaml
version: '3.9'
services:
  db:
    image: postgres:16-alpine
    container_name: hrms_db
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-hrms}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-hrmspass}
      POSTGRES_DB: ${POSTGRES_DB:-hrms_db}
    ports:
      - '5432:5432'
    volumes:
      - db_data:/var/lib/postgresql/data
      - ./db/init:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $${POSTGRES_USER:-hrms} -d $${POSTGRES_DB:-hrms_db}"]
      interval: 5s
      timeout: 5s
      retries: 10

  api:
    build: ./api
    container_name: hrms_api
    environment:
      PORT: 8080
      PGHOST: db
      PGUSER: ${POSTGRES_USER:-hrms}
      PGPASSWORD: ${POSTGRES_PASSWORD:-hrmspass}
      PGDATABASE: ${POSTGRES_DB:-hrms_db}
      PGPORT: 5432
      CORS_ORIGIN: http://localhost:5173
    depends_on:
      db:
        condition: service_healthy
    ports:
      - '8080:8080'

  client:
    build: ./client
    container_name: hrms_client
    environment:
      VITE_API_BASE_URL: http://localhost:8080
    ports:
      - '5173:5173'
    depends_on:
      - api

volumes:
  db_data:
```

---

## .env (at project root)

```ini
POSTGRES_USER=hrms
POSTGRES_PASSWORD=hrmspass
POSTGRES_DB=hrms_db
```

---

## api/package.json

```json
{
  "name": "hrms-api",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "dev": "node --watch server.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "pg": "^8.12.0"
  }
}
```

---

## api/db.js

```js
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
```

---

## api/server.js

```js
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
```

---

## api/employees.sql (reference)

```sql
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
```

---

## api/README.md

```md
# HRMS API

Endpoints:
- `GET /api/employees` – list employees
- `POST /api/employees` – add employee (JSON body)

Environment variables (inherited from docker-compose):
- PGHOST, PGUSER, PGPASSWORD, PGDATABASE, PGPORT
- CORS_ORIGIN (comma-separated list)
```

---

## db/init/01_schema.sql

```sql
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
```

---

## db/init/02_seed.sql

```sql
INSERT INTO employees (name, nric, email, phone, dob, address, position, department, date_of_joining, salary, employment_type, manager) VALUES
('Alice Tan', 'S9123456A', 'alice.tan@example.com', '+65 9123 4567', '1992-04-18', '10 Anson Rd, #20-01, Singapore 079903', 'HR Manager', 'Human Resources', '2020-05-12', 6200, 'Full-time', 'CEO'),
('Ben Lim', 'S8765432B', 'ben.lim@example.com', '+65 9876 5432', '1988-09-07', '1 Marina Blvd, #12-34, Singapore 018989', 'Software Engineer', 'Engineering', '2021-03-01', 7800, 'Full-time', 'CTO');
```

---

## client/package.json

```json
{
  "name": "hrms-client",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview --host"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.41",
    "tailwindcss": "^3.4.10",
    "vite": "^5.4.3"
  }
}
```

---

## client/tailwind.config.js

```js
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}'
  ],
  theme: { extend: {} },
  plugins: []
};
```

---

## client/postcss.config.js

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
};
```

---

## client/index.html

```html
<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>HRMS Dummy</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

---

## client/src/main.jsx

```jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

---

## client/src/styles.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root { color-scheme: light dark; }
body { @apply bg-gray-50 text-gray-900; }
```

---

## client/src/lib/api.js

```js
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export async function listEmployees() {
  const res = await fetch(`${API_BASE}/api/employees`);
  if (!res.ok) throw new Error('Failed to fetch employees');
  return res.json();
}

export async function addEmployee(payload) {
  const res = await fetch(`${API_BASE}/api/employees`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Failed to add employee');
  return res.json();
}
```

---

## client/src/components/EmployeeList.jsx

```jsx
import { useEffect, useState } from 'react';
import { listEmployees } from '../lib/api.js';

export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    listEmployees()
      .then(setEmployees)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-4">Loading…</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-3">Employees</h2>
      <div className="overflow-x-auto rounded-2xl shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 bg-white">
          <thead>
            <tr className="text-left">
              {['ID','Name','NRIC','Email','Phone','Position','Department','DoJ','Salary','Type','Manager'].map(h => (
                <th key={h} className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {employees.map(e => (
              <tr key={e.id} className="hover:bg-gray-50">
                <td className="px-3 py-2">{e.id}</td>
                <td className="px-3 py-2 font-medium">{e.name}</td>
                <td className="px-3 py-2">{e.nric}</td>
                <td className="px-3 py-2">{e.email}</td>
                <td className="px-3 py-2">{e.phone}</td>
                <td className="px-3 py-2">{e.position}</td>
                <td className="px-3 py-2">{e.department}</td>
                <td className="px-3 py-2">{e.date_of_joining?.slice(0,10)}</td>
                <td className="px-3 py-2">{Intl.NumberFormat('en-SG',{ style:'currency', currency:'SGD'}).format(e.salary || 0)}</td>
                <td className="px-3 py-2">{e.employment_type}</td>
                <td className="px-3 py-2">{e.manager}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

---

## client/src/components/EmployeeForm.jsx

```jsx
import { useState } from 'react';
import { addEmployee } from '../lib/api.js';

const initial = {
  name:'', nric:'', email:'', phone:'', dob:'', address:'',
  position:'', department:'', date_of_joining:'', salary:'',
  employment_type:'Full-time', manager:''
};

export default function EmployeeForm({ onCreated }) {
  const [form, setForm] = useState(initial);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  async function submit(e) {
    e.preventDefault();
    setSubmitting(true); setError('');
    try {
      const payload = { ...form, salary: form.salary ? Number(form.salary) : null };
      const created = await addEmployee(payload);
      onCreated?.(created);
      setForm(initial);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="p-4 space-y-3">
      <h2 className="text-xl font-semibold">Add Employee</h2>
      {error && <div className="text-red-600">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Input label="Name" value={form.name} onChange={v=>update('name',v)} required />
        <Input label="NRIC" value={form.nric} onChange={v=>update('nric',v)} required />
        <Input label="Email" type="email" value={form.email} onChange={v=>update('email',v)} required />
        <Input label="Phone" value={form.phone} onChange={v=>update('phone',v)} />
        <Input label="Date of Birth" type="date" value={form.dob} onChange={v=>update('dob',v)} />
        <Input label="Address" value={form.address} onChange={v=>update('address',v)} />
        <Input label="Position" value={form.position} onChange={v=>update('position',v)} />
        <Input label="Department" value={form.department} onChange={v=>update('department',v)} />
        <Input label="Date of Joining" type="date" value={form.date_of_joining} onChange={v=>update('date_of_joining',v)} />
        <Input label="Salary (SGD)" type="number" value={form.salary} onChange={v=>update('salary',v)} />
        <Select label="Employment Type" value={form.employment_type} onChange={v=>update('employment_type',v)} options={["Full-time","Part-time","Contract","Intern"]} />
        <Input label="Manager" value={form.manager} onChange={v=>update('manager',v)} />
      </div>
      <button disabled={submitting} className="px-4 py-2 rounded-2xl bg-gray-900 text-white shadow hover:opacity-90 disabled:opacity-50">
        {submitting? 'Saving…' : 'Save'}
      </button>
    </form>
  );
}

function Input({ label, type='text', value, onChange, required }) {
  return (
    <label className="block">
      <span className="block text-sm text-gray-600 mb-1">{label}{required && ' *'}</span>
      <input type={type} value={value} required={required}
        onChange={e=>onChange(e.target.value)}
        className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900" />
    </label>
  );
}

function Select({ label, value, onChange, options=[] }) {
  return (
    <label className="block">
      <span className="block text-sm text-gray-600 mb-1">{label}</span>
      <select value={value} onChange={e=>onChange(e.target.value)}
        className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900">
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}
```

---

## client/src/App.jsx

```jsx
import EmployeeList from './components/EmployeeList.jsx';
import EmployeeForm from './components/EmployeeForm.jsx';
import { useState } from 'react';

export default function App() {
  const [refreshKey, setRefreshKey] = useState(0);
  return (
    <div className="max-w-7xl mx-auto py-6">
      <header className="px-4 mb-6">
        <h1 className="text-2xl font-bold">HRMS Dummy</h1>
        <p className="text-sm text-gray-600">Node.js + Postgres + React/Tailwind</p>
      </header>
      <div className="grid gap-6 md:grid-cols-5 px-4">
        <div className="md:col-span-2 rounded-2xl bg-white shadow">
          <EmployeeForm onCreated={() => setRefreshKey(k=>k+1)} />
        </div>
        <div className="md:col-span-3 rounded-2xl bg-white shadow">
          {/* refreshKey will remount the list to reload */}
          <EmployeeList key={refreshKey} />
        </div>
      </div>
    </div>
  );
}
```

---

## client/Dockerfile

```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci || npm i
COPY . .

# Dev server for simplicity (Vite) — suitable for demo
EXPOSE 5173
CMD ["npm","run","dev","--","--host"]
```

---

## api/Dockerfile

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci || npm i
COPY . .
EXPOSE 8080
CMD ["npm","start"]
```

---

## Quick Start

```bash
# 1) Create project directory and files as above
# 2) Start the stack
docker compose up --build

# Open the client at http://localhost:5173
# API available at http://localhost:8080/api/employees
```

### Testing the API

```bash
# List
curl http://localhost:8080/api/employees

# Add
curl -X POST http://localhost:8080/api/employees \
  -H 'Content-Type: application/json' \
  -d '{
    "name":"Chris Goh","nric":"S9988776Z","email":"chris.goh@example.com",
    "phone":"+65 9000 1111","dob":"1995-01-02","address":"2 Orchard Turn, Singapore",
    "position":"QA Engineer","department":"Engineering","date_of_joining":"2024-11-10",
    "salary":5400,"employment_type":"Full-time","manager":"CTO"
  }'
```

---

## Notes
- The Postgres container auto-runs the schema and seed via `db/init/*.sql`.
- The API also ensures the table exists on boot (idempotent) in case you run it standalone.
- Update `CORS_ORIGIN` in `docker-compose.yml` if you host the client elsewhere.
- For a production setup, you could `npm run build` in `client` and serve `dist/` from a static CDN or copy into the API container (e.g., `/public`) and add `app.use(express.static('public'))`.
