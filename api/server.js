import express from "express";
import cors from "cors";
import pkg from "pg";
import path from "path";
import { fileURLToPath } from "url";

const { Pool } = pkg;
const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
  host: process.env.PGHOST || "localhost",
  user: process.env.PGUSER || "hrms",
  password: process.env.PGPASSWORD || "hrmspass",
  database: process.env.PGDATABASE || "hrms_db",
  port: process.env.PGPORT || 5432,
});

// API routes
app.get("/api/employees", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM employees ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch employees" });
  }
});

// --- helpers (put near top of server.js)
const nz = v => (v === "" || v == null ? null : v);
// supports "yyyy-mm-dd" and "dd/mm/yyyy"; returns null if invalid
function toISODate(s) {
  if (!s) return null;
  const t = String(s).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t;                 // already ISO
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(t);             // dd/mm/yyyy
  return m ? `${m[3]}-${m[2]}-${m[1]}` : null;
}

// --- POST /api/employees (snake_case from frontend)
app.post("/api/employees", async (req, res) => {
  try {
    const b = req.body;

    // expect snake_case from UI
    const first_name       = b.first_name;
    const last_name        = b.last_name;
    const nric             = b.nric;
    const email            = b.email;
    const phone            = b.phone;
    const dob              = b.dob;                // "yyyy-mm-dd" or "dd/mm/yyyy"
    const address          = b.address;
    const position         = b.position;
    const department       = b.department;
    const date_of_joining  = b.date_of_joining;    // "yyyy-mm-dd" or "dd/mm/yyyy"
    const salary           = b.salary;             // may be null / ""
    const employment_type  = b.employment_type;
    const manager          = b.manager;

    // REQUIRED (match NOT NULL cols)
    for (const [key, val] of Object.entries({
      first_name, last_name, nric, email
    })) {
      if (!val || String(val).trim() === "") {
        return res.status(400).json({ error: `Missing required field: ${key}` });
      }
    }

    const result = await pool.query(
      `INSERT INTO employees
        (first_name, last_name, nric, email, phone, dob, address,
         position, department, date_of_joining, salary, employment_type, manager)
       VALUES
        ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING *`,
      [
        first_name.trim(),
        last_name.trim(),
        nric.trim(),
        email.trim(),
        nz(phone),
        nz(toISODate(dob)),
        nz(address),
        nz(position),
        nz(department),
        nz(toISODate(date_of_joining)),
        nz(Number.isFinite(parseInt(salary)) ? parseInt(salary) : null),
        nz(employment_type),
        nz(manager),
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Insert error:", err);
    res.status(500).json({ error: "Failed to add employee" });
  }
});



// ---------- Static React client serving ----------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDist = path.join(__dirname, "client");

// Serve static files from React build
app.use(express.static(clientDist));

// Fallback to index.html for non-API routes (React Router support)
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(clientDist, "index.html"));
});
// ------------------------------------------------

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

