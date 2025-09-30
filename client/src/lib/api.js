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
