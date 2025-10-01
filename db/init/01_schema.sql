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

