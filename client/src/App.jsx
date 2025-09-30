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
