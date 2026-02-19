import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', CRN: '', email: '', password: '' });
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  const fetchCompanies = () => {
    api.get('/admin/companies').then((res) => {
      setCompanies(res.data.data.companies || []);
    }).catch((err) => setError(err.response?.data?.message || 'Failed to load')).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (editingId) {
      const payload = { name: form.name, CRN: form.CRN, email: form.email || undefined };
      api.put(`/admin/company/${editingId}`, payload).then(() => {
        fetchCompanies();
        setShowForm(false);
        setEditingId(null);
        setForm({ name: '', CRN: '', email: '', password: '' });
      }).catch((err) => setError(err.response?.data?.message || 'Failed to update'));
    } else {
      if (!/^\d{10}$/.test(form.CRN)) {
        setError('CRN must be exactly 10 digits');
        return;
      }
      if (!form.email?.trim()) {
        setError('Email is required for company login');
        return;
      }
      if (!form.password || form.password.length < 6) {
        setError('Password is required and must be at least 6 characters');
        return;
      }
      const payload = { name: form.name, CRN: form.CRN, email: form.email.trim(), password: form.password };
      api.post('/admin/create-company', payload).then(() => {
        fetchCompanies();
        setShowForm(false);
        setForm({ name: '', CRN: '', email: '', password: '' });
      }).catch((err) => setError(err.response?.data?.message || 'Failed to create'));
    }
  };

  const handleDelete = (id) => {
    if (!confirm('Delete this company? Users will be deactivated and licenses expired.')) return;
    api.delete(`/admin/company/${id}`).then(() => fetchCompanies()).catch((err) => setError(err.response?.data?.message));
  };

  const startEdit = (c) => {
    setEditingId(c._id);
    setForm({ name: c.name, CRN: c.CRN, email: c.email || '', password: '' });
    setShowForm(true);
  };

  if (loading) return <div className="py-8 text-center text-gray-500">Loading...</div>;

  return (
    <div className="w-full">
      <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
        <h1 className="text-xl font-semibold m-0">Companies</h1>
        <button
          type="button"
          onClick={() => { setShowForm(true); setEditingId(null); setForm({ name: '', CRN: '', email: '', password: '' }); }}
          className="px-4 py-2 bg-gray-900 text-white rounded-lg font-semibold hover:opacity-90"
        >
          Add Company
        </button>
      </div>
      {error && (
        <div className="bg-red-50 text-red-700 py-2.5 px-3 rounded-lg mb-4 text-sm">{error}</div>
      )}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 mb-6 max-w-md">
          <h2 className="text-lg font-medium mb-4">{editingId ? 'Edit Company' : 'New Company'}</h2>
          <label className="block mb-3 text-sm">
            Name <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required className="w-full mt-1 px-2.5 py-2 border border-gray-300 rounded-md" />
          </label>
          <label className="block mb-3 text-sm">
            CRN (10 digits) <input value={form.CRN} onChange={(e) => setForm((f) => ({ ...f, CRN: e.target.value }))} required maxLength={10} pattern="\d{10}" disabled={!!editingId} className="w-full mt-1 px-2.5 py-2 border border-gray-300 rounded-md disabled:bg-gray-100" />
          </label>
          <label className="block mb-3 text-sm">
            Email <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required={!editingId} placeholder="Login email for the company" className="w-full mt-1 px-2.5 py-2 border border-gray-300 rounded-md" />
          </label>
          {!editingId && (
            <label className="block mb-3 text-sm">
              Password <input type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} required minLength={6} placeholder="Min 6 characters" className="w-full mt-1 px-2.5 py-2 border border-gray-300 rounded-md" />
            </label>
          )}
          <div className="flex gap-2 mt-4">
            <button type="submit" className="px-4 py-2 bg-gray-900 text-white rounded-md font-medium">{editingId ? 'Save' : 'Create Company'}</button>
            <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="px-4 py-2 border border-gray-300 rounded-md bg-white">Cancel</button>
          </div>
        </form>
      )}
      <div className="overflow-auto bg-white border border-gray-200 rounded-xl">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left border-b border-gray-200 bg-gray-50 font-semibold text-sm">Name</th>
              <th className="px-4 py-3 text-left border-b border-gray-200 bg-gray-50 font-semibold text-sm">CRN</th>
              <th className="px-4 py-3 text-left border-b border-gray-200 bg-gray-50 font-semibold text-sm">Email</th>
              <th className="px-4 py-3 text-left border-b border-gray-200 bg-gray-50 font-semibold text-sm">License</th>
              <th className="px-4 py-3 text-left border-b border-gray-200 bg-gray-50 font-semibold text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((c) => (
              <tr key={c._id}>
                <td className="px-4 py-3 border-b border-gray-200">{c.name}</td>
                <td className="px-4 py-3 border-b border-gray-200">{c.CRN}</td>
                <td className="px-4 py-3 border-b border-gray-200">{c.email || '-'}</td>
                <td className="px-4 py-3 border-b border-gray-200">{c.licenseType || '-'}</td>
                <td className="px-4 py-3 border-b border-gray-200">
                  <button type="button" onClick={() => startEdit(c)} className="mr-2 py-1.5 px-2.5 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50">Edit</button>
                  <button type="button" onClick={() => handleDelete(c._id)} className="py-1.5 px-2.5 text-sm border border-red-600 text-red-600 rounded-md bg-white hover:bg-red-50">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
