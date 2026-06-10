import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { NotificationProvider } from './contexts/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminPharmacies from './pages/admin/AdminPharmacies';
import AdminDistributors from './pages/admin/AdminDistributors';
import AdminMedicines from './pages/admin/AdminMedicines';
import AdminRequests from './pages/admin/AdminRequests';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminAuditLogs from './pages/admin/AdminAuditLogs';
import PharmacyLayout from './pages/pharmacy/PharmacyLayout';
import PharmacyDashboard from './pages/pharmacy/PharmacyDashboard';
import PharmacyInventory from './pages/pharmacy/PharmacyInventory';
import PharmacyRequest from './pages/pharmacy/PharmacyRequest';
import PharmacyIncoming from './pages/pharmacy/PharmacyIncoming';
import PharmacyOutgoing from './pages/pharmacy/PharmacyOutgoing';
import PharmacyTracking from './pages/pharmacy/PharmacyTracking';
import PharmacyHistory from './pages/pharmacy/PharmacyHistory';
import DistributorLayout from './pages/distributor/DistributorLayout';
import DistributorDashboard from './pages/distributor/DistributorDashboard';
import DistributorAssignments from './pages/distributor/DistributorAssignments';
import DistributorActive from './pages/distributor/DistributorActive';
import DistributorTracking from './pages/distributor/DistributorTracking';
import DistributorHistory from './pages/distributor/DistributorHistory';
import DistributorEarnings from './pages/distributor/DistributorEarnings';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <NotificationProvider>
            <Toaster position="top-right" />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="pharmacies" element={<AdminPharmacies />} />
                <Route path="distributors" element={<AdminDistributors />} />
                <Route path="medicines" element={<AdminMedicines />} />
                <Route path="requests" element={<AdminRequests />} />
                <Route path="analytics" element={<AdminAnalytics />} />
                <Route path="audit-logs" element={<AdminAuditLogs />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="profile" element={<ProfilePage />} />
              </Route>

              <Route
                path="/pharmacy"
                element={
                  <ProtectedRoute allowedRoles={['pharmacy']}>
                    <PharmacyLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<PharmacyDashboard />} />
                <Route path="inventory" element={<PharmacyInventory />} />
                <Route path="request" element={<PharmacyRequest />} />
                <Route path="incoming" element={<PharmacyIncoming />} />
                <Route path="outgoing" element={<PharmacyOutgoing />} />
                <Route path="tracking" element={<PharmacyTracking />} />
                <Route path="history" element={<PharmacyHistory />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="profile" element={<ProfilePage />} />
              </Route>

              <Route
                path="/distributor"
                element={
                  <ProtectedRoute allowedRoles={['distributor']}>
                    <DistributorLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<DistributorDashboard />} />
                <Route path="assignments" element={<DistributorAssignments />} />
                <Route path="active" element={<DistributorActive />} />
                <Route path="tracking" element={<DistributorTracking />} />
                <Route path="history" element={<DistributorHistory />} />
                <Route path="earnings" element={<DistributorEarnings />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="profile" element={<ProfilePage />} />
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </NotificationProvider>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
