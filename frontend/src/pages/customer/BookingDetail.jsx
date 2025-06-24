import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  MessageCircle,
  MessageSquare,
  Star,
  CheckCircle,
  XCircle,
  AlertCircle,
  IndianRupee,
  FileText,
  Edit3
} from 'lucide-react';
import { customerAPI } from '../../services/api';
import { Card, Button, LoadingSpinner } from '../../components/shared';

const BookingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchBookingDetails();
  }, [id]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      const response = await customerAPI.getBookingById(id);
      setBooking(response.data.booking);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    const reason = prompt('Please provide a reason for cancellation:');
    if (!reason) return;

    try {
      setCancelling(true);
      await customerAPI.cancelBooking(id, reason);
      fetchBookingDetails(); // Refresh booking data
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'pending':
        return <Clock className="w-6 h-6 text-yellow-500" />;
      case 'cancelled':
        return <XCircle className="w-6 h-6 text-red-500" />;
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-blue-500" />;
      default:
        return <AlertCircle className="w-6 h-6 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-900 text-green-300 border-green-600';
      case 'pending':
        return 'bg-yellow-900 text-yellow-300 border-yellow-600';
      case 'cancelled':
        return 'bg-red-900 text-red-300 border-red-600';
      case 'completed':
        return 'bg-blue-900 text-blue-300 border-blue-600';
      default:
        return 'bg-gray-700 text-gray-300 border-gray-600';
    }
  };

  const canCancelBooking = () => {
    if (!booking || booking.status !== 'pending' && booking.status !== 'confirmed') {
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
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <LoadingSpinner
        size="lg"
        theme="dark"
        text="Loading booking details..."
        fullScreen={true}
      />
    );
  }

  if (error || !booking) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <Card theme="dark" className="max-w-md mx-auto text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-gray-300 mb-4">{error || 'Booking not found'}</p>
          <Button
            onClick={() => navigate('/customer/bookings')}
            theme="dark"
            variant="primary"
          >
            Back to Bookings
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <Button
            onClick={() => navigate('/customer/bookings')}
            theme="dark"
            variant="ghost"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Bookings
          </Button>
          <div className="flex items-center space-x-3">
            <div className={`px-4 py-2 rounded-full border ${getStatusColor(booking.status)}`}>
              <div className="flex items-center space-x-2">
                {getStatusIcon(booking.status)}
                <span className="font-medium capitalize">{booking.status}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Booking Overview */}
            <Card theme="dark">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-white mb-2">
                    {booking.service?.title}
                  </h1>
                  <p className="text-gray-300">
                    Booking ID: <span className="font-mono">{booking.bookingId}</span>
                  </p>
                </div>
                <span className="px-3 py-1 bg-coral-900 text-coral-300 text-sm font-medium rounded-full">
                  {booking.service?.category}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-400">Date</p>
                      <p className="font-medium text-white">{formatDate(booking.scheduledDate)}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-400">Time</p>
                      <p className="font-medium text-white">
                        {formatTime(booking.scheduledTime.start)}
                        {booking.scheduledTime.end && ` - ${formatTime(booking.scheduledTime.end)}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-400">Location</p>
                      <p className="font-medium text-white capitalize">
                        {booking.location?.type?.replace('_', ' ') || 'Not specified'}
                      </p>
                      {booking.location?.address && (
                        <p className="text-sm text-gray-400">
                          {typeof booking.location.address === 'string'
                            ? booking.location.address
                            : `${booking.location.address.street || ''}, ${booking.location.address.city || ''}, ${booking.location.address.state || ''} ${booking.location.address.pincode || ''}`.replace(/,\s*,/g, ',').replace(/^,\s*|,\s*$/g, '')
                          }
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <IndianRupee className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-400">Amount</p>
                      <p className="font-medium text-lg text-white">
                        ₹{booking.pricing?.agreedAmount || 'TBD'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-400">Duration</p>
                      <p className="font-medium text-white">
                        {booking.duration?.estimated || 'Not specified'} minutes
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-400">Booked on</p>
                      <p className="font-medium text-white">
                        {new Date(booking.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Notes */}
              {booking.customerNotes && (
                <div className="mt-6 p-4 bg-gray-700 rounded-lg">
                  <div className="flex items-start">
                    <MessageSquare className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Special Instructions</p>
                      <p className="text-gray-300">{booking.customerNotes}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Cancellation Info */}
              {booking.status === 'cancelled' && booking.cancellation && (
                <div className="mt-6 p-4 bg-red-900 border border-red-600 rounded-lg">
                  <h4 className="font-medium text-red-300 mb-2">Cancellation Details</h4>
                  <p className="text-sm text-red-400 mb-1">
                    <strong>Reason:</strong> {booking.cancellation.reason}
                  </p>
                  <p className="text-sm text-red-400">
                    <strong>Cancelled on:</strong> {new Date(booking.cancellation.cancelledAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </Card>

            {/* Action Buttons */}
            <Card theme="dark">
              <h3 className="text-lg font-semibold text-white mb-4">Actions</h3>
              <div className="flex flex-wrap gap-3">
                {booking.status === 'completed' && !booking.isReviewed && (
                  <Link to={`/customer/reviews/new?booking=${booking._id}`}>
                    <Button theme="dark" variant="primary" className="flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      Write Review
                    </Button>
                  </Link>
                )}

                {canCancelBooking() && (
                  <Button
                    onClick={handleCancelBooking}
                    disabled={cancelling}
                    theme="dark"
                    variant="outline"
                    className="text-red-400 border-red-600 hover:bg-red-900 flex items-center gap-2"
                  >
                    {cancelling ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400"></div>
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    {cancelling ? 'Cancelling...' : 'Cancel Booking'}
                  </Button>
                )}

                <Link to={`/customer/services/${booking.service?._id}`}>
                  <Button theme="dark" variant="outline" className="flex items-center gap-2">
                    <Edit3 className="w-4 h-4" />
                    View Service
                  </Button>
                </Link>
              </div>

              {!canCancelBooking() && (booking.status === 'pending' || booking.status === 'confirmed') && (
                <p className="mt-3 text-sm text-gray-400">
                  Bookings can only be cancelled at least 2 hours before the scheduled time.
                </p>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Provider Info */}
            <Card theme="dark" className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">Service Provider</h3>
              <div className="flex items-start space-x-4">
                <img
                  src={booking.provider?.profileImage || '/default-avatar.png'}
                  alt={booking.provider?.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-white">{booking.provider?.name}</h4>
                  {booking.provider?.rating && (
                    <div className="flex items-center mt-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="ml-1 text-sm text-gray-300">
                        {booking.provider.rating.average?.toFixed(1)} ({booking.provider.rating.count} reviews)
                      </span>
                    </div>
                  )}
                  <div className="mt-3 space-y-2">
                    {booking.provider?.phone && (
                      <a
                        href={`tel:${booking.provider.phone}`}
                        className="flex items-center text-sm text-coral-400 hover:text-coral-300"
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Call Provider
                      </a>
                    )}
                    <button className="flex items-center text-sm text-coral-400 hover:text-coral-300">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Send Message
                    </button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Booking Timeline */}
            <Card theme="dark">
              <h3 className="text-lg font-semibold text-white mb-4">Booking Timeline</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-white">Booking Created</p>
                    <p className="text-xs text-gray-400">
                      {new Date(booking.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {booking.status === 'confirmed' && (
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-white">Booking Confirmed</p>
                      <p className="text-xs text-gray-400">
                        {new Date(booking.updatedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                {booking.status === 'cancelled' && booking.cancellation && (
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-2 h-2 bg-red-400 rounded-full mt-2"></div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-white">Booking Cancelled</p>
                      <p className="text-xs text-gray-400">
                        {new Date(booking.cancellation.cancelledAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                {booking.status === 'completed' && (
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-white">Service Completed</p>
                      <p className="text-xs text-gray-400">
                        {new Date(booking.updatedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetail;
