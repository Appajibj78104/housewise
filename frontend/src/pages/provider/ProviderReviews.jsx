import React, { useState, useEffect } from 'react';
import { reviewsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Star,
  MessageSquare,
  Calendar,
  User,
  Filter,
  Search,
  TrendingUp,
  Award,
  AlertCircle
} from 'lucide-react';

const ProviderReviews = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      // Get reviews for this provider
      const response = await reviewsAPI.getProviderReviews(user._id);
      setReviews(response.data.reviews || []);
      
      // Calculate stats
      calculateStats(response.data.reviews || []);
    } catch (err) {
      setError('Failed to load reviews');
      console.error('Reviews error:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (reviewsData) => {
    const totalReviews = reviewsData.length;
    
    if (totalReviews === 0) {
      setStats({
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      });
      return;
    }

    const totalRating = reviewsData.reduce((sum, review) => sum + review.rating.overall, 0);
    const averageRating = totalRating / totalReviews;

    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviewsData.forEach(review => {
      const rating = Math.floor(review.rating.overall);
      ratingDistribution[rating]++;
    });

    setStats({
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10,
      ratingDistribution
    });
  };

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.customer.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRating = ratingFilter === 'all' || 
                         Math.floor(review.rating.overall) === parseInt(ratingFilter);
    
    return matchesSearch && matchesRating;
  });

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRatingPercentage = (rating) => {
    return stats.totalReviews > 0 ? (stats.ratingDistribution[rating] / stats.totalReviews) * 100 : 0;
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
        <div>
          <h1 className="text-2xl font-bold text-white">Reviews & Ratings</h1>
          <p className="text-gray-400">See what customers are saying about your services</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 bg-yellow-600 rounded-lg">
                <Star className="h-6 w-6 text-yellow-100" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Average Rating</p>
                <p className="text-2xl font-bold text-white">{stats.averageRating}</p>
                <div className="flex items-center mt-1">
                  {renderStars(Math.floor(stats.averageRating))}
                  <span className="ml-2 text-sm text-gray-400">({stats.totalReviews} reviews)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 bg-blue-600 rounded-lg">
                <MessageSquare className="h-6 w-6 text-blue-100" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Total Reviews</p>
                <p className="text-2xl font-bold text-white">{stats.totalReviews}</p>
                <p className="text-sm text-gray-400">Customer feedback</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 bg-green-600 rounded-lg">
                <Award className="h-6 w-6 text-green-100" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">5-Star Reviews</p>
                <p className="text-2xl font-bold text-white">{stats.ratingDistribution[5]}</p>
                <p className="text-sm text-gray-400">
                  {Math.round(getRatingPercentage(5))}% of all reviews
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h3 className="text-lg font-medium text-white mb-4">Rating Distribution</h3>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map(rating => (
              <div key={rating} className="flex items-center">
                <div className="flex items-center w-20">
                  <span className="text-sm font-medium text-gray-300">{rating}</span>
                  <Star className="h-4 w-4 text-yellow-400 fill-current ml-1" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{ width: `${getRatingPercentage(rating)}%` }}
                    ></div>
                  </div>
                </div>
                <div className="w-16 text-right">
                  <span className="text-sm text-gray-400">
                    {stats.ratingDistribution[rating]} ({Math.round(getRatingPercentage(rating))}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Search className="w-4 h-4 inline mr-1" />
                Search Reviews
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by customer name or comment..."
                  className="w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Filter className="w-4 h-4 inline mr-1" />
                Filter by Rating
              </label>
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
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

        {/* Reviews List */}
        {filteredReviews.length === 0 ? (
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-12 text-center">
            <MessageSquare className="mx-auto h-24 w-24 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              {reviews.length === 0 ? 'No reviews yet' : 'No reviews match your filters'}
            </h3>
            <p className="text-gray-400">
              {reviews.length === 0
                ? 'Complete some services to start receiving reviews from customers'
                : 'Try adjusting your search or filter criteria'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredReviews.map((review) => (
              <div key={review._id} className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <img
                        className="h-10 w-10 rounded-full"
                        src={review.customer.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.customer.name)}&background=random`}
                        alt={review.customer.name}
                      />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-white">{review.customer.name}</p>
                        <div className="flex items-center">
                          {renderStars(review.rating.overall)}
                          <span className="ml-2 text-sm text-gray-400">
                            {review.rating.overall}/5
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center text-sm text-gray-400">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(review.createdAt)}
                      </div>
                    </div>
                  </div>

                  {/* Service Info */}
                  {review.service && (
                    <div className="mb-4 p-3 bg-gray-700 rounded-lg">
                      <p className="text-sm font-medium text-gray-300">Service: {review.service.title}</p>
                    </div>
                  )}

                  {/* Review Comment */}
                  <div className="mb-4">
                    <p className="text-gray-300">{review.comment}</p>
                  </div>

                  {/* Detailed Ratings */}
                  {review.rating.quality !== undefined && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Quality:</span>
                        <div className="flex items-center">
                          {renderStars(review.rating.quality)}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-400">Punctuality:</span>
                        <div className="flex items-center">
                          {renderStars(review.rating.punctuality)}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-400">Communication:</span>
                        <div className="flex items-center">
                          {renderStars(review.rating.communication)}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-400">Value:</span>
                        <div className="flex items-center">
                          {renderStars(review.rating.value)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
};

export default ProviderReviews;
