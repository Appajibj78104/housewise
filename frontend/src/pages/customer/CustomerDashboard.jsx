import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Star,
  MapPin,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Heart,
  Search,
  MessageSquare
} from 'lucide-react';
import { customerAPI } from '../../services/api';
import { Card, Button, LoadingSpinner } from '../../components/shared';

const CustomerDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await customerAPI.getDashboard();
      setDashboardData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-900/20 text-green-400';
      case 'pending':
        return 'bg-yellow-900/20 text-yellow-400';
      case 'cancelled':
        return 'bg-red-900/20 text-red-400';
      case 'completed':
        return 'bg-blue-900/20 text-blue-400';
      default:
        return 'bg-gray-900/20 text-gray-400';
    }
  };

  if (loading) {
    return (
      <LoadingSpinner
        size="lg"
        theme="dark"
        text="Loading dashboard..."
        fullScreen={true}
      />
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Card theme="dark" className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-gray-300 mb-4">{error}</p>
          <Button
            onClick={fetchDashboardData}
            theme="dark"
            variant="primary"
          >
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  const {
    upcomingBookings = [],
    recentBookings = [],
    stats = {},
    favoriteCategories = [],
    rating = { averageRating: 0, totalReviews: 0 }
  } = dashboardData || {};

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Welcome Back!</h1>
            <p className="text-gray-300">Manage your bookings and discover new services</p>
          </div>
          <Link to="/customer/services">
            <Button
              theme="dark"
              variant="primary"
              className="flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Browse Services
            </Button>
          </Link>
        </div>
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card theme="dark" hover={true}>
          <div className="flex items-center">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Total Bookings</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card theme="dark" hover={true}>
          <div className="flex items-center">
            <div className="p-2 bg-green-600 rounded-lg">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-white">{stats.completed}</p>
            </div>
          </div>
        </Card>

        <Card theme="dark" hover={true}>
          <div className="flex items-center">
            <div className="p-2 bg-yellow-600 rounded-lg">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-white">{stats.pending}</p>
            </div>
          </div>
        </Card>

        <Card theme="dark" hover={true}>
          <div className="flex items-center">
            <div className="p-2 bg-coral-600 rounded-lg">
              <Star className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">My Rating</p>
              <div className="flex items-center">
                <p className="text-2xl font-bold text-white">
                  {rating.averageRating > 0 ? rating.averageRating.toFixed(1) : 'N/A'}
                </p>
                {rating.averageRating > 0 && (
                  <Star className="w-4 h-4 text-yellow-400 fill-current ml-1" />
                )}
              </div>
              <p className="text-xs text-gray-500">
                {rating.totalReviews} review{rating.totalReviews !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upcoming Bookings */}
        <div className="lg:col-span-2">
          <Card theme="dark">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Upcoming Bookings</h2>
                <Link
                  to="/customer/bookings?status=upcoming"
                  className="text-coral-400 hover:text-coral-300 text-sm font-medium"
                >
                  View All
                </Link>
              </div>
            </div>
            <div className="p-6">
              {upcomingBookings.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-300">No upcoming bookings</p>
                  <Link
                    to="/customer/services"
                    className="text-coral-400 hover:text-coral-300 text-sm font-medium"
                  >
                    Book a service
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingBookings.map((booking) => (
                    <div key={booking._id} className="flex items-center p-4 border border-gray-700 rounded-lg bg-gray-800">
                      <div className="flex-shrink-0">
                        <img
                          src={booking.provider.profileImage || '/default-avatar.png'}
                          alt={booking.provider.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-sm font-medium text-white">
                          {booking.service.title}
                        </h3>
                        <p className="text-sm text-gray-300">
                          with {booking.provider.name}
                        </p>
                        <div className="flex items-center mt-1 text-xs text-gray-400">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(booking.scheduledDate).toLocaleDateString()}
                          <Clock className="w-3 h-3 ml-3 mr-1" />
                          {booking.scheduledTime.start}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                        {getStatusIcon(booking.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Favorite Categories */}
          <Card theme="dark">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-white">Your Favorites</h2>
            </div>
            <div className="p-6">
              {favoriteCategories.length === 0 ? (
                <div className="text-center py-4">
                  <Heart className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-300 text-sm">No favorites yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {favoriteCategories.map((category) => (
                    <div key={category._id} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-white capitalize">
                        {category._id}
                      </span>
                      <span className="text-sm text-gray-400">
                        {category.count} bookings
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card theme="dark">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-white">Quick Actions</h2>
            </div>
            <div className="p-6 space-y-3">
              <Link
                to="/customer/services"
                className="block w-full text-left p-3 rounded-lg border border-gray-700 hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center">
                  <Search className="w-5 h-5 text-coral-400 mr-3" />
                  <span className="text-sm font-medium text-white">Browse Services</span>
                </div>
              </Link>
              <Link
                to="/customer/bookings"
                className="block w-full text-left p-3 rounded-lg border border-gray-700 hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-coral-400 mr-3" />
                  <span className="text-sm font-medium text-white">My Bookings</span>
                </div>
              </Link>

              <Link
                to="/customer/profile"
                className="block w-full text-left p-3 rounded-lg border border-gray-700 hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center">
                  <User className="w-5 h-5 text-coral-400 mr-3" />
                  <span className="text-sm font-medium text-white">My Profile</span>
                </div>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
