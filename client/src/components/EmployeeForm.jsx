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
