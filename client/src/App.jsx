import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Companies from './pages/Companies';
import IssueLicense from './pages/IssueLicense';
import Vendors from './pages/Vendors';
import Payments from './pages/Payments';
import RegisterUser from './pages/RegisterUser';
import CompanyUsers from './pages/CompanyUsers';

function AppRoutes() {
  const { token, loading } = useAuth();
  if (loading) return <div className="flex justify-center items-center min-h-screen text-gray-500">Loading...</div>;

  return (
    <Routes>
      <Route path="/login" element={token ? <Navigate to="/" replace /> : <Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="companies" element={<ProtectedRoute allowedRoles={['super_admin']}><Companies /></ProtectedRoute>} />
        <Route path="issue-license" element={<ProtectedRoute allowedRoles={['super_admin']}><IssueLicense /></ProtectedRoute>} />
        <Route path="users/new" element={<ProtectedRoute allowedRoles={['super_admin']}><RegisterUser /></ProtectedRoute>} />
        <Route path="team" element={<ProtectedRoute allowedRoles={['company']}><CompanyUsers /></ProtectedRoute>} />
        <Route path="vendors" element={<Vendors />} />
        <Route path="payments" element={<ProtectedRoute allowedRoles={['company', 'direct_client']}><Payments /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
