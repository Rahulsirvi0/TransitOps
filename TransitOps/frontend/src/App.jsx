import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import DashboardLayout from './components/layout/DashboardLayout';
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import Dashboard from './pages/dashboard/Dashboard';
import VehicleList from './pages/vehicles/VehicleList';
import VehicleFormPage from './pages/vehicles/VehicleFormPage';
import DriverList from './pages/drivers/DriverList';
import DriverFormPage from './pages/drivers/DriverFormPage';
import TripList from './pages/trips/TripList';
import TripFormPage from './pages/trips/TripFormPage';
import MaintenanceList from './pages/maintenance/MaintenanceList';
import MaintenanceFormPage from './pages/maintenance/MaintenanceFormPage';
import FuelLogList from './pages/fuel/FuelLogList';
import FuelLogFormPage from './pages/fuel/FuelLogFormPage';
import ExpenseList from './pages/expenses/ExpenseList';
import ExpenseFormPage from './pages/expenses/ExpenseFormPage';
import Reports from './pages/reports/Reports';
import Spinner from './components/ui/Spinner';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) return <Spinner className="h-screen" />;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['admin','fleet_manager','safety_officer','financial_analyst']}><Dashboard /></ProtectedRoute>} />
        <Route path="/vehicles" element={<ProtectedRoute allowedRoles={['admin','fleet_manager','safety_officer']}><VehicleList /></ProtectedRoute>} />
        <Route path="/vehicles/new" element={<ProtectedRoute allowedRoles={['admin','fleet_manager']}><VehicleFormPage /></ProtectedRoute>} />
        <Route path="/vehicles/:id/edit" element={<ProtectedRoute allowedRoles={['admin','fleet_manager']}><VehicleFormPage /></ProtectedRoute>} />
        <Route path="/drivers" element={<ProtectedRoute allowedRoles={['admin','fleet_manager']}><DriverList /></ProtectedRoute>} />
        <Route path="/drivers/new" element={<ProtectedRoute allowedRoles={['admin','fleet_manager']}><DriverFormPage /></ProtectedRoute>} />
        <Route path="/drivers/:id/edit" element={<ProtectedRoute allowedRoles={['admin','fleet_manager']}><DriverFormPage /></ProtectedRoute>} />
        <Route path="/trips" element={<ProtectedRoute allowedRoles={['admin','fleet_manager','driver']}><TripList /></ProtectedRoute>} />
        <Route path="/trips/new" element={<ProtectedRoute allowedRoles={['admin','fleet_manager']}><TripFormPage /></ProtectedRoute>} />
        <Route path="/trips/:id/edit" element={<ProtectedRoute allowedRoles={['admin','fleet_manager']}><TripFormPage /></ProtectedRoute>} />
        <Route path="/maintenance" element={<ProtectedRoute allowedRoles={['admin','fleet_manager','safety_officer']}><MaintenanceList /></ProtectedRoute>} />
        <Route path="/maintenance/new" element={<ProtectedRoute allowedRoles={['admin','fleet_manager']}><MaintenanceFormPage /></ProtectedRoute>} />
        <Route path="/maintenance/:id/edit" element={<ProtectedRoute allowedRoles={['admin','fleet_manager']}><MaintenanceFormPage /></ProtectedRoute>} />
        <Route path="/fuel" element={<ProtectedRoute allowedRoles={['admin','fleet_manager','driver']}><FuelLogList /></ProtectedRoute>} />
        <Route path="/fuel/new" element={<ProtectedRoute allowedRoles={['admin','fleet_manager','driver']}><FuelLogFormPage /></ProtectedRoute>} />
        <Route path="/fuel/:id/edit" element={<ProtectedRoute allowedRoles={['admin','fleet_manager']}><FuelLogFormPage /></ProtectedRoute>} />
        <Route path="/expenses" element={<ProtectedRoute allowedRoles={['admin','fleet_manager','financial_analyst']}><ExpenseList /></ProtectedRoute>} />
        <Route path="/expenses/new" element={<ProtectedRoute allowedRoles={['admin','fleet_manager']}><ExpenseFormPage /></ProtectedRoute>} />
        <Route path="/expenses/:id/edit" element={<ProtectedRoute allowedRoles={['admin','fleet_manager']}><ExpenseFormPage /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute allowedRoles={['admin','fleet_manager','financial_analyst']}><Reports /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}