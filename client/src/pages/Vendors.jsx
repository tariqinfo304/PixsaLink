import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Vendors() {
  const { role } = useAuth();
  const [vendors, setVendors] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', balance: 0 });
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filterCompany, setFilterCompany] = useState('');
  const [error, setError] = useState('');

  const isAdmin = role === 'super_admin';
  const endpoint = isAdmin ? '/admin/vendors' : '/vendors';

  const fetchVendors = () => {
    const url = isAdmin && filterCompany ? `${endpoint}?companyId=${filterCompany}` : endpoint;
    api.get(url).then((res) => setVendors(res.data.data.vendors || [])).catch((err) => setError(err.response?.data?.message)).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchVendors();
  }, [role, filterCompany]);

  useEffect(() => {
    if (isAdmin) api.get('/admin/companies').then((res) => setCompanies(res.data.data.companies || []));
  }, [isAdmin]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (editingId) {
      api.put(`/vendors/${editingId}`, { name: form.name, balance: form.balance }).then(() => {
        fetchVendors();
        setShowForm(false);
        setEditingId(null);
        setForm({ name: '', balance: 0 });
      }).catch((err) => setError(err.response?.data?.message));
    } else {
      api.post('/vendors', form).then(() => {
        fetchVendors();
        setShowForm(false);
        setForm({ name: '', balance: 0 });
      }).catch((err) => setError(err.response?.data?.message));
    }
  };

  const handleDelete = (id) => {
    if (!confirm('Delete this vendor?')) return;
    api.delete(`/vendors/${id}`).then(() => fetchVendors()).catch((err) => setError(err.response?.data?.message));
  };

  if (loading && vendors.length === 0) return <div className="py-8 text-gray-500">Loading...</div>;

  return (
    <div className="w-full">
      <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
        <h1 className="text-xl font-semibold m-0">{isAdmin ? 'All Vendors' : 'Vendors'}</h1>
        {isAdmin && companies.length > 0 && (
          <select value={filterCompany} onChange={(e) => setFilterCompany(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg">
            <option value="">All companies</option>
            {companies.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        )}
        {!isAdmin && (
          <button type="button" onClick={() => { setShowForm(true); setEditingId(null); setForm({ name: '', balance: 0 }); }} className="px-4 py-2 bg-gray-900 text-white rounded-lg font-semibold hover:opacity-90">
            Add Vendor
          </button>
        )}
      </div>
      {error && <div className="bg-red-50 text-red-700 py-2.5 px-3 rounded-lg mb-4 text-sm">{error}</div>}
      {!isAdmin && showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 mb-6 max-w-md">
          <h2 className="text-lg font-medium mb-4">{editingId ? 'Edit Vendor' : 'New Vendor'}</h2>
          <label className="block mb-3 text-sm">Name <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required className="w-full mt-1 px-2.5 py-2 border border-gray-300 rounded-md" /></label>
          <label className="block mb-3 text-sm">Initial balance <input type="number" step="0.01" value={form.balance} onChange={(e) => setForm((f) => ({ ...f, balance: e.target.value }))} className="w-full mt-1 px-2.5 py-2 border border-gray-300 rounded-md" /></label>
          <div className="flex gap-2 mt-4">
            <button type="submit" className="px-4 py-2 bg-gray-900 text-white rounded-md font-medium">Save</button>
            <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="px-4 py-2 border border-gray-300 rounded-md bg-white">Cancel</button>
          </div>
        </form>
      )}
      <div className="overflow-auto bg-white border border-gray-200 rounded-xl">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left border-b border-gray-200 bg-gray-50 font-semibold text-sm">Name</th>
              <th className="px-4 py-3 text-left border-b border-gray-200 bg-gray-50 font-semibold text-sm">Balance</th>
              {isAdmin && <th className="px-4 py-3 text-left border-b border-gray-200 bg-gray-50 font-semibold text-sm">Client</th>}
              {!isAdmin && <th className="px-4 py-3 text-left border-b border-gray-200 bg-gray-50 font-semibold text-sm">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {vendors.map((v) => (
              <tr key={v._id}>
                <td className="px-4 py-3 border-b border-gray-200">{v.name}</td>
                <td className="px-4 py-3 border-b border-gray-200">{Number(v.balance).toFixed(2)}</td>
                {isAdmin && <td className="px-4 py-3 border-b border-gray-200">{v.clientId?.name || v.clientId || '-'}</td>}
                {!isAdmin && (
                  <td className="px-4 py-3 border-b border-gray-200">
                    <button type="button" onClick={() => { setEditingId(v._id); setForm({ name: v.name, balance: v.balance }); setShowForm(true); }} className="mr-2 py-1.5 px-2.5 text-sm border border-gray-300 rounded-md bg-white">Edit</button>
                    <button type="button" onClick={() => handleDelete(v._id)} className="py-1.5 px-2.5 text-sm border border-red-600 text-red-600 rounded-md bg-white hover:bg-red-50">Delete</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
