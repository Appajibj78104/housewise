import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layout Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Page Components
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

import HousewifeProfilePage from './pages/profiles/HousewifeProfilePage';
import DashboardPage from './pages/dashboard/DashboardPage';
import BookingsPage from './pages/bookings/BookingsPage';
import BookingDetailPage from './pages/bookings/BookingDetailPage';
import ProfilePage from './pages/profile/ProfilePage';
// AdminLogin removed - using normal login for admin
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminProviders from './pages/admin/AdminProviders';
import AdminBookings from './pages/admin/AdminBookings';
import AdminReviews from './pages/admin/AdminReviews';
import AdminSettings from './pages/admin/AdminSettings';
import NotFoundPage from './pages/NotFoundPage';

// Provider Components
import ProviderLayout from './components/provider/ProviderLayout';
import ProviderDashboard from './pages/provider/ProviderDashboard';
import ProviderProfile from './pages/provider/ProviderProfile';
import ProviderServices from './pages/provider/ProviderServices';
import ServiceForm from './pages/provider/ServiceForm';
import ProviderBookings from './pages/provider/ProviderBookings';
import ProviderReviews from './pages/provider/ProviderReviews';

// Customer Components
import CustomerLayout from './components/customer/CustomerLayout';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CustomerProfile from './pages/customer/CustomerProfile';
import CustomerBookings from './pages/customer/CustomerBookings';
import BookingDetail from './pages/customer/BookingDetail';
import BrowseServices from './pages/customer/BrowseServices';
import ServiceDetail from './pages/customer/ServiceDetail';
import CustomerReviews from './pages/customer/CustomerReviews';
import ReviewForm from './pages/customer/ReviewForm';
import ServiceMapDiscovery from './pages/customer/ServiceMapDiscovery';

// Helper function to normalize user roles for backward compatibility
const normalizeUserRole = (role) => {
  if (role === 'provider') return 'housewife'; // Normalize provider to housewife
  return role;
};

// Helper function to check if roles match (with normalization)
const rolesMatch = (userRole, requiredRole) => {
  const normalizedUserRole = normalizeUserRole(userRole);
  const normalizedRequiredRole = normalizeUserRole(requiredRole);
  return normalizedUserRole === normalizedRequiredRole;
};

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, user, isLoading, logout } = useAuth();

  // Debug logging for navigation issues
  if (requiredRole) {
    console.log('ProtectedRoute Debug:', {
      isAuthenticated,
      userRole: user?.role,
      normalizedUserRole: normalizeUserRole(user?.role),
      requiredRole,
      normalizedRequiredRole: normalizeUserRole(requiredRole),
      roleMatch: rolesMatch(user?.role, requiredRole),
      currentPath: window.location.pathname
    });
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-coral-500"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    console.log('ProtectedRoute: Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && !rolesMatch(user?.role, requiredRole)) {
    console.log(`ProtectedRoute: Role mismatch. Required: ${requiredRole}, User: ${user?.role}`);
    // Redirect to appropriate dashboard based on user role
    const normalizedRole = normalizeUserRole(user?.role);
    if (normalizedRole === 'housewife') {
      return <Navigate to="/provider/dashboard" replace />;
    } else if (normalizedRole === 'customer') {
      return <Navigate to="/customer/dashboard" replace />;
    } else if (normalizedRole === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else {
      console.log('ProtectedRoute: Unknown role, redirecting to login');
      return <Navigate to="/login" replace />;
    }
  }

  console.log('ProtectedRoute: Access granted - rendering children');
  return children;
};

// Public Route Component (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Debug logging for public route access
  console.log('PublicRoute Debug:', {
    isAuthenticated,
    isLoading,
    userRole: user?.role,
    currentPath: window.location.pathname,
    hasUser: !!user
  });

  if (isLoading) {
    console.log('PublicRoute: Loading state, showing spinner');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-coral-500"></div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    console.log('PublicRoute: User is authenticated, redirecting to dashboard');
    // Redirect based on normalized user role
    const normalizedRole = normalizeUserRole(user?.role);
    if (normalizedRole === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (normalizedRole === 'housewife') {
      return <Navigate to="/provider/dashboard" replace />;
    } else if (normalizedRole === 'customer') {
      return <Navigate to="/customer/dashboard" replace />;
    } else {
      // Unknown role, stay on public route
      console.warn('PublicRoute: Unknown user role:', user?.role);
    }
  }

  console.log('PublicRoute: User not authenticated, showing public content');
  return children;
};

// Main App Layout
const AppLayout = ({ children, showNavbar = true, showFooter = true }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {showNavbar && <Navbar />}
      <main className="flex-1">
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
};

// App Component
function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                theme: {
                  primary: '#4aed88',
                },
              },
            }}
          />

          <Routes>
            {/* Public Routes */}
            <Route path="/" element={
              <AppLayout>
                <HomePage />
              </AppLayout>
            } />



            <Route path="/housewife/:id" element={
              <AppLayout>
                <HousewifeProfilePage />
              </AppLayout>
            } />

            {/* Auth Routes */}
            <Route path="/login" element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            } />

            <Route path="/register" element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            } />

            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <AppLayout>
                  <DashboardPage />
                </AppLayout>
              </ProtectedRoute>
            } />

            <Route path="/bookings" element={
              <ProtectedRoute>
                <AppLayout>
                  <BookingsPage />
                </AppLayout>
              </ProtectedRoute>
            } />

            <Route path="/bookings/:id" element={
              <ProtectedRoute>
                <AppLayout>
                  <BookingDetailPage />
                </AppLayout>
              </ProtectedRoute>
            } />

            <Route path="/profile" element={
              <ProtectedRoute>
                <AppLayout>
                  <ProfilePage />
                </AppLayout>
              </ProtectedRoute>
            } />

            {/* Provider Routes - Accept both 'housewife' and 'provider' roles */}
            <Route path="/provider/dashboard" element={
              <ProtectedRoute requiredRole="provider">
                <ProviderLayout>
                  <ProviderDashboard />
                </ProviderLayout>
              </ProtectedRoute>
            } />

            <Route path="/provider/profile" element={
              <ProtectedRoute requiredRole="provider">
                <ProviderLayout>
                  <ProviderProfile />
                </ProviderLayout>
              </ProtectedRoute>
            } />

            <Route path="/provider/services" element={
              <ProtectedRoute requiredRole="provider">
                <ProviderLayout>
                  <ProviderServices />
                </ProviderLayout>
              </ProtectedRoute>
            } />

            <Route path="/provider/services/new" element={
              <ProtectedRoute requiredRole="provider">
                <ProviderLayout>
                  <ServiceForm />
                </ProviderLayout>
              </ProtectedRoute>
            } />

            <Route path="/provider/services/:id/edit" element={
              <ProtectedRoute requiredRole="provider">
                <ProviderLayout>
                  <ServiceForm />
                </ProviderLayout>
              </ProtectedRoute>
            } />

            <Route path="/provider/bookings" element={
              <ProtectedRoute requiredRole="provider">
                <ProviderLayout>
                  <ProviderBookings />
                </ProviderLayout>
              </ProtectedRoute>
            } />

            <Route path="/provider/reviews" element={
              <ProtectedRoute requiredRole="provider">
                <ProviderLayout>
                  <ProviderReviews />
                </ProviderLayout>
              </ProtectedRoute>
            } />

            {/* Customer Routes */}
            <Route path="/customer/dashboard" element={
              <ProtectedRoute requiredRole="customer">
                <CustomerLayout>
                  <CustomerDashboard />
                </CustomerLayout>
              </ProtectedRoute>
            } />

            <Route path="/customer/profile" element={
              <ProtectedRoute requiredRole="customer">
                <CustomerLayout>
                  <CustomerProfile />
                </CustomerLayout>
              </ProtectedRoute>
            } />

            <Route path="/customer/bookings" element={
              <ProtectedRoute requiredRole="customer">
                <CustomerLayout>
                  <CustomerBookings />
                </CustomerLayout>
              </ProtectedRoute>
            } />

            <Route path="/customer/bookings/:id" element={
              <ProtectedRoute requiredRole="customer">
                <CustomerLayout>
                  <BookingDetail />
                </CustomerLayout>
              </ProtectedRoute>
            } />

            <Route path="/customer/services" element={
              <ProtectedRoute requiredRole="customer">
                <CustomerLayout>
                  <BrowseServices />
                </CustomerLayout>
              </ProtectedRoute>
            } />

            <Route path="/customer/services/:id" element={
              <ProtectedRoute requiredRole="customer">
                <CustomerLayout>
                  <ServiceDetail />
                </CustomerLayout>
              </ProtectedRoute>
            } />

            <Route path="/customer/reviews" element={
              <ProtectedRoute requiredRole="customer">
                <CustomerLayout>
                  <CustomerReviews />
                </CustomerLayout>
              </ProtectedRoute>
            } />

            <Route path="/customer/reviews/new" element={
              <ProtectedRoute requiredRole="customer">
                <CustomerLayout>
                  <ReviewForm />
                </CustomerLayout>
              </ProtectedRoute>
            } />

            <Route path="/customer/map" element={
              <ProtectedRoute requiredRole="customer">
                <CustomerLayout>
                  <ServiceMapDiscovery />
                </CustomerLayout>
              </ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              </ProtectedRoute>
            } />

            <Route path="/admin/customers" element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <AdminCustomers />
                </AdminLayout>
              </ProtectedRoute>
            } />

            <Route path="/admin/providers" element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <AdminProviders />
                </AdminLayout>
              </ProtectedRoute>
            } />

            <Route path="/admin/bookings" element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <AdminBookings />
                </AdminLayout>
              </ProtectedRoute>
            } />

            <Route path="/admin/reviews" element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <AdminReviews />
                </AdminLayout>
              </ProtectedRoute>
            } />

            <Route path="/admin/settings" element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <AdminSettings />
                </AdminLayout>
              </ProtectedRoute>
            } />

            {/* 404 Route */}
            <Route path="*" element={
              <AppLayout>
                <NotFoundPage />
              </AppLayout>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
