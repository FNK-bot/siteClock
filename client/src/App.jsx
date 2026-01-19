import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/useAuthStore';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Tasks from './pages/admin/Tasks';
import Employees from './pages/admin/Employees';
import EmployeeDashboard from './pages/EmployeeDashboard';
import ToastContainer from './components/ToastContainer';

function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <>
      <ToastContainer />
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<Dashboard />} />
              <Route path="/admin/tasks" element={<Tasks />} />
              <Route path="/admin/employees" element={<Employees />} />
            </Route>
          </Route>

          {/* Employee Routes */}
          <Route element={<ProtectedRoute allowedRoles={['employee', 'admin']} />}>
            <Route path="/" element={user?.role === 'admin' ? <Navigate to="/admin" /> : <EmployeeDashboard />} />
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;
