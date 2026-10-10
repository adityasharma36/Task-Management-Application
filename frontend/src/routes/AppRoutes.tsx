import { Navigate, Route, Routes } from 'react-router-dom';
import AuthPage from '../pages/AuthPage';
import DashboardPage from '../pages/DashboardPage';
import AppLayout from '../layouts/AppLayout';
import ProtectedRoute from '../components/ProtectedRoute';

export default function AppRoutes() {
  return <Routes>
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route path="/login" element={<AuthPage mode="login" />} />
    <Route path="/register" element={<AuthPage mode="register" />} />
    <Route element={<ProtectedRoute />}><Route element={<AppLayout />}><Route path="/dashboard" element={<DashboardPage />} /></Route></Route>
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>;
}
