import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function DashboardLayout() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navClass = ({ isActive }) =>
    `block py-2.5 px-6 rounded-r-lg transition-colors ${
      isActive ? 'text-white bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'
    }`;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-60 flex flex-col bg-gradient-to-b from-[#1a1d29] to-[#252936] text-gray-200 py-6">
        <div className="px-6 pb-6 mb-4 border-b border-white/10 text-xl font-bold tracking-wide">
          PixsaLink
        </div>
        <nav className="flex flex-col gap-1 flex-1">
          {role === 'super_admin' && (
            <>
              <NavLink to="/" end className={navClass}>Dashboard</NavLink>
              <NavLink to="/companies" className={navClass}>Companies</NavLink>
              <NavLink to="/issue-license" className={navClass}>Issue License</NavLink>
              <NavLink to="/vendors" className={navClass}>All Vendors</NavLink>
              <NavLink to="/users/new" className={navClass}>Create User</NavLink>
            </>
          )}
          {role === 'company' && (
            <>
              <NavLink to="/" end className={navClass}>Dashboard</NavLink>
              <NavLink to="/team" className={navClass}>Team</NavLink>
              <NavLink to="/vendors" className={navClass}>Vendors</NavLink>
              <NavLink to="/payments" className={navClass}>Payments</NavLink>
            </>
          )}
          {role === 'direct_client' && (
            <>
              <NavLink to="/" end className={navClass}>Dashboard</NavLink>
              <NavLink to="/vendors" className={navClass}>Vendors</NavLink>
              <NavLink to="/payments" className={navClass}>Payments</NavLink>
            </>
          )}
        </nav>
        <div className="px-6 pt-4 border-t border-white/10 flex flex-col gap-1">
          <span>{user?.name}</span>
          <span className="text-xs text-gray-500 capitalize">{role}</span>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-2 py-1.5 px-3 text-sm border border-white/20 rounded-md hover:bg-white/10 transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
