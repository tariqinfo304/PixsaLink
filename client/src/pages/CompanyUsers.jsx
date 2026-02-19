import { useState, useEffect } from 'react';
import api from '../services/api';

export default function CompanyUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchUsers = () => {
    api
      .get('/company/users')
      .then((res) => setUsers(res.data.data.users || []))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load users'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAdd = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    api
      .post('/company/users', form)
      .then(() => {
        setSuccess('User added.');
        setForm({ name: '', email: '', password: '' });
        setShowForm(false);
        fetchUsers();
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to add user'));
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    if (!editingId) return;
    setError('');
    setSuccess('');
    api
      .put(`/company/users/${editingId}`, { name: editForm.name, email: editForm.email })
      .then(() => {
        setSuccess('User updated.');
        setEditingId(null);
        fetchUsers();
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to update user'));
  };

  const handleDeactivate = (id) => {
    if (!confirm('Deactivate this user? They will no longer be able to log in.')) return;
    setError('');
    api
      .patch(`/company/users/${id}/deactivate`)
      .then(() => {
        setSuccess('User deactivated.');
        fetchUsers();
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to deactivate user'));
  };

  const startEdit = (u) => {
    setEditingId(u._id);
    setEditForm({ name: u.name, email: u.email });
  };

  if (loading) return <div className="py-8 text-gray-500">Loading...</div>;

  return (
    <div className="w-full">
      <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
        <h1 className="text-xl font-semibold m-0">Team</h1>
        <button
          type="button"
          onClick={() => { setShowForm(true); setError(''); setSuccess(''); }}
          className="px-4 py-2 bg-gray-900 text-white rounded-lg font-semibold hover:opacity-90"
        >
          Add user
        </button>
      </div>
      {error && <div className="bg-red-50 text-red-700 py-2.5 px-3 rounded-lg mb-4 text-sm">{error}</div>}
      {success && <div className="bg-green-50 text-green-800 py-2.5 px-3 rounded-lg mb-4 text-sm">{success}</div>}

      {showForm && (
        <form onSubmit={handleAdd} className="bg-white border border-gray-200 rounded-xl p-6 mb-6 max-w-md">
          <h2 className="text-lg font-medium mb-4">Add team member</h2>
          <label className="block mb-3 text-sm">
            Name
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
              className="w-full mt-1 px-2.5 py-2 border border-gray-300 rounded-md"
            />
          </label>
          <label className="block mb-3 text-sm">
            Email
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
              className="w-full mt-1 px-2.5 py-2 border border-gray-300 rounded-md"
            />
          </label>
          <label className="block mb-3 text-sm">
            Password (min 6 characters)
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              required
              minLength={6}
              className="w-full mt-1 px-2.5 py-2 border border-gray-300 rounded-md"
            />
          </label>
          <div className="flex gap-2 mt-4">
            <button type="submit" className="px-4 py-2 bg-gray-900 text-white rounded-md font-medium">Add</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-300 rounded-md bg-white">Cancel</button>
          </div>
        </form>
      )}

      {editingId && (
        <form onSubmit={handleUpdate} className="bg-white border border-gray-200 rounded-xl p-6 mb-6 max-w-md">
          <h2 className="text-lg font-medium mb-4">Edit user</h2>
          <label className="block mb-3 text-sm">
            Name
            <input
              value={editForm.name}
              onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
              required
              className="w-full mt-1 px-2.5 py-2 border border-gray-300 rounded-md"
            />
          </label>
          <label className="block mb-3 text-sm">
            Email
            <input
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
              required
              className="w-full mt-1 px-2.5 py-2 border border-gray-300 rounded-md"
            />
          </label>
          <div className="flex gap-2 mt-4">
            <button type="submit" className="px-4 py-2 bg-gray-900 text-white rounded-md font-medium">Save</button>
            <button type="button" onClick={() => setEditingId(null)} className="px-4 py-2 border border-gray-300 rounded-md bg-white">Cancel</button>
          </div>
        </form>
      )}

      <div className="overflow-auto bg-white border border-gray-200 rounded-xl">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left border-b border-gray-200 bg-gray-50 font-semibold text-sm">Name</th>
              <th className="px-4 py-3 text-left border-b border-gray-200 bg-gray-50 font-semibold text-sm">Email</th>
              <th className="px-4 py-3 text-left border-b border-gray-200 bg-gray-50 font-semibold text-sm">Status</th>
              <th className="px-4 py-3 text-left border-b border-gray-200 bg-gray-50 font-semibold text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td className="px-4 py-3 border-b border-gray-200">{u.name}</td>
                <td className="px-4 py-3 border-b border-gray-200">{u.email}</td>
                <td className="px-4 py-3 border-b border-gray-200">
                  <span className={u.isActive ? 'text-green-600' : 'text-gray-500'}>{u.isActive ? 'Active' : 'Inactive'}</span>
                </td>
                <td className="px-4 py-3 border-b border-gray-200">
                  {u.isActive && (
                    <>
                      <button type="button" onClick={() => startEdit(u)} className="mr-2 py-1.5 px-2.5 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50">Edit</button>
                      <button type="button" onClick={() => handleDeactivate(u._id)} className="py-1.5 px-2.5 text-sm border border-amber-600 text-amber-700 rounded-md bg-white hover:bg-amber-50">Deactivate</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
