import { Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Search,
  Inbox,
  Send,
  MapPin,
  History,
  Bell,
  User,
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';

const navItems = [
  { path: '/pharmacy/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { path: '/pharmacy/inventory', label: 'Inventory', icon: Package },
  { path: '/pharmacy/request', label: 'Request Medicine', icon: Search },
  { path: '/pharmacy/incoming', label: 'Incoming Requests', icon: Inbox },
  { path: '/pharmacy/outgoing', label: 'Outgoing Requests', icon: Send },
  { path: '/pharmacy/tracking', label: 'Live Tracking', icon: MapPin },
  { path: '/pharmacy/history', label: 'Order History', icon: History },
  { path: '/pharmacy/notifications', label: 'Notifications', icon: Bell },
  { path: '/pharmacy/profile', label: 'Profile', icon: User },
];

export default function PharmacyLayout() {
  return (
    <DashboardLayout navItems={navItems} title="Pharmacy Dashboard">
      <Outlet />
    </DashboardLayout>
  );
}
