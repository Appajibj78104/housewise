import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  DollarSign, 
  Filter, 
  Search, 
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { adminAPIService } from '../../services/adminAPI';
import { toast } from 'react-hot-toast';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  console.log('AdminBookings component rendered');

  // Filter states
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    page: 1,
    limit: 10
  });

  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0
  });

  // Status options for filtering
  const statusOptions = [
    { value: 'all', label: 'All Bookings' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(''); // Clear previous errors
      console.log('Fetching bookings with filters:', filters);
      
      const response = await adminAPIService.getBookings(filters);
      console.log('Bookings response:', response);
      
      if (response.success) {
        setBookings(response.data.bookings || []);
        setPagination(response.data.pagination || { current: 1, pages: 1, total: 0 });
      } else {
        setError(response.message || 'Failed to fetch bookings');
      }
    } catch (err) {
      console.error('Fetch bookings error:', err);
      setError(err.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : value // Reset to page 1 when changing other filters
    }));
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      const response = await adminAPIService.updateBookingStatus(bookingId, newStatus);
      if (response.success) {
        toast.success(`Booking status updated to ${newStatus}`);
        fetchBookings(); // Refresh the list
        setShowModal(false);
      } else {
        toast.error(response.message || 'Failed to update booking status');
      }
    } catch (error) {
      console.error('Status update error:', error);
      toast.error('Failed to update booking status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const openBookingModal = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <XCircle className="w-5 h-5 text-red-400 mr-2" />
          <span className="text-red-700">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Booking Management</h1>
        <div className="text-sm text-gray-400">
          Total: {pagination.total} bookings
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Filter className="w-4 h-4 inline mr-1" />
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Search className="w-4 h-4 inline mr-1" />
              Search
            </label>
            <input
              type="text"
              placeholder="Search by customer, provider, or service..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Results per page */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Results per page
            </label>
            <select
              value={filters.limit}
              onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-8 text-center border border-gray-700">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No bookings found</h3>
          <p className="text-gray-400">No bookings match your current filters.</p>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Booking Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Provider
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {bookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-gray-700/50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-white">
                          {booking.service?.title || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-400 capitalize">
                          {booking.service?.category || 'N/A'}
                        </div>
                        {booking.pricing?.agreedAmount && (
                          <div className="text-sm text-green-400">
                            ₹{booking.pricing.agreedAmount}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-white">
                          {booking.customer?.name || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-400">
                          {booking.customer?.email || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-white">
                          {booking.provider?.name || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-400">
                          {booking.provider?.email || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-white">
                        {formatDate(booking.scheduledDate)}
                      </div>
                      <div className="text-xs text-gray-400">
                        Created: {formatDate(booking.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => openBookingModal(booking)}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="bg-gray-700 px-6 py-3 flex items-center justify-between border-t border-gray-600">
              <div className="text-sm text-gray-400">
                Page {pagination.current} of {pagination.pages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleFilterChange('page', pagination.current - 1)}
                  disabled={pagination.current === 1}
                  className="px-3 py-1 bg-gray-700 text-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
                >
                  Previous
                </button>
                <button
                  onClick={() => handleFilterChange('page', pagination.current + 1)}
                  disabled={pagination.current === pagination.pages}
                  className="px-3 py-1 bg-gray-700 text-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Simple Modal */}
      {showModal && selectedBooking && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowModal(false)} />
            <div className="relative bg-gray-800 rounded-lg max-w-2xl w-full p-6 border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-4">Booking Details</h2>
              <div className="space-y-4">
                <div>
                  <strong className="text-white">ID:</strong>
                  <span className="text-gray-300 ml-2">{selectedBooking._id}</span>
                </div>
                <div>
                  <strong className="text-white">Status:</strong>
                  <span className={`ml-2 px-2 py-1 rounded text-xs ${getStatusColor(selectedBooking.status)}`}>
                    {selectedBooking.status}
                  </span>
                </div>
                <div>
                  <strong className="text-white">Customer:</strong>
                  <span className="text-gray-300 ml-2">{selectedBooking.customer?.name}</span>
                </div>
                <div>
                  <strong className="text-white">Provider:</strong>
                  <span className="text-gray-300 ml-2">{selectedBooking.provider?.name}</span>
                </div>
                <div>
                  <strong className="text-white">Service:</strong>
                  <span className="text-gray-300 ml-2">{selectedBooking.service?.title}</span>
                </div>
                <div>
                  <strong className="text-white">Date:</strong>
                  <span className="text-gray-300 ml-2">{formatDate(selectedBooking.scheduledDate)}</span>
                </div>
                {selectedBooking.pricing?.agreedAmount && (
                  <div>
                    <strong className="text-white">Amount:</strong>
                    <span className="text-green-400 ml-2">₹{selectedBooking.pricing.agreedAmount}</span>
                  </div>
                )}
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;
