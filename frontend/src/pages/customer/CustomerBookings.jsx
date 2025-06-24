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
  Phone,
  MessageCircle,
  Filter,
  Search,
  Eye
} from 'lucide-react';
import { customerAPI } from '../../services/api';
import { Card, Button, FormInput, LoadingSpinner } from '../../components/shared';

const CustomerBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    fetchBookings();
  }, [filters, pagination.page]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        status: filters.status !== 'all' ? filters.status : undefined,
        search: filters.search || undefined
      };

      const response = await customerAPI.getBookings(params);
      setBookings(response.data.bookings);
      setPagination(response.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId, reason) => {
    try {
      await customerAPI.cancelBooking(bookingId, reason);
      fetchBookings(); // Refresh the list
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel booking');
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
        return 'bg-green-900 text-green-300 border border-green-700';
      case 'pending':
        return 'bg-yellow-900 text-yellow-300 border border-yellow-700';
      case 'cancelled':
        return 'bg-red-900 text-red-300 border border-red-700';
      case 'completed':
        return 'bg-blue-900 text-blue-300 border border-blue-700';
      default:
        return 'bg-gray-700 text-gray-300 border border-gray-600';
    }
  };

  const canCancelBooking = (booking) => {
    if (booking.status !== 'pending' && booking.status !== 'confirmed') {
      return false;
    }
    
    const scheduledDateTime = new Date(`${booking.scheduledDate}T${booking.scheduledTime.start}`);
    const now = new Date();
    const timeDiff = scheduledDateTime.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 3600);
    
    return hoursDiff >= 2; // Can cancel if at least 2 hours before
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <LoadingSpinner
        size="lg"
        theme="dark"
        text="Loading bookings..."
        fullScreen={true}
      />
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">My Bookings</h1>
            <p className="text-gray-300">Manage your service bookings</p>
          </div>
          <Link to="/customer/services">
            <Button theme="dark" variant="primary" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Book New Service
            </Button>
          </Link>
        </div>
      </div>
      {/* Filters */}
      <Card theme="dark" className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search bookings..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10 w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:border-coral-500 focus:ring-coral-500 focus:outline-none focus:ring-1"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:border-coral-500 focus:ring-coral-500 focus:outline-none focus:ring-1"
            >
              <option value="all">All Bookings</option>
              <option value="upcoming">Upcoming</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="past">Past</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Bookings List */}
      {error && (
        <Card theme="dark" className="mb-6 border-red-600">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
            <span className="text-red-400">{error}</span>
          </div>
        </Card>
      )}

      {bookings.length === 0 ? (
        <Card theme="dark" className="p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No bookings found</h3>
          <p className="text-gray-300 mb-6">
            {filters.status === 'all'
              ? "You haven't made any bookings yet."
              : `No ${filters.status} bookings found.`}
          </p>
          <Link to="/customer/services">
            <Button theme="dark" variant="primary">
              Browse Services
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking._id} theme="dark">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <img
                      src={booking.provider?.profileImage || '/default-avatar.png'}
                      alt={booking.provider?.name || 'Provider'}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">
                      {booking.service?.title || 'Service'}
                    </h3>
                    <p className="text-gray-300 mb-2">
                      with {booking.provider?.name || 'Unknown Provider'}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(booking.scheduledDate)}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {booking.scheduledTime?.start || 'Time TBD'}
                        {booking.scheduledTime?.end && ` - ${booking.scheduledTime.end}`}
                      </div>
                      {booking.pricing?.agreedAmount > 0 && (
                        <div className="flex items-center">
                          <span className="font-medium text-coral-400">₹{booking.pricing.agreedAmount}</span>
                        </div>
                      )}
                    </div>

                    {booking.customerNotes && (
                      <div className="mt-3 p-3 bg-gray-700 rounded-lg">
                        <p className="text-sm text-gray-300">
                          <strong>Notes:</strong> {booking.customerNotes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end space-y-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                    {getStatusIcon(booking.status)}
                  </div>

                  <div className="flex items-center space-x-2">
                    {booking.provider?.phone && (
                      <a
                        href={`tel:${booking.provider.phone}`}
                        className="p-2 text-gray-400 hover:text-coral-400 transition-colors"
                        title="Call provider"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                    )}

                    <Link
                      to={`/customer/bookings/${booking._id}`}
                      className="p-2 text-gray-400 hover:text-coral-400 transition-colors"
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 flex items-center justify-between">
                <div className="text-xs text-gray-400">
                  Booked on {new Date(booking.createdAt).toLocaleDateString()}
                </div>

                <div className="flex items-center space-x-3">
                  {booking.status === 'completed' && !booking.isReviewed && (
                    <Link to={`/customer/reviews/new?booking=${booking._id}`}>
                      <Button theme="dark" variant="outline" size="sm" className="flex items-center gap-1">
                        <Star className="w-4 h-4" />
                        Write Review
                      </Button>
                    </Link>
                  )}

                  {canCancelBooking(booking) && (
                    <Button
                      onClick={() => {
                        const reason = prompt('Please provide a reason for cancellation:');
                        if (reason) {
                          handleCancelBooking(booking._id, reason);
                        }
                      }}
                      theme="dark"
                      variant="outline"
                      size="sm"
                      className="text-red-400 border-red-600 hover:bg-red-900 flex items-center gap-1"
                    >
                      <XCircle className="w-4 h-4" />
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="mt-8 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
              disabled={pagination.page === 1}
              theme="dark"
              variant="outline"
              size="sm"
            >
              Previous
            </Button>

            <span className="px-3 py-2 text-sm text-gray-300">
              Page {pagination.page} of {pagination.pages}
            </span>

            <Button
              onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
              disabled={pagination.page === pagination.pages}
              theme="dark"
              variant="outline"
              size="sm"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerBookings;
