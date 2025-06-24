import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Menu,
  X,
  User,
  LogOut,
  Settings,
  Home,
  Search,
  Calendar,
  Star,
  Shield,
  Sun,
  Moon
} from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsProfileMenuOpen(false);
  };

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  // Navigation items for public pages
  const publicNavItems = [
    { label: 'Browse Services', href: '/#services' },
    { label: 'Features', href: '/#features' },
    { label: 'How It Works', href: '/#how-it-works' },
    { label: 'Pricing', href: '/#pricing' },
    { label: 'About Us', href: '/#about-us' },
    { label: 'Contact Us', href: '/#contact' },
  ];

  const getAuthenticatedLinks = () => {
    if (user?.role === 'customer') {
      return [
        { path: '/customer/dashboard', label: 'Dashboard', icon: Home },
        { path: '/customer/services', label: 'Browse Services', icon: Search },
        { path: '/customer/bookings', label: 'My Bookings', icon: Calendar },
        { path: '/customer/reviews', label: 'My Reviews', icon: Star },
      ];
    } else if (user?.role === 'housewife' || user?.role === 'provider') {
      return [
        { path: '/provider/dashboard', label: 'Dashboard', icon: Home },
        { path: '/provider/services', label: 'My Services', icon: Search },
        { path: '/provider/bookings', label: 'Bookings', icon: Calendar },
      ];
    } else if (user?.role === 'admin') {
      return [
        { path: '/admin/dashboard', label: 'Admin Dashboard', icon: Shield },
        { path: '/admin/customers', label: 'Customers', icon: User },
        { path: '/admin/providers', label: 'Providers', icon: Star },
      ];
    }
    return [
      { path: '/dashboard', label: 'Dashboard', icon: Home },
      { path: '/bookings', label: 'Bookings', icon: Calendar },
    ];
  };

  const authenticatedLinks = getAuthenticatedLinks();

  // Handle smooth scrolling to sections
  const handleSectionNavigation = (href, e) => {
    e.preventDefault();

    // If it's a hash link (starts with /#)
    if (href.startsWith('/#')) {
      const sectionId = href.substring(2); // Remove '/#' to get section id

      // If we're not on the homepage, navigate there first
      if (location.pathname !== '/') {
        navigate('/', { state: { scrollTo: sectionId } });
      } else {
        // We're already on homepage, just scroll
        scrollToSection(sectionId);
      }
    } else {
      // Regular navigation
      navigate(href);
    }
  };

  // Smooth scroll to section
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const navbarHeight = 80; // Account for fixed navbar height
      const elementPosition = element.offsetTop - navbarHeight;

      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    } else {
      // If element not found, try again after a short delay
      setTimeout(() => {
        const retryElement = document.getElementById(sectionId);
        if (retryElement) {
          const navbarHeight = 80;
          const elementPosition = retryElement.offsetTop - navbarHeight;

          window.scrollTo({
            top: elementPosition,
            behavior: 'smooth'
          });
        }
      }, 200);
    }
  };

  // Handle scrolling after navigation (for when coming from other pages)
  useEffect(() => {
    if (location.pathname === '/' && location.state?.scrollTo) {
      // Small delay to ensure the page has rendered
      const timer = setTimeout(() => {
        scrollToSection(location.state.scrollTo);
        // Clear the state to prevent scrolling on subsequent renders
        navigate('/', { replace: true, state: {} });
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [location, navigate]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-ivory/70 backdrop-blur-md border-b border-coral-100 dark:bg-charcoal-900/70 dark:border-charcoal-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 hover:scale-105 transition-transform duration-200">
            <div className="w-10 h-10 bg-gradient-to-br from-coral-500 to-coral-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg font-heading">H</span>
            </div>
            <span className="text-2xl font-bold font-heading text-charcoal-900 dark:text-ivory">
              HouseWise
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {/* Public Navigation Links */}
            {!isAuthenticated && publicNavItems.map((item, index) => (
              item.href.startsWith('/#') ? (
                <button
                  key={item.href}
                  onClick={(e) => handleSectionNavigation(item.href, e)}
                  className="text-charcoal-700 hover:text-coral-500 font-medium transition-colors duration-200 dark:text-charcoal-300 hover:-translate-y-0.5 transform cursor-pointer"
                >
                  {item.label}
                </button>
              ) : (
                <Link
                  key={item.href}
                  to={item.href}
                  className="text-charcoal-700 hover:text-coral-500 font-medium transition-colors duration-200 dark:text-charcoal-300 hover:-translate-y-0.5 transform"
                >
                  {item.label}
                </Link>
              )
            ))}

            {/* Authenticated Navigation Links */}
            {isAuthenticated && authenticatedLinks.map((link) => {
              const IconComponent = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActivePath(link.path)
                      ? 'text-coral-600 bg-coral-50 dark:bg-coral-900/30'
                      : 'text-charcoal-700 hover:text-coral-500 dark:text-charcoal-300'
                  }`}
                >
                  <IconComponent size={16} />
                  <span>{link.label}</span>
                </Link>
              );
            })}

          </nav>

          {/* Right side - Dark mode toggle and Auth buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg bg-charcoal-100 hover:bg-charcoal-200 dark:bg-charcoal-700 dark:hover:bg-charcoal-600 transition-colors duration-200"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-charcoal-600 dark:text-charcoal-300" />
              ) : (
                <Moon className="w-5 h-5 text-charcoal-600 dark:text-charcoal-300" />
              )}
            </button>

            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  className="text-charcoal-700 hover:text-coral-500 font-medium transition-colors duration-200 dark:text-charcoal-300"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="bg-coral-500 hover:bg-coral-600 text-white px-6 py-2 rounded-full font-medium transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center space-x-2 text-charcoal-700 hover:text-coral-500 px-3 py-2 rounded-md text-sm font-medium transition-colors dark:text-charcoal-300"
                >
                  <div className="w-8 h-8 bg-coral-100 rounded-full flex items-center justify-center">
                    {user?.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <User size={16} className="text-coral-600" />
                    )}
                  </div>
                  <span className="text-sm font-medium">{user?.name}</span>
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-charcoal-800 rounded-lg shadow-xl py-1 z-50 border border-charcoal-200 dark:border-charcoal-600">
                    <div className="px-4 py-2 text-xs text-charcoal-500 border-b border-charcoal-200 dark:border-charcoal-600 dark:text-charcoal-400">
                      {user?.email}
                    </div>
                    <Link
                      to={user?.role === 'customer' ? '/customer/profile' : user?.role === 'housewife' ? '/provider/profile' : '/profile'}
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-charcoal-700 hover:bg-charcoal-50 dark:text-charcoal-300 dark:hover:bg-charcoal-700"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <Settings size={16} />
                      <span>Profile Settings</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 w-full text-left px-4 py-2 text-sm text-charcoal-700 hover:bg-charcoal-50 dark:text-charcoal-300 dark:hover:bg-charcoal-700"
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center space-x-2">
            {/* Mobile Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg bg-charcoal-100 hover:bg-charcoal-200 dark:bg-charcoal-700 dark:hover:bg-charcoal-600 transition-colors duration-200"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-charcoal-600 dark:text-charcoal-300" />
              ) : (
                <Moon className="w-5 h-5 text-charcoal-600 dark:text-charcoal-300" />
              )}
            </button>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-charcoal-700 hover:text-coral-500 dark:text-charcoal-300 transition-colors duration-200"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-ivory/95 backdrop-blur-md dark:bg-charcoal-900/95 border-t border-coral-100 dark:border-charcoal-700">
            <div className="px-4 pt-2 pb-3 space-y-1">
              {/* Mobile Public Navigation Links */}
              {!isAuthenticated && publicNavItems.map((item, index) => (
                item.href.startsWith('/#') ? (
                  <button
                    key={item.href}
                    onClick={(e) => {
                      handleSectionNavigation(item.href, e);
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-charcoal-700 hover:text-coral-500 hover:bg-coral-50 dark:text-charcoal-300 dark:hover:bg-charcoal-800 transition-colors duration-200"
                  >
                    {item.label}
                  </button>
                ) : (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="block px-3 py-2 rounded-md text-base font-medium text-charcoal-700 hover:text-coral-500 hover:bg-coral-50 dark:text-charcoal-300 dark:hover:bg-charcoal-800 transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                )
              ))}

              {/* Mobile Authenticated Navigation Links */}
              {isAuthenticated && authenticatedLinks.map((link) => {
                const IconComponent = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                      isActivePath(link.path)
                        ? 'text-coral-600 bg-coral-50 dark:bg-coral-900/30'
                        : 'text-charcoal-700 hover:text-coral-500 hover:bg-coral-50 dark:text-charcoal-300 dark:hover:bg-charcoal-800'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <IconComponent size={20} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}

              {/* Mobile Auth Section */}
              {!isAuthenticated ? (
                <div className="pt-4 border-t border-coral-100 dark:border-charcoal-700">
                  <Link
                    to="/login"
                    className="block px-3 py-2 rounded-md text-base font-medium text-charcoal-700 hover:text-coral-500 hover:bg-coral-50 dark:text-charcoal-300 dark:hover:bg-charcoal-800 transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    className="block px-3 py-2 mt-2 rounded-full text-base font-medium text-white bg-coral-500 hover:bg-coral-600 text-center transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              ) : (
                <div className="pt-4 border-t border-coral-100 dark:border-charcoal-700">
                  <div className="px-3 py-2 text-sm text-charcoal-500 dark:text-charcoal-400">
                    {user?.name} ({user?.email})
                  </div>
                  <Link
                    to={user?.role === 'customer' ? '/customer/profile' : user?.role === 'housewife' ? '/provider/profile' : '/profile'}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-charcoal-700 hover:text-coral-500 hover:bg-coral-50 dark:text-charcoal-300 dark:hover:bg-charcoal-800 transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Settings size={20} />
                    <span>Profile Settings</span>
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center space-x-2 w-full text-left px-3 py-2 rounded-md text-base font-medium text-charcoal-700 hover:text-coral-500 hover:bg-coral-50 dark:text-charcoal-300 dark:hover:bg-charcoal-800 transition-colors duration-200"
                  >
                    <LogOut size={20} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
