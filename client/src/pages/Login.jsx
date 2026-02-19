import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      login(data.token, data.user);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-50">
      {/* Left brand panel (hidden on small screens) */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-10 bg-gradient-to-br from-indigo-500 via-sky-500 to-emerald-400">
        <div className="text-2xl font-bold tracking-wide">
          PixsaLink
        </div>
        <div>
          <h2 className="text-3xl font-semibold mb-2">Multi‑Tenant SaaS</h2>
          <p className="text-slate-100/80 text-sm max-w-md">
            Manage companies, licenses, vendors and payments in a single, secure platform.
          </p>
        </div>
        <p className="text-xs text-slate-100/70">
          © {new Date().getFullYear()} PixsaLink. All rights reserved.
        </p>
      </div>

      {/* Right auth card */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white text-slate-900 rounded-2xl shadow-2xl shadow-slate-900/40 p-8">
          <h1 className="text-2xl font-bold text-center mb-1">Sign in</h1>
          <p className="text-center text-slate-500 text-sm mb-6">
            Use your email and password to access your dashboard.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-700 px-3 py-2.5 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-1.5 text-sm">
              <label className="font-medium text-slate-700" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-base
                           focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
              />
            </div>

            <div className="space-y-1.5 text-sm">
              <label className="font-medium text-slate-700" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-base
                           focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 bg-slate-900 text-white rounded-lg
                         text-sm font-semibold tracking-wide
                         hover:bg-slate-800 disabled:opacity-70 disabled:cursor-not-allowed
                         transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}