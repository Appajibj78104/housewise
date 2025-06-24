import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Briefcase,
  Calendar,
  Star,
  User,
  LogOut,
  Menu,
  X,
  Shield
} from 'lucide-react';

const ProviderLayout = ({ children }) => {
  const { user, logout, validateSession, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Immediate auth state reaction - redirect if not authenticated
  useEffect(() => {
    console.log('ProviderLayout: Auth state changed', { isAuthenticated, hasUser: !!user, isLoggingOut });

    if (!isAuthenticated && !isLoggingOut) {
      console.log('ProviderLayout: Not authenticated, redirecting to login');
      navigate('/login', { replace: true });
      return;
    }
  }, [isAuthenticated, user, navigate, isLoggingOut]);

  // Legacy token-based authentication check (backup)
  useEffect(() => {
    // Check provider authentication
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    if (storedUser) {
      const userData = JSON.parse(storedUser);
      // Check if user is housewife or provider (service provider)
      if (userData.role !== 'housewife' && userData.role !== 'provider') {
        navigate('/login', { replace: true });
        return;
      }
    } else {
      navigate('/login', { replace: true });
      return;
    }
  }, [navigate]);

  const navigation = [
    {
      name: 'Dashboard',
      href: '/provider/dashboard',
      icon: LayoutDashboard,
      current: location.pathname === '/provider/dashboard'
    },
    {
      name: 'My Services',
      href: '/provider/services',
      icon: Briefcase,
      current: location.pathname === '/provider/services'
    },
    {
      name: 'Bookings',
      href: '/provider/bookings',
      icon: Calendar,
      current: location.pathname === '/provider/bookings'
    },
    {
      name: 'Reviews',
      href: '/provider/reviews',
      icon: Star,
      current: location.pathname === '/provider/reviews'
    },
    {
      name: 'Profile',
      href: '/provider/profile',
      icon: User,
      current: location.pathname === '/provider/profile'
    },
  ];

  const handleLogout = async () => {
    if (isLoggingOut) return; // Prevent multiple logout attempts

    try {
      setIsLoggingOut(true);
      console.log('ProviderLayout: Starting logout process');

      // Call logout and wait for completion
      const result = await logout();

      console.log('ProviderLayout: Logout completed, forcing navigation to login');

      // Use window.location for immediate navigation that bypasses React Router cache
      window.location.href = '/login';

    } catch (error) {
      console.error('ProviderLayout: Logout error:', error);
      // Force navigation to login page even on error using window.location
      window.location.href = '/login';
    }
    // Note: Don't set isLoggingOut to false since we're navigating away
  };

  // Immediate return for unauthenticated state - prevents stale component rendering
  if (!isAuthenticated || !user) {
    if (isLoggingOut) {
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <div className="ml-3 text-white">Logging out...</div>
        </div>
      );
    }

    console.log('ProviderLayout: No authentication, returning null to unmount component');
    return null; // Return null to completely unmount the component
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col`}>
        <div className="flex items-center justify-between h-16 px-4 bg-gray-900">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-blue-500" />
            <span className="text-white font-bold text-lg">Provider Portal</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex flex-col h-full">
          <nav className="flex-1 mt-8 px-4 overflow-y-auto">
            <div className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      console.log(`ProviderLayout: Navigating to ${item.href}`);
                      navigate(item.href);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      item.current
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.name}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Provider Info and Logout at bottom */}
          <div className="px-4 pb-4 mt-4 border-t border-gray-700">
            {/* Provider Info */}
            <div className="pt-4 mb-3">
              <div className="px-3 py-2 bg-gray-700 rounded-lg">
                <div className="text-xs text-gray-400">Logged in as:</div>
                <div className="text-white font-medium text-sm truncate">
                  {user?.name}
                </div>
                <div className="text-xs text-gray-400 capitalize">
                  Service Provider
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors border ${
                isLoggingOut
                  ? 'text-gray-400 border-gray-600 cursor-not-allowed'
                  : 'text-blue-300 hover:bg-blue-600 hover:text-white border-blue-600'
              }`}
            >
              {isLoggingOut ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                  Logging out...
                </>
              ) : (
                <>
                  <LogOut className="h-5 w-5" />
                  Logout
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 min-h-screen">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-gray-800 border-b border-gray-700 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <Menu className="h-6 w-6" />
            </button>

            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold text-white">
                {navigation.find(item => item.current)?.name || 'Provider Dashboard'}
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-400">
                Welcome, <span className="text-white">{user?.name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="bg-gray-900 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default ProviderLayout;
