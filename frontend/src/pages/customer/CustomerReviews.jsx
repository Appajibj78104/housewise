import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Star,
  Calendar,
  User,
  MessageCircle,
  Plus,
  Filter,
  Search,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { customerAPI } from '../../services/api';
import { Card, Button, LoadingSpinner } from '../../components/shared';

const CustomerReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [pendingReviews, setPendingReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('written');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    fetchReviews();
    fetchPendingReviews();
  }, [pagination.page]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit
      };

      const response = await customerAPI.getMyReviews(params);
      setReviews(response.data.reviews);
      setPagination(response.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingReviews = async () => {
    try {
      const response = await fetch('/api/customer/reviews/pending', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setPendingReviews(data.data.pendingReviews);
      }
    } catch (err) {
      console.error('Failed to fetch pending reviews:', err);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating
            ? 'text-yellow-400 fill-current'
            : 'text-gray-600'
        }`}
      />
    ));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
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
        text="Loading reviews..."
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
            <h1 className="text-2xl font-bold text-white">My Reviews</h1>
            <p className="text-gray-300">Reviews you've written for services</p>
          </div>
          <Link to="/customer/bookings?status=completed">
            <Button theme="dark" variant="primary" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Write Review
            </Button>
          </Link>
        </div>
      </div>
      {/* Tabs */}
      <div className="border-b border-gray-700 mb-8">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'pending', label: 'Pending Reviews', count: pendingReviews.length },
            { id: 'written', label: 'Written Reviews', count: reviews.length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-coral-500 text-coral-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-2 bg-gray-700 text-gray-300 py-0.5 px-2.5 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Error Message */}
      {error && (
        <Card theme="dark" className="mb-6 border-red-600">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
            <span className="text-red-400">{error}</span>
          </div>
        </Card>
      )}

      {/* Content */}
      {activeTab === 'pending' && (
        <>
          {pendingReviews.length === 0 ? (
            <Card theme="dark" className="p-12 text-center">
              <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No pending reviews</h3>
              <p className="text-gray-300 mb-6">
                All your completed services have been reviewed!
              </p>
              <Link to="/customer/bookings">
                <Button theme="dark" variant="primary">
                  View Bookings
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-6">
              {pendingReviews.map((booking) => (
                <Card key={booking._id} theme="dark">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <img
                        src={booking.service?.images?.[0] || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&crop=center'}
                        alt={booking.service?.title}
                        className="w-16 h-16 rounded-lg object-cover"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&crop=center';
                        }}
                      />
                      <div>
                        <h3 className="font-semibold text-white">
                          {booking.service?.title}
                        </h3>
                        <p className="text-gray-300 text-sm">
                          Service by {booking.provider?.name}
                        </p>
                        <p className="text-gray-400 text-sm mt-1">
                          Completed: {new Date(booking.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-orange-400" />
                      <span className="text-sm text-orange-400 font-medium">Review Pending</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Link to={`/customer/reviews/new?booking=${booking._id}`}>
                      <Button theme="dark" variant="primary" className="flex items-center gap-2">
                        <Star className="w-4 h-4" />
                        Write Review
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'written' && (
        <>
          {/* Reviews List */}
          {reviews.length === 0 ? (
        <Card theme="dark" className="p-12 text-center">
          <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No reviews yet</h3>
          <p className="text-gray-300 mb-6">
            You haven't written any reviews yet. Complete a booking to leave your first review.
          </p>
          <Link to="/customer/bookings?status=completed">
            <Button theme="dark" variant="primary">
              View Completed Bookings
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <Card key={review._id} theme="dark">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <img
                    src={review.provider?.profileImage || '/default-avatar.png'}
                    alt={review.provider?.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-white">
                      {review.service?.title}
                    </h3>
                    <p className="text-gray-300 text-sm">
                      Service by {review.provider?.name}
                    </p>
                    <div className="flex items-center mt-1">
                      {renderStars(review.rating?.overall || review.rating)}
                      <span className="ml-2 text-sm text-gray-300">
                        {review.rating?.overall || review.rating}/5 stars
                      </span>
                    </div>
                    {review.wouldRecommend && (
                      <div className="flex items-center mt-1">
                        <CheckCircle className="w-3 h-3 text-green-400 mr-1" />
                        <span className="text-xs text-green-400">Would recommend</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center text-sm text-gray-400">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate(review.createdAt)}
                  </div>
                  <span className="inline-block mt-1 px-2 py-1 bg-coral-900 text-coral-300 text-xs font-medium rounded-full">
                    {review.service?.category}
                  </span>
                </div>
              </div>

              {review.comment && (
                <div className="bg-gray-700 rounded-lg p-4 mb-4">
                  <p className="text-gray-300 leading-relaxed">
                    "{review.comment}"
                  </p>
                </div>
              )}

              {/* Provider Response */}
              {review.providerResponse && (
                <div className="border-l-4 border-coral-500 pl-4 mt-4">
                  <div className="flex items-center mb-2">
                    <User className="w-4 h-4 text-coral-400 mr-2" />
                    <span className="text-sm font-medium text-coral-400">
                      Response from {review.provider?.name}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm">
                    {review.providerResponse.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDate(review.providerResponse.createdAt)}
                  </p>
                </div>
              )}

              {/* Review Stats */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  {review.helpfulVotes > 0 && (
                    <span>{review.helpfulVotes} people found this helpful</span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-400">
                    Review #{review._id.slice(-6)}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
        </>
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

export default CustomerReviews;
