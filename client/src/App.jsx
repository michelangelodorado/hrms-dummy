import { useState } from 'react';
import EmployeeList from './components/EmployeeList.jsx';
import EmployeeForm from './components/EmployeeForm.jsx';
import ApiFlow from './components/ApiFlow.jsx';

export default function App() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [view, setView] = useState('employees'); // 'employees' | 'apiflow'

  return (
    <div className="max-w-7xl mx-auto py-6">
      <header className="px-4 mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">HRMS Dummy</h1>
          <p className="text-sm text-gray-600">Node.js + Postgres + React/Tailwind</p>
        </div>

        {/* Simple nav toggle */}
        <nav className="flex gap-2">
          <button
            onClick={() => setView('employees')}
            className={`px-3 py-2 rounded-xl text-sm shadow ${
              view === 'employees' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
            }`}
          >
            Employees
          </button>
          <button
            onClick={() => setView('apiflow')}
            className={`px-3 py-2 rounded-xl text-sm shadow ${
              view === 'apiflow' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
            }`}
          >
            API Flow
          </button>
        </nav>
      </header>

      {view === 'employees' ? (
        <div className="grid gap-6 md:grid-cols-5 px-4">
          <div className="md:col-span-2 rounded-2xl bg-white shadow">
            <EmployeeForm onCreated={() => setRefreshKey((k) => k + 1)} />
          </div>
          <div className="md:col-span-3 rounded-2xl bg-white shadow">
            {/* refreshKey will remount the list to reload */}
            <EmployeeList key={refreshKey} />
          </div>
        </div>
      ) : (
        <div className="px-4">
          <div className="rounded-2xl bg-white shadow p-4">
            <ApiFlow />
          </div>
        </div>
      )}
    </div>
  );
}
