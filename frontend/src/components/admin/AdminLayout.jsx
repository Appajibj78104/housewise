import React from 'react';
import { Layout } from '../shared';
import {
  Shield,
  LayoutDashboard,
  Users,
  UserCheck,
  Calendar,
  MessageSquare,
  Settings
} from 'lucide-react';

const AdminLayout = ({ children }) => {
  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Customers', href: '/admin/customers', icon: Users },
    { name: 'Service Providers', href: '/admin/providers', icon: UserCheck },
    { name: 'Bookings', href: '/admin/bookings', icon: Calendar },
    { name: 'Reviews', href: '/admin/reviews', icon: MessageSquare },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <Layout
      navigation={navigation}
      title="HouseWise Admin"
      userRole="admin"
      theme="dark"
      accentColor="red"
    >
      {children}
    </Layout>
  );
};

export default AdminLayout;
