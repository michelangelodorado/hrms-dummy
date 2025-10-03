import { useEffect, useState } from 'react';
import { listEmployees } from '../lib/api.js';

export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');

  const debouncedQ = useDebounce(q, 300);

  useEffect(() => {
    setLoading(true);
    listEmployees(debouncedQ)
      .then(setEmployees)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [debouncedQ]);

  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3 gap-3">
        <h2 className="text-xl font-semibold">Employees</h2>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, NRIC, email, position, department…"
          className="w-72 rounded-xl border border-gray-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
      </div>

      {loading ? (
        <div>Loading…</div>
      ) : (
        <div className="overflow-x-auto rounded-2xl shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 bg-white">
            <thead>
              <tr className="text-left">
                {[
                  'ID',
                  'First Name',
                  'Last Name',
                  'NRIC',
                  'Email',
                  'Phone',
                  'Position',
                  'Department',
                  'DoJ',
                  'Salary',
                  'Type',
                  'Manager',
                ].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {employees.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">{e.id}</td>
                  <td className="px-3 py-2 font-medium">{e.first_name}</td>
                  <td className="px-3 py-2 font-medium">{e.last_name}</td>
                  <td className="px-3 py-2">{e.nric}</td>
                  <td className="px-3 py-2">{e.email}</td>
                  <td className="px-3 py-2">{e.phone}</td>
                  <td className="px-3 py-2">{e.position}</td>
                  <td className="px-3 py-2">{e.department}</td>
                  <td className="px-3 py-2">{e.date_of_joining?.slice(0, 10)}</td>
                  <td className="px-3 py-2">
                    {Intl.NumberFormat('en-SG', {
                      style: 'currency',
                      currency: 'SGD',
                    }).format(e.salary || 0)}
                  </td>
                  <td className="px-3 py-2">{e.employment_type}</td>
                  <td className="px-3 py-2">{e.manager}</td>
                </tr>
              ))}
              {employees.length === 0 && (
                <tr>
                  <td className="px-3 py-6 text-sm text-gray-500" colSpan={11}>
                    No employees found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
