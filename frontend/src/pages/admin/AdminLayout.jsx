import { Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Truck,
  Pill,
  ClipboardList,
  BarChart3,
  FileText,
  Bell,
  User,
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';

const navItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { path: '/admin/pharmacies', label: 'Pharmacies', icon: Building2 },
  { path: '/admin/distributors', label: 'Distributors', icon: Truck },
  { path: '/admin/medicines', label: 'Medicines', icon: Pill },
  { path: '/admin/requests', label: 'Requests', icon: ClipboardList },
  { path: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/admin/audit-logs', label: 'Audit Logs', icon: FileText },
  { path: '/admin/notifications', label: 'Notifications', icon: Bell },
  { path: '/admin/profile', label: 'Profile', icon: User },
];

export default function AdminLayout() {
  return (
    <DashboardLayout navItems={navItems} title="Admin Dashboard">
      <Outlet />
    </DashboardLayout>
  );
}
