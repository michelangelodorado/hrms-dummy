// client/src/lib/api.js
const RAW_API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';
const API_BASE = RAW_API_BASE.replace(/\/+$/, ''); // trim trailing slash(es)

export async function listEmployees(q) {
  const url = `${API_BASE}/api/employees`; // -> "/api/employees" if API_BASE is ""
  const res = await fetch(q ? `${url}?q=${encodeURIComponent(q)}` : url);
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

