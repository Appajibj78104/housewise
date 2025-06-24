import React from 'react';
import { Layout } from '../shared';
import {
  Home,
  Search,
  Calendar,
  Star,
  User,
  Map
} from 'lucide-react';

const CustomerLayout = ({ children }) => {
  const navigation = [
    { name: 'Dashboard', href: '/customer/dashboard', icon: Home },
    { name: 'Browse Services', href: '/customer/services', icon: Search },
    { name: 'Map View', href: '/customer/map', icon: Map },
    { name: 'My Bookings', href: '/customer/bookings', icon: Calendar },
    { name: 'My Reviews', href: '/customer/reviews', icon: Star },
    { name: 'Profile', href: '/customer/profile', icon: User },
  ];

  return (
    <Layout
      navigation={navigation}
      title="HouseWise Customer"
      userRole="customer"
      theme="dark"
      accentColor="coral"
    >
      {children}
    </Layout>
  );
};

export default CustomerLayout;
