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
