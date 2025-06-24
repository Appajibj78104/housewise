import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Search, 
  Filter, 
  Eye, 
  Flag,
  Trash2,
  Star,
  AlertTriangle,
  CheckCircle,
  BarChart3
} from 'lucide-react';
import { adminAPIService } from '../../services/adminAPI';
// AdminLayout wrapper removed - handled in App.jsx

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReview, setSelectedReview] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  const [filters, setFilters] = useState({
    search: '',
    flagged: 'all',
    page: 1,
    limit: 20
  });
  
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0
  });

  const flaggedOptions = [
    { value: 'all', label: 'All Reviews' },
    { value: 'false', label: 'Normal Reviews' },
    { value: 'true', label: 'Flagged Reviews' }
  ];

  useEffect(() => {
    fetchReviews();
  }, [filters]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await adminAPIService.getReviews(filters);
      if (response.success) {
        setReviews(response.data.reviews);
        setPagination(response.data.pagination);
        setStatistics(response.data.statistics);
      } else {
        setError('Failed to fetch reviews');
      }
    } catch (err) {
      setError('Failed to fetch reviews');
      console.error('Fetch reviews error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  const handleFlagReview = async (reviewId, flagged) => {
    try {
      const response = await adminAPIService.flagReview(reviewId, flagged);
      if (response.success) {
        // Update the review in the list
        setReviews(prev => prev.map(review =>
          review._id === reviewId
            ? { ...review, isReported: flagged }
            : review
        ));
        
        // Update selected review if it's the same one
        if (selectedReview && selectedReview._id === reviewId) {
          setSelectedReview(prev => ({ ...prev, isReported: flagged }));
        }
        
        // Refresh statistics
        fetchReviews();
      }
    } catch (err) {
      console.error('Flag review error:', err);
      setError('Failed to update review flag status');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await adminAPIService.deleteReview(reviewId);
      if (response.success) {
        // Remove from list
        setReviews(prev => prev.filter(review => review._id !== reviewId));
        
        // Close modal if this review was selected
        if (selectedReview && selectedReview._id === reviewId) {
          setShowModal(false);
          setSelectedReview(null);
        }
        
        // Refresh statistics
        fetchReviews();
      }
    } catch (err) {
      console.error('Delete review error:', err);
      setError('Failed to delete review');
    }
  };

  const handleViewReview = (review) => {
    setSelectedReview(review);
    setShowModal(true);
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

  const renderStars = (rating) => {
    const ratingValue = rating?.overall || rating || 0;
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < ratingValue ? 'text-yellow-400 fill-current' : 'text-gray-600'}`}
      />
    ));
  };

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Reviews & Feedback</h1>
            <p className="text-gray-400">Monitor and moderate customer reviews</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-yellow-400">
              <Star className="w-5 h-5 fill-current" />
              <span>{statistics.averageRating?.toFixed(1) || '0.0'} avg rating</span>
            </div>
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-5 h-5" />
              <span>{statistics.flaggedCount || 0} flagged</span>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Total Reviews</p>
                <p className="text-3xl font-bold text-white mt-2">{statistics.totalReviews || 0}</p>
              </div>
              <div className="bg-blue-600 p-3 rounded-lg">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Average Rating</p>
                <p className="text-3xl font-bold text-white mt-2">{statistics.averageRating?.toFixed(1) || '0.0'}</p>
              </div>
              <div className="bg-yellow-600 p-3 rounded-lg">
                <Star className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Flagged Reviews</p>
                <p className="text-3xl font-bold text-white mt-2">{statistics.flaggedCount || 0}</p>
              </div>
              <div className="bg-red-600 p-3 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search reviews by comment, customer, or provider..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10 pr-4 py-2 w-full bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>

            {/* Flagged Filter */}
            <div className="min-w-[150px]">
              <select
                value={filters.flagged}
                onChange={(e) => handleFilterChange('flagged', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                {flaggedOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 text-red-200">
            {error}
          </div>
        )}

        {/* Reviews Table */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No reviews found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Review
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Provider
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {reviews.map((review) => (
                    <tr key={review._id} className="hover:bg-gray-700/50">
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <div className="flex items-center gap-1 mb-1">
                            {renderStars(review.rating)}
                            <span className="text-yellow-400 text-sm ml-1">{review.rating?.overall || review.rating || 0}</span>
                          </div>
                          <p className="text-white text-sm line-clamp-2">
                            {review.comment || 'No comment provided'}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-white font-medium">{review.customer?.name || 'Anonymous'}</p>
                          <p className="text-gray-400 text-sm">{review.customer?.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-white font-medium">{review.provider?.name}</p>
                          <p className="text-gray-400 text-sm">{review.provider?.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-white">{review.service?.title || 'Service not found'}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {formatDate(review.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {review.isReported ? (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-900 text-red-200 flex items-center gap-1 w-fit">
                            <AlertTriangle className="w-3 h-3" />
                            Flagged
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-900 text-green-200 flex items-center gap-1 w-fit">
                            <CheckCircle className="w-3 h-3" />
                            Normal
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewReview(review)}
                            className="p-2 text-blue-400 hover:text-blue-300 hover:bg-gray-700 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => handleFlagReview(review._id, !review.isReported)}
                            className={`p-2 rounded-lg transition-colors ${
                              review.isReported
                                ? 'text-green-400 hover:text-green-300 hover:bg-gray-700'
                                : 'text-yellow-400 hover:text-yellow-300 hover:bg-gray-700'
                            }`}
                            title={review.isReported ? 'Unflag Review' : 'Flag Review'}
                          >
                            <Flag className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => handleDeleteReview(review._id)}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-gray-700 rounded-lg transition-colors"
                            title="Delete Review"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-gray-400 text-sm">
              Showing {((pagination.current - 1) * filters.limit) + 1} to {Math.min(pagination.current * filters.limit, pagination.total)} of {pagination.total} reviews
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleFilterChange('page', pagination.current - 1)}
                disabled={pagination.current === 1}
                className="px-3 py-1 bg-gray-700 text-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
              >
                Previous
              </button>
              <span className="text-gray-400">
                Page {pagination.current} of {pagination.pages}
              </span>
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

        {/* Review Details Modal */}
        {showModal && selectedReview && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowModal(false)} />
            <div className="relative bg-gray-800 rounded-lg max-w-2xl w-full p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Review Details</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Rating */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Rating</h3>
                  <div className="flex items-center gap-2">
                    {renderStars(selectedReview.rating)}
                    <span className="text-yellow-400 text-lg font-medium ml-2">{selectedReview.rating?.overall || selectedReview.rating || 0}/5</span>
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Comment</h3>
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <p className="text-white">{selectedReview.comment || 'No comment provided'}</p>
                  </div>
                </div>

                {/* Customer & Provider */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Customer</h3>
                    <div className="bg-gray-700/50 rounded-lg p-4">
                      <p className="text-white font-medium">{selectedReview.customer?.name || 'Anonymous'}</p>
                      <p className="text-gray-300">{selectedReview.customer?.email}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Service Provider</h3>
                    <div className="bg-gray-700/50 rounded-lg p-4">
                      <p className="text-white font-medium">{selectedReview.provider?.name}</p>
                      <p className="text-gray-300">{selectedReview.provider?.email}</p>
                    </div>
                  </div>
                </div>

                {/* Service */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Service</h3>
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <p className="text-white font-medium">{selectedReview.service?.title || 'Service not found'}</p>
                  </div>
                </div>

                {/* Review Info */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Review Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Created Date</label>
                      <p className="text-white">{formatDate(selectedReview.createdAt)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
                      {selectedReview.isReported ? (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-900 text-red-200 flex items-center gap-1 w-fit">
                          <AlertTriangle className="w-3 h-3" />
                          Flagged
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-900 text-green-200 flex items-center gap-1 w-fit">
                          <CheckCircle className="w-3 h-3" />
                          Normal
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 pt-4 border-t border-gray-700">
                  <button
                    onClick={() => handleFlagReview(selectedReview._id, !selectedReview.isReported)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedReview.isReported
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                    }`}
                  >
                    {selectedReview.isReported ? 'Unflag Review' : 'Flag Review'}
                  </button>
                  <button
                    onClick={() => {
                      handleDeleteReview(selectedReview._id);
                    }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Delete Review
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
          </div>
        )}
      </div>
    );
};

export default AdminReviews;
