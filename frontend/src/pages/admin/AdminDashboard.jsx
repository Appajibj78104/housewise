import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  Calendar, 
  Star, 
  Clock, 
  TrendingUp,
  AlertTriangle,
  Activity
} from 'lucide-react';
import { adminAPIService } from '../../services/adminAPI';
// AdminLayout wrapper removed - handled in App.jsx

const AdminDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const response = await adminAPIService.getOverview();
      if (response.success) {
        setOverview(response.data);
      } else {
        setError('Failed to fetch overview data');
      }
    } catch (err) {
      setError('Failed to fetch overview data');
      console.error('Overview fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 text-red-200">
        {error}
      </div>
    );
  }

  const { metrics, recentActivity } = overview || {};

  const metricCards = [
    {
      title: 'Total Customers',
      value: metrics?.totalCustomers || 0,
      icon: Users,
      color: 'bg-blue-600',
      change: '+12%'
    },
    {
      title: 'Active Providers',
      value: metrics?.totalProviders || 0,
      icon: UserCheck,
      color: 'bg-green-600',
      change: '+8%'
    },
    {
      title: 'Pending Approvals',
      value: metrics?.pendingProviders || 0,
      icon: Clock,
      color: 'bg-yellow-600',
      change: metrics?.pendingProviders > 0 ? 'Needs attention' : 'All clear'
    },
    {
      title: 'Total Bookings',
      value: metrics?.totalBookings || 0,
      icon: Calendar,
      color: 'bg-purple-600',
      change: `${metrics?.todayBookings || 0} today`
    },
    {
      title: 'Average Rating',
      value: metrics?.averageProviderRating || 0,
      icon: Star,
      color: 'bg-orange-600',
      change: 'Platform wide'
    },
    {
      title: 'Flagged Reviews',
      value: recentActivity?.flaggedReviews?.length || 0,
      icon: AlertTriangle,
      color: 'bg-red-600',
      change: 'Requires review'
    }
  ];

  return (
    <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h1>
          <p className="text-gray-400">Monitor your platform's key metrics and recent activity</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {metricCards.map((metric, index) => (
            <div key={index} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">{metric.title}</p>
                  <p className="text-3xl font-bold text-white mt-2">
                    {typeof metric.value === 'number' && metric.title.includes('Rating') 
                      ? metric.value.toFixed(1) 
                      : metric.value}
                  </p>
                  <p className="text-gray-500 text-sm mt-1">{metric.change}</p>
                </div>
                <div className={`${metric.color} p-3 rounded-lg`}>
                  <metric.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Bookings */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-blue-400" />
              <h2 className="text-xl font-semibold text-white">Recent Bookings</h2>
            </div>
            <div className="space-y-3">
              {recentActivity?.bookings?.length > 0 ? (
                recentActivity.bookings.map((booking, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                    <div>
                      <p className="text-white font-medium">
                        {booking.customer?.name} → {booking.provider?.name}
                      </p>
                      <p className="text-gray-400 text-sm">{booking.service?.title}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        booking.status === 'confirmed' ? 'bg-green-900 text-green-200' :
                        booking.status === 'pending' ? 'bg-yellow-900 text-yellow-200' :
                        booking.status === 'completed' ? 'bg-blue-900 text-blue-200' :
                        'bg-gray-900 text-gray-200'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center py-4">No recent bookings</p>
              )}
            </div>
          </div>

          {/* Recent Signups */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <h2 className="text-xl font-semibold text-white">Recent Signups</h2>
            </div>
            <div className="space-y-3">
              {recentActivity?.signups?.length > 0 ? (
                recentActivity.signups.map((user, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                    <div>
                      <p className="text-white font-medium">{user.name}</p>
                      <p className="text-gray-400 text-sm">{user.email}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === 'customer' ? 'bg-blue-900 text-blue-200' :
                        'bg-purple-900 text-purple-200'
                      }`}>
                        {user.role === 'housewife' ? 'Provider' : 'Customer'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center py-4">No recent signups</p>
              )}
            </div>
          </div>
        </div>

        {/* Flagged Reviews */}
        {recentActivity?.flaggedReviews?.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <h2 className="text-xl font-semibold text-white">Flagged Reviews</h2>
            </div>
            <div className="space-y-3">
              {recentActivity.flaggedReviews.map((review, index) => (
                <div key={index} className="p-3 bg-red-900/20 border border-red-800 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white font-medium">
                      {review.customer?.name} → {review.provider?.name}
                    </p>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-600'}`} 
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
    </div>
  );
};

export default AdminDashboard;
