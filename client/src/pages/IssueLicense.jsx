import { useState, useEffect } from 'react';
import api from '../services/api';

export default function IssueLicense() {
  const [companies, setCompanies] = useState([]);
  const [directClients, setDirectClients] = useState([]);
  const [form, setForm] = useState({ clientId: '', clientModel: 'Company', type: 'limited', maxUsers: 5, expiryDate: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/admin/companies'),
      api.get('/admin/direct-clients'),
    ])
      .then(([companiesRes, clientsRes]) => {
        setCompanies(companiesRes.data.data.companies || []);
        setDirectClients(clientsRes.data.data.users || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const payload = {
      clientId: form.clientId,
      clientModel: form.clientModel,
      type: form.type,
      expiryDate: form.expiryDate,
    };
    if (form.type === 'limited') payload.maxUsers = Number(form.maxUsers) || 1;
    api.post('/admin/issue-license', payload)
      .then(() => {
        setSuccess('License issued.');
        setForm((f) => ({ ...f, expiryDate: '', maxUsers: 5 }));
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to issue license'));
  };

  if (loading) return <div className="py-8 text-gray-500">Loading...</div>;

  return (
    <div className="max-w-md">
      <h1 className="text-xl font-semibold mb-4">Issue License</h1>
      {error && <div className="bg-red-50 text-red-700 py-2.5 px-3 rounded-lg mb-4 text-sm">{error}</div>}
      {success && <div className="bg-green-50 text-green-800 py-2.5 px-3 rounded-lg mb-4 text-sm">{success}</div>}
      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6">
        <label className="block mb-4 text-sm">
          Client type
          <select
            value={form.clientModel}
            onChange={(e) => setForm((f) => ({ ...f, clientModel: e.target.value, clientId: '' }))}
            className="w-full mt-1 px-2.5 py-2 border border-gray-300 rounded-md"
          >
            <option value="Company">Company</option>
            <option value="User">Direct client</option>
          </select>
        </label>
        {form.clientModel === 'Company' && (
          <label className="block mb-4 text-sm">
            Company
            <select
              value={form.clientId}
              onChange={(e) => setForm((f) => ({ ...f, clientId: e.target.value }))}
              required
              className="w-full mt-1 px-2.5 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Select company</option>
              {companies.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} ({c.CRN})
                </option>
              ))}
            </select>
          </label>
        )}
        {form.clientModel === 'User' && (
          <label className="block mb-4 text-sm">
            Direct client
            <select
              value={form.clientId}
              onChange={(e) => setForm((f) => ({ ...f, clientId: e.target.value }))}
              required
              className="w-full mt-1 px-2.5 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Select direct client</option>
              {directClients.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
          </label>
        )}
        <label className="block mb-4 text-sm">
          License type
          <select
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
            className="w-full mt-1 px-2.5 py-2 border border-gray-300 rounded-md"
          >
            <option value="limited">Limited</option>
            <option value="unlimited">Unlimited</option>
          </select>
        </label>
        {form.type === 'limited' && (
          <label className="block mb-4 text-sm">
            Max users
            <input
              type="number"
              min={1}
              value={form.maxUsers}
              onChange={(e) => setForm((f) => ({ ...f, maxUsers: e.target.value }))}
              required
              className="w-full mt-1 px-2.5 py-2 border border-gray-300 rounded-md"
            />
          </label>
        )}
        <label className="block mb-4 text-sm">
          Expiry date
          <input
            type="date"
            value={form.expiryDate}
            onChange={(e) => setForm((f) => ({ ...f, expiryDate: e.target.value }))}
            required
            className="w-full mt-1 px-2.5 py-2 border border-gray-300 rounded-md"
          />
        </label>
        <button
          type="submit"
          className="mt-2 py-2.5 px-4 bg-gray-900 text-white rounded-lg font-semibold hover:opacity-90"
        >
          Issue License
        </button>
      </form>
    </div>
  );
}
