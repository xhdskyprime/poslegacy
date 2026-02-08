import type { ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import POS from './pages/POS';
import Products from './pages/Products';
import History from './pages/History';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import Promos from './pages/Promos';
import Users from './pages/Users';
import ActivityLog from './pages/ActivityLog';
import { useStore } from './store/useStore';

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const user = useStore((state) => state.user);
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: ReactNode }) => {
  const user = useStore((state) => state.user);
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<POS />} />
          <Route path="products" element={<Products />} />
          <Route path="history" element={<History />} />
          <Route path="dashboard" element={
            <AdminRoute>
              <Dashboard />
            </AdminRoute>
          } />
          <Route path="reports" element={
            <AdminRoute>
              <Reports />
            </AdminRoute>
          } />
          <Route path="promos" element={
            <AdminRoute>
              <Promos />
            </AdminRoute>
          } />
          <Route path="users" element={
            <AdminRoute>
              <Users />
            </AdminRoute>
          } />
          <Route path="activity-log" element={
            <AdminRoute>
              <ActivityLog />
            </AdminRoute>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
