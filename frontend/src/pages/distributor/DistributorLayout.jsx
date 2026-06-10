import { Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  Truck,
  MapPin,
  History,
  DollarSign,
  Bell,
  User,
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';

const navItems = [
  { path: '/distributor/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { path: '/distributor/assignments', label: 'Pending Assignments', icon: ClipboardList },
  { path: '/distributor/active', label: 'Active Delivery', icon: Truck },
  { path: '/distributor/tracking', label: 'GPS Tracking', icon: MapPin },
  { path: '/distributor/history', label: 'Delivery History', icon: History },
  { path: '/distributor/earnings', label: 'Earnings', icon: DollarSign },
  { path: '/distributor/notifications', label: 'Notifications', icon: Bell },
  { path: '/distributor/profile', label: 'Profile', icon: User },
];

export default function DistributorLayout() {
  return (
    <DashboardLayout navItems={navItems} title="Distributor Dashboard">
      <Outlet />
    </DashboardLayout>
  );
}
