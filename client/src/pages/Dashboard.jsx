import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Dashboard() {
  const { role } = useAuth();
  const [license, setLicense] = useState(null);
  const [stats, setStats] = useState({ vendors: 0, payments: 0 });

  useEffect(() => {
    if (role === 'super_admin') return;
    api.get('/auth/me').then((res) => setLicense(res.data.data.license));
  }, [role]);

  useEffect(() => {
    if (role === 'super_admin') return;
    Promise.all([api.get('/vendors'), api.get('/payments')])
      .then(([v, p]) => setStats({ vendors: v.data.count || 0, payments: p.data.count || 0 }))
      .catch(() => {});
  }, [role]);

  const cardClass = 'bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-2';

  if (role === 'super_admin') {
    return (
      <div className="max-w-3xl">
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Super Admin Dashboard</h1>
        <p className="text-gray-500 mb-6">Manage companies, issue licenses, and view all vendors from here.</p>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4">
          <div className={cardClass}>
            <span className="text-sm text-gray-500">Companies</span>
            <Link to="/companies" className="text-gray-900 font-semibold hover:underline">
              Manage Companies
            </Link>
          </div>
          <div className={cardClass}>
            <span className="text-sm text-gray-500">Licenses</span>
            <Link to="/issue-license" className="text-gray-900 font-semibold hover:underline">
              Issue License
            </Link>
          </div>
          <div className={cardClass}>
            <span className="text-sm text-gray-500">Vendors</span>
            <Link to="/vendors" className="text-gray-900 font-semibold hover:underline">
              View All Vendors
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-xl font-semibold text-gray-900 mb-2">Dashboard</h1>
      {license && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
          <h2 className="text-lg font-medium mb-3">License Info</h2>
          <p className="my-1.5 text-sm"><strong>Type:</strong> {license.type}</p>
          {license.maxUsers != null && <p className="my-1.5 text-sm"><strong>Max Users:</strong> {license.maxUsers}</p>}
          <p className="my-1.5 text-sm"><strong>Expires:</strong> {new Date(license.expiryDate).toLocaleDateString()}</p>
        </div>
      )}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4">
        <div className={cardClass}>
          <span className="text-sm text-gray-500">Vendors</span>
          <span className="text-2xl font-bold text-gray-900">{stats.vendors}</span>
        </div>
        <div className={cardClass}>
          <span className="text-sm text-gray-500">Payments</span>
          <span className="text-2xl font-bold text-gray-900">{stats.payments}</span>
        </div>
      </div>
    </div>
  );
}
