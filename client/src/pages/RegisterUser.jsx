import { useEffect, useState } from 'react';
import api from '../services/api';

export default function RegisterUser() {
  const [companies, setCompanies] = useState([]);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'direct_client',
    companyId: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    api
      .get('/admin/companies')
      .then((res) => setCompanies(res.data.data.companies || []))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        companyId: form.role === 'company' ? form.companyId || undefined : undefined,
      };
      await api.post('/auth/register', payload);
      setSuccess('User registered successfully.');
      setForm({
        name: '',
        email: '',
        password: '',
        role: 'direct_client',
        companyId: '',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register user.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-semibold mb-4">Create User</h1>
      {error && (
        <div className="bg-red-50 text-red-700 py-2.5 px-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 text-green-800 py-2.5 px-3 rounded-lg mb-4 text-sm">
          {success}
        </div>
      )}
      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <div className="space-y-1 text-sm">
          <label htmlFor="name" className="font-medium text-gray-700">
            Name
          </label>
          <input
            id="name"
            type="text"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
            className="w-full mt-1 px-2.5 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div className="space-y-1 text-sm">
          <label htmlFor="email" className="font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            required
            className="w-full mt-1 px-2.5 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div className="space-y-1 text-sm">
          <label htmlFor="password" className="font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            required
            minLength={6}
            className="w-full mt-1 px-2.5 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div className="space-y-1 text-sm">
          <label htmlFor="role" className="font-medium text-gray-700">
            Role
          </label>
          <select
            id="role"
            value={form.role}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                role: e.target.value,
                companyId: e.target.value === 'company' ? f.companyId : '',
              }))
            }
            className="w-full mt-1 px-2.5 py-2 border border-gray-300 rounded-md"
          >
            <option value="direct_client">Direct client</option>
            <option value="company">Company user</option>
          </select>
        </div>

        {form.role === 'company' && (
          <div className="space-y-1 text-sm">
            <label htmlFor="companyId" className="font-medium text-gray-700">
              Company
            </label>
            <select
              id="companyId"
              value={form.companyId}
              onChange={(e) => setForm((f) => ({ ...f, companyId: e.target.value }))}
              required={form.role === 'company'}
              className="w-full mt-1 px-2.5 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Select company</option>
              {companies.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} ({c.CRN})
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 px-4 py-2 bg-gray-900 text-white rounded-lg font-semibold hover:opacity-90 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating...' : 'Create User'}
        </button>
      </form>
    </div>
  );
}

