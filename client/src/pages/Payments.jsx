import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ vendorId: '', amount: '', paymentDate: new Date().toISOString().slice(0, 10) });
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  const fetchData = () => {
    Promise.all([api.get('/payments'), api.get('/vendors')])
      .then(([pRes, vRes]) => {
        setPayments(pRes.data.data.payments || []);
        setVendors(vRes.data.data.vendors || []);
      })
      .catch((err) => setError(err.response?.data?.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    api.post('/payments', { vendorId: form.vendorId, amount: Number(form.amount), paymentDate: form.paymentDate })
      .then(() => {
        fetchData();
        setShowForm(false);
        setForm({ vendorId: '', amount: '', paymentDate: new Date().toISOString().slice(0, 10) });
      })
      .catch((err) => setError(err.response?.data?.message));
  };

  const handleDelete = (id) => {
    if (!confirm('Delete this payment? Vendor balance will be restored.')) return;
    api.delete(`/payments/${id}`).then(() => fetchData()).catch((err) => setError(err.response?.data?.message));
  };

  if (loading && payments.length === 0) return <div className="py-8 text-gray-500">Loading...</div>;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold m-0">Payments</h1>
        <button type="button" onClick={() => setShowForm(true)} className="px-4 py-2 bg-gray-900 text-white rounded-lg font-semibold hover:opacity-90">Add Payment</button>
      </div>
      {error && <div className="bg-red-50 text-red-700 py-2.5 px-3 rounded-lg mb-4 text-sm">{error}</div>}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 mb-6 max-w-md">
          <h2 className="text-lg font-medium mb-4">New Payment</h2>
          <label className="block mb-3 text-sm">
            Vendor
            <select value={form.vendorId} onChange={(e) => setForm((f) => ({ ...f, vendorId: e.target.value }))} required className="w-full mt-1 px-2.5 py-2 border border-gray-300 rounded-md">
              <option value="">Select vendor</option>
              {vendors.map((v) => (
                <option key={v._id} value={v._id}>{v.name} (balance: {Number(v.balance).toFixed(2)})</option>
              ))}
            </select>
          </label>
          <label className="block mb-3 text-sm">Amount <input type="number" step="0.01" min="0.01" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} required className="w-full mt-1 px-2.5 py-2 border border-gray-300 rounded-md" /></label>
          <label className="block mb-3 text-sm">Date <input type="date" value={form.paymentDate} onChange={(e) => setForm((f) => ({ ...f, paymentDate: e.target.value }))} className="w-full mt-1 px-2.5 py-2 border border-gray-300 rounded-md" /></label>
          <div className="flex gap-2 mt-4">
            <button type="submit" className="px-4 py-2 bg-gray-900 text-white rounded-md font-medium">Add Payment</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-300 rounded-md bg-white">Cancel</button>
          </div>
        </form>
      )}
      <div className="overflow-auto bg-white border border-gray-200 rounded-xl">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left border-b border-gray-200 bg-gray-50 font-semibold text-sm">Vendor</th>
              <th className="px-4 py-3 text-left border-b border-gray-200 bg-gray-50 font-semibold text-sm">Amount</th>
              <th className="px-4 py-3 text-left border-b border-gray-200 bg-gray-50 font-semibold text-sm">Date</th>
              <th className="px-4 py-3 text-left border-b border-gray-200 bg-gray-50 font-semibold text-sm">Added by</th>
              <th className="px-4 py-3 text-left border-b border-gray-200 bg-gray-50 font-semibold text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p._id}>
                <td className="px-4 py-3 border-b border-gray-200">{p.vendorId?.name || '-'}</td>
                <td className="px-4 py-3 border-b border-gray-200">{Number(p.amount).toFixed(2)}</td>
                <td className="px-4 py-3 border-b border-gray-200">{p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : '-'}</td>
                <td className="px-4 py-3 border-b border-gray-200">{p.addedBy?.name || '-'}</td>
                <td className="px-4 py-3 border-b border-gray-200">
                  <button type="button" onClick={() => handleDelete(p._id)} className="py-1.5 px-2.5 text-sm border border-red-600 text-red-600 rounded-md bg-white hover:bg-red-50">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
