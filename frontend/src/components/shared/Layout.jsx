import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, X, LogOut } from 'lucide-react';

const Layout = ({ 
  children, 
  navigation, 
  title, 
  userRole, 
  theme = 'dark', // 'dark' or 'light'
  accentColor = 'blue' // 'blue', 'red', 'coral'
}) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Theme configurations
  const themes = {
    dark: {
      sidebar: 'bg-gray-800',
      sidebarHeader: 'bg-gray-900',
      topBar: 'bg-gray-800 border-gray-700',
      text: 'text-white',
      textSecondary: 'text-gray-300',
      textMuted: 'text-gray-400',
      border: 'border-gray-700',
      hover: 'hover:bg-gray-700 hover:text-white',
    },
    light: {
      sidebar: 'bg-white border-r border-gray-200',
      sidebarHeader: 'bg-white border-b border-gray-200',
      topBar: 'bg-white border-b border-gray-200',
      text: 'text-gray-900',
      textSecondary: 'text-gray-700',
      textMuted: 'text-gray-500',
      border: 'border-gray-200',
      hover: 'hover:bg-gray-100',
    }
  };

  const accents = {
    blue: 'bg-blue-600',
    red: 'bg-red-600',
    coral: 'bg-coral-600'
  };

  const currentTheme = themes[theme];
  const currentAccent = accents[accentColor];

  useEffect(() => {
    // Authentication check based on user role
    const token = userRole === 'admin' ?
      localStorage.getItem('adminToken') :
      localStorage.getItem('token');
    const storedUser = userRole === 'admin' ?
      localStorage.getItem('adminUser') :
      localStorage.getItem('user');

    if (!token) {
      navigate('/login');
      return;
    }

    if (storedUser) {
      const userData = JSON.parse(storedUser);
      if (userData.role !== userRole) {
        navigate('/login');
        return;
      }
    } else {
      navigate('/login');
      return;
    }
  }, [navigate, userRole]);

  const handleLogout = async () => {
    try {
      const result = await logout();
      if (result.success) {
        navigate('/login', { replace: true });
      }
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login', { replace: true });
    }
  };

  const isActivePath = (path) => location.pathname === path;

  const getUserDisplayData = () => {
    if (userRole === 'admin') {
      try {
        const adminUser = localStorage.getItem('adminUser');
        return adminUser ? JSON.parse(adminUser) : { name: 'Administrator', email: 'admin@housewise.com' };
      } catch {
        return { name: 'Administrator', email: 'admin@housewise.com' };
      }
    }
    return user || { name: 'User', email: 'user@example.com' };
  };

  const userData = getUserDisplayData();

  return (
    <div className="min-h-screen">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden bg-black bg-opacity-50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 ${currentTheme.sidebar} transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col`}>
        
        {/* Sidebar header */}
        <div className={`flex items-center justify-between h-16 px-4 ${currentTheme.sidebarHeader}`}>
          <div className="flex items-center gap-3">
            <div className={`h-8 w-8 ${currentAccent} rounded-lg flex items-center justify-center`}>
              <span className="text-white font-bold text-sm">H</span>
            </div>
            <span className={`${currentTheme.text} font-bold text-lg`}>
              {title || 'HouseWise'}
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className={`lg:hidden ${currentTheme.textMuted} hover:${currentTheme.text}`}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex flex-col h-full">
          <nav className="flex-1 mt-8 px-4 overflow-y-auto">
            <div className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      navigate(item.href);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      isActivePath(item.href)
                        ? `${currentAccent} text-white`
                        : `${currentTheme.textSecondary} ${currentTheme.hover}`
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.name}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* User info and logout */}
          <div className={`px-4 pb-4 mt-4 border-t ${currentTheme.border}`}>
            <div className="pt-4 mb-3">
              <div className={`px-3 py-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg`}>
                <div className={`text-xs ${currentTheme.textMuted}`}>Logged in as:</div>
                <div className={`${currentTheme.text} font-medium text-sm truncate`}>
                  {userData.name}
                </div>
                <div className={`text-xs ${currentTheme.textMuted} capitalize`}>
                  {userRole === 'housewife' || userRole === 'provider' ? 'Service Provider' : userRole}
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium ${currentTheme.textSecondary} ${currentTheme.hover} rounded-lg transition-colors border ${currentTheme.border}`}
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 min-h-screen">
        {/* Top bar */}
        <div className={`sticky top-0 z-10 ${currentTheme.topBar} px-4 py-4 sm:px-6 lg:px-8`}>
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className={`lg:hidden ${currentTheme.textMuted} hover:${currentTheme.text}`}
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <div className="flex items-center gap-4">
              <h1 className={`text-xl font-semibold ${currentTheme.text}`}>
                {navigation.find(item => isActivePath(item.href))?.name || 'Dashboard'}
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <div className={`text-sm ${currentTheme.textMuted}`}>
                Welcome, <span className={currentTheme.text}>{userData.name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className={`${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} p-4 sm:p-6 lg:p-8`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
