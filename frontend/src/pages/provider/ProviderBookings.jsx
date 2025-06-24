import React, { useState, useEffect } from 'react';
import { providerAPI } from '../../services/api';
import {
  Calendar,
  Clock,
  User,
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Search,
  MessageSquare,
  Star
} from 'lucide-react';

const ProviderBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBookings();
  }, [statusFilter, dateFilter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (dateFilter) params.date = dateFilter;
      
      const response = await providerAPI.getMyBookings(params);
      setBookings(response.data.bookings);
    } catch (err) {
      setError('Failed to load bookings');
      console.error('Bookings error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId, status, notes = '') => {
    try {
      await providerAPI.updateBookingStatus(bookingId, { status, notes });
      setBookings(bookings.map(booking => 
        booking._id === bookingId 
          ? { ...booking, status, providerNotes: notes }
          : booking
      ));
    } catch (err) {
      setError('Failed to update booking status');
    }
  };

  const handleAccept = (bookingId) => {
    updateBookingStatus(bookingId, 'confirmed');
  };

  const handleDecline = (bookingId) => {
    const reason = prompt('Please provide a reason for declining (optional):');
    updateBookingStatus(bookingId, 'declined', reason || '');
  };

  const handleComplete = (bookingId) => {
    if (window.confirm('Mark this service as completed?')) {
      updateBookingStatus(bookingId, 'completed');
    }
  };

  const filteredBookings = bookings.filter(booking =>
    booking.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.service.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-600 text-yellow-100';
      case 'confirmed': return 'bg-blue-600 text-blue-100';
      case 'completed': return 'bg-green-600 text-green-100';
      case 'declined': return 'bg-red-600 text-red-100';
      case 'cancelled': return 'bg-gray-600 text-gray-100';
      default: return 'bg-gray-600 text-gray-100';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'Time not set';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Booking Management</h1>
            <p className="text-gray-400">Manage your service bookings and customer requests</p>
          </div>
          <div className="text-sm text-gray-400">
            Total: {filteredBookings.length} bookings
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Search className="w-4 h-4 inline mr-1" />
                Search Bookings
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by customer or service..."
                  className="w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Filter className="w-4 h-4 inline mr-1" />
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="declined">Declined</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Date
              </label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center p-4 bg-red-900 border border-red-700 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-red-300">{error}</span>
          </div>
        )}

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-12 text-center">
            <Calendar className="mx-auto h-24 w-24 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No bookings found</h3>
            <p className="text-gray-400">
              {searchTerm || statusFilter !== 'all' || dateFilter
                ? 'Try adjusting your filters'
                : 'You don\'t have any bookings yet'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredBookings.map((booking) => (
              <div key={booking._id} className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-medium text-white">
                          {booking.service.title}
                        </h3>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-300">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-gray-400" />
                          <div>
                            <span>{booking.customer.name}</span>
                            {booking.customer.feedbackRating?.averageRating > 0 && (
                              <div className="flex items-center mt-1">
                                <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
                                <span className="text-xs text-gray-400">
                                  {booking.customer.feedbackRating.averageRating.toFixed(1)}
                                  ({booking.customer.feedbackRating.totalFeedbacks})
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-gray-400" />
                          <span>{booking.customer.phone || 'No phone'}</span>
                        </div>

                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          <span>{formatDate(booking.scheduledDate)}</span>
                        </div>

                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-gray-400" />
                          <span>
                            {booking.scheduledTime?.start && booking.scheduledTime?.end
                              ? `${formatTime(booking.scheduledTime.start)} - ${formatTime(booking.scheduledTime.end)}`
                              : 'Time not set'
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Booking Details */}
                  {booking.customerNotes && (
                    <div className="mb-4 p-3 bg-gray-700 rounded-lg">
                      <div className="flex items-start">
                        <MessageSquare className="h-4 w-4 mr-2 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-300">Customer Notes:</p>
                          <p className="text-sm text-gray-400">{booking.customerNotes}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {booking.providerNotes && (
                    <div className="mb-4 p-3 bg-blue-900 rounded-lg">
                      <div className="flex items-start">
                        <MessageSquare className="h-4 w-4 mr-2 text-blue-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-blue-300">Your Notes:</p>
                          <p className="text-sm text-blue-400">{booking.providerNotes}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Pricing */}
                  <div className="mb-4">
                    <span className="text-sm text-gray-400">Service Price: </span>
                    <span className="text-sm font-medium text-white">
                      {booking.pricing?.amount
                        ? `₹${booking.pricing.amount}${booking.pricing.type === 'hourly' ? '/hr' : ''}`
                        : 'Price not set'
                      }
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    {booking.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleAccept(booking._id)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center text-sm font-medium"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Accept
                        </button>
                        <button
                          onClick={() => handleDecline(booking._id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center text-sm font-medium"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Decline
                        </button>
                      </>
                    )}

                    {booking.status === 'confirmed' && (
                      <button
                        onClick={() => handleComplete(booking._id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center text-sm font-medium"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Mark as Completed
                      </button>
                    )}

                    {/* Contact Customer */}
                    {booking.customer.phone && (
                      <a
                        href={`tel:${booking.customer.phone}`}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center text-sm font-medium"
                      >
                        <Phone className="h-4 w-4 mr-1" />
                        Call Customer
                      </a>
                    )}

                    {/* WhatsApp Share (Bonus Feature) */}
                    {booking.customer.phone && (
                      <a
                        href={`https://wa.me/91${booking.customer.phone.replace(/\D/g, '')}?text=Hi ${booking.customer.name}, regarding your booking for ${booking.service.title} on ${formatDate(booking.scheduledDate)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center text-sm font-medium"
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
};

export default ProviderBookings;
