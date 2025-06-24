import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Calendar, 
  Star, 
  TrendingUp, 
  Users, 
  IndianRupee,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usersAPI } from '../../services/api';

const DashboardPage = () => {
  const { user, isHousewife, isCustomer, isAdmin } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await usersAPI.getDashboard();
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // Housewife Dashboard
  if (isHousewife()) {
    const stats = dashboardData?.stats || {};
    const recentBookings = dashboardData?.recentBookings || [];

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
            <p className="text-gray-600 mt-2">Manage your services and bookings</p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Link
              to="/services/create"
              className="bg-primary-500 text-white p-6 rounded-lg hover:bg-primary-600 transition-colors"
            >
              <div className="flex items-center">
                <Plus size={24} className="mr-3" />
                <div>
                  <h3 className="font-semibold">Add New Service</h3>
                  <p className="text-primary-100 text-sm">Create a new service offering</p>
                </div>
              </div>
            </Link>
            <Link
              to="/bookings"
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border"
            >
              <div className="flex items-center">
                <Calendar size={24} className="mr-3 text-blue-500" />
                <div>
                  <h3 className="font-semibold text-gray-900">View Bookings</h3>
                  <p className="text-gray-600 text-sm">Manage your appointments</p>
                </div>
              </div>
            </Link>
            <Link
              to="/profile"
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border"
            >
              <div className="flex items-center">
                <Users size={24} className="mr-3 text-green-500" />
                <div>
                  <h3 className="font-semibold text-gray-900">Edit Profile</h3>
                  <p className="text-gray-600 text-sm">Update your information</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Services</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalServices || 0}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-gray-600">
                  {stats.activeServices || 0} active
                </span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalBookings || 0}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-gray-600">
                  {stats.pendingBookings || 0} pending
                </span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Rating</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.averageRating?.toFixed(1) || '0.0'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Star className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-gray-600">
                  {stats.totalReviews || 0} reviews
                </span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                  <p className="text-3xl font-bold text-gray-900">
                    ₹{stats.totalEarnings?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <IndianRupee className="w-6 h-6 text-primary-600" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-gray-600">
                  {stats.completedBookings || 0} completed
                </span>
              </div>
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
                <Link to="/bookings" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                  View All
                </Link>
              </div>
            </div>
            <div className="p-6">
              {recentBookings.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No recent bookings</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentBookings.map((booking) => (
                    <div key={booking._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{booking.service?.title}</h4>
                          <p className="text-sm text-gray-600">
                            Customer: {booking.customer?.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(booking.scheduledDate).toLocaleDateString()} at {booking.scheduledTime?.start}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                          booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {booking.status}
                        </span>
                        <span className="font-medium text-gray-900">
                          ₹{booking.pricing?.agreedAmount}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Customer Dashboard
  if (isCustomer()) {
    const stats = dashboardData?.stats || {};
    const recentBookings = dashboardData?.recentBookings || [];
    const favoriteServices = dashboardData?.favoriteServices || [];

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
            <p className="text-gray-600 mt-2">Find and book services from local housewives</p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Link
              to="/services"
              className="bg-primary-500 text-white p-6 rounded-lg hover:bg-primary-600 transition-colors"
            >
              <div className="flex items-center">
                <Plus size={24} className="mr-3" />
                <div>
                  <h3 className="font-semibold">Find Services</h3>
                  <p className="text-primary-100 text-sm">Browse available services</p>
                </div>
              </div>
            </Link>
            <Link
              to="/bookings"
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border"
            >
              <div className="flex items-center">
                <Calendar size={24} className="mr-3 text-blue-500" />
                <div>
                  <h3 className="font-semibold text-gray-900">My Bookings</h3>
                  <p className="text-gray-600 text-sm">View your appointments</p>
                </div>
              </div>
            </Link>
            <Link
              to="/profile"
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border"
            >
              <div className="flex items-center">
                <Users size={24} className="mr-3 text-green-500" />
                <div>
                  <h3 className="font-semibold text-gray-900">My Profile</h3>
                  <p className="text-gray-600 text-sm">Update your information</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalBookings || 0}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Upcoming Bookings</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.upcomingBookings || 0}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed Services</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.completedBookings || 0}</p>
                </div>
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-primary-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Bookings */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
                  <Link to="/bookings" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                    View All
                  </Link>
                </div>
              </div>
              <div className="p-6">
                {recentBookings.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No recent bookings</p>
                    <Link to="/services" className="btn-primary btn-sm mt-4">
                      Book a Service
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentBookings.slice(0, 3).map((booking) => (
                      <div key={booking._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">{booking.service?.title}</h4>
                          <p className="text-sm text-gray-600">
                            Provider: {booking.provider?.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(booking.scheduledDate).toLocaleDateString()} at {booking.scheduledTime?.start}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                          booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Recommended Services */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Recommended Services</h2>
                  <Link to="/services" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                    View All
                  </Link>
                </div>
              </div>
              <div className="p-6">
                {favoriteServices.length === 0 ? (
                  <div className="text-center py-8">
                    <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No recommendations yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {favoriteServices.slice(0, 3).map((service) => (
                      <Link
                        key={service._id}
                        to={`/services/${service._id}`}
                        className="block p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                      >
                        <h4 className="font-medium text-gray-900">{service.title}</h4>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600 ml-1">
                              {service.rating?.average?.toFixed(1) || '0.0'}
                            </span>
                          </div>
                          <span className="font-medium text-primary-600">
                            ₹{service.pricing?.amount || 'Negotiable'}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Admin Dashboard
  if (isAdmin()) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage the platform</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/admin/users"
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border"
            >
              <div className="flex items-center">
                <Users size={24} className="mr-3 text-blue-500" />
                <div>
                  <h3 className="font-semibold text-gray-900">Manage Users</h3>
                  <p className="text-gray-600 text-sm">View and manage all users</p>
                </div>
              </div>
            </Link>
            <Link
              to="/admin/services"
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border"
            >
              <div className="flex items-center">
                <TrendingUp size={24} className="mr-3 text-green-500" />
                <div>
                  <h3 className="font-semibold text-gray-900">Manage Services</h3>
                  <p className="text-gray-600 text-sm">Approve and manage services</p>
                </div>
              </div>
            </Link>
            <Link
              to="/admin/bookings"
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border"
            >
              <div className="flex items-center">
                <Calendar size={24} className="mr-3 text-primary-500" />
                <div>
                  <h3 className="font-semibold text-gray-900">View Bookings</h3>
                  <p className="text-gray-600 text-sm">Monitor all bookings</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Default fallback
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600">You don't have permission to access this page.</p>
      </div>
    </div>
  );
};

export default DashboardPage;
