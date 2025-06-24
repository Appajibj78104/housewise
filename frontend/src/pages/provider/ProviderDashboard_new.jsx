import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { providerAPI } from '../../services/api';
import {
  CalendarDays,
  Star,
  Users,
  Briefcase,
  CheckCircle,
  Clock,
  TrendingUp,
  AlertCircle,
  MessageSquare
} from 'lucide-react';

const ProviderDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalServices: 0,
    activeServices: 0,
    totalBookings: 0,
    pendingBookings: 0,
    completedServices: 0,
    averageRating: 0,
    totalReviews: 0
  });
  const [todaysBookings, setTodaysBookings] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await providerAPI.getDashboard();
      if (response.success) {
        setStats(response.data.stats);
        setTodaysBookings(response.data.todaysBookings || []);
        setRecentBookings(response.data.recentBookings || []);
      } else {
        setError(response.message || 'Failed to load dashboard data');
      }
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async () => {
    try {
      const response = await providerAPI.updateProfile({
        isAvailable: !user?.isAvailable
      });
      if (response.success) {
        // Update user context or refresh data
        window.location.reload();
      }
    } catch (err) {
      console.error('Toggle availability error:', err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-400">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-400">Here's what's happening with your services today.</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">Available for bookings:</span>
            <button
              onClick={toggleAvailability}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                user?.isAvailable ? 'bg-blue-500' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  user?.isAvailable ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Total Services</p>
              <p className="text-3xl font-bold text-white mt-2">{stats.totalServices}</p>
              <p className="text-gray-500 text-sm mt-1">{stats.activeServices} active</p>
            </div>
            <div className="bg-blue-600 p-3 rounded-lg">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Total Bookings</p>
              <p className="text-3xl font-bold text-white mt-2">{stats.totalBookings}</p>
              <p className="text-gray-500 text-sm mt-1">{stats.pendingBookings} pending</p>
            </div>
            <div className="bg-purple-600 p-3 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Completed</p>
              <p className="text-3xl font-bold text-white mt-2">{stats.completedServices}</p>
              <p className="text-gray-500 text-sm mt-1">services done</p>
            </div>
            <div className="bg-green-600 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Rating</p>
              <p className="text-3xl font-bold text-white mt-2">{stats.averageRating}</p>
              <p className="text-gray-500 text-sm mt-1">{stats.totalReviews} reviews</p>
            </div>
            <div className="bg-orange-600 p-3 rounded-lg">
              <Star className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Today's Bookings */}
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="px-6 py-4 border-b border-gray-700">
            <h3 className="text-lg font-medium text-white flex items-center">
              <CalendarDays className="h-5 w-5 mr-2 text-blue-500" />
              Today's Bookings
            </h3>
          </div>
          <div className="p-6">
            {todaysBookings.length === 0 ? (
              <p className="text-gray-400 text-center py-4">No bookings for today</p>
            ) : (
              <div className="space-y-4">
                {todaysBookings.map((booking) => (
                  <div key={booking._id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium text-white">{booking.service.title}</p>
                      <p className="text-sm text-gray-300">{booking.customer.name}</p>
                      <p className="text-sm text-gray-400">
                        {booking.scheduledTime?.start} - {booking.scheduledTime?.end}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        booking.status === 'confirmed' ? 'bg-green-600 text-green-100' :
                        booking.status === 'pending' ? 'bg-yellow-600 text-yellow-100' :
                        'bg-gray-600 text-gray-100'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="px-6 py-4 border-b border-gray-700">
            <h3 className="text-lg font-medium text-white flex items-center">
              <Clock className="h-5 w-5 mr-2 text-blue-500" />
              Recent Bookings
            </h3>
          </div>
          <div className="p-6">
            {recentBookings.length === 0 ? (
              <p className="text-gray-400 text-center py-4">No recent bookings</p>
            ) : (
              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <div key={booking._id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium text-white">{booking.service.title}</p>
                      <p className="text-sm text-gray-300">{booking.customer.name}</p>
                      <p className="text-sm text-gray-400">
                        {new Date(booking.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        booking.status === 'completed' ? 'bg-green-600 text-green-100' :
                        booking.status === 'confirmed' ? 'bg-blue-600 text-blue-100' :
                        booking.status === 'pending' ? 'bg-yellow-600 text-yellow-100' :
                        'bg-gray-600 text-gray-100'
                      }`}>
                        {booking.status}
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
};

export default ProviderDashboard;
