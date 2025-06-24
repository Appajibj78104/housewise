import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Star, 
  ArrowLeft, 
  CheckCircle,
  AlertCircle,
  User,
  Calendar
} from 'lucide-react';
import { customerAPI } from '../../services/api';

const ReviewForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('booking');
  
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    rating: {
      overall: 0,
      quality: 0,
      punctuality: 0,
      communication: 0,
      value: 0
    },
    comment: '',
    wouldRecommend: true,
    pros: [],
    cons: []
  });

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails();
    } else {
      setError('No booking specified');
      setLoading(false);
    }
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      const response = await customerAPI.getBookingById(bookingId);
      setBooking(response.data.booking);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  const handleRatingClick = (category, rating) => {
    setFormData(prev => ({
      ...prev,
      rating: { ...prev.rating, [category]: rating }
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.rating.overall === 0) {
      setError('Please select an overall rating');
      return;
    }

    if (!formData.comment.trim()) {
      setError('Please write a review comment');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const reviewData = {
        bookingId: bookingId,
        rating: formData.rating,
        comment: formData.comment.trim(),
        wouldRecommend: formData.wouldRecommend,
        pros: formData.pros.filter(p => p.trim()),
        cons: formData.cons.filter(c => c.trim())
      };

      await customerAPI.createReview(reviewData);
      setSuccess('Review submitted successfully!');

      setTimeout(() => {
        navigate('/customer/reviews');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating, interactive = false, category = null) => {
    return Array.from({ length: 5 }, (_, i) => (
      <button
        key={i}
        type="button"
        onClick={interactive && category ? () => handleRatingClick(category, i + 1) : undefined}
        className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
        disabled={!interactive}
      >
        <Star
          className={`w-6 h-6 ${
            i < rating
              ? 'text-yellow-400 fill-current'
              : 'text-gray-300'
          }`}
        />
      </button>
    ));
  };

  const getRatingText = (rating) => {
    switch (rating) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Very Good';
      case 5: return 'Excellent';
      default: return 'Select a rating';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral-600"></div>
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => navigate('/customer/bookings')}
            className="mt-4 btn btn-primary"
          >
            Back to Bookings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Write Review</h1>
            <div></div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <span className="text-green-700">{success}</span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h3 className="font-semibold text-gray-900 mb-4">Service Details</h3>
              
              {booking && (
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <img
                      src={booking.service?.images?.[0] || '/default-service.jpg'}
                      alt={booking.service?.title}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {booking.service?.title}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {booking.service?.category}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <img
                      src={booking.provider?.profileImage || '/default-avatar.png'}
                      alt={booking.provider?.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium text-gray-900">
                        {booking.provider?.name}
                      </p>
                      <p className="text-sm text-gray-600">Service Provider</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(booking.scheduledDate).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-600">
                      Status: <span className="font-medium capitalize">{booking.status}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Review Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  How was your experience?
                </h2>
                <p className="text-gray-600 mt-1">
                  Your feedback helps other customers and providers improve their services.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-6">
                  {/* Rating Categories */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Rate Your Experience</h3>
                    <div className="space-y-4">
                      {/* Overall Rating */}
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Overall Rating *
                          </label>
                          <p className="text-xs text-gray-500">How would you rate this service overall?</p>
                        </div>
                        <div className="flex items-center space-x-1">
                          {renderStars(formData.rating.overall, true, 'overall')}
                          <span className="ml-2 text-sm font-medium text-gray-900">
                            {getRatingText(formData.rating.overall)}
                          </span>
                        </div>
                      </div>

                      {/* Quality Rating */}
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Service Quality
                          </label>
                          <p className="text-xs text-gray-500">How was the quality of work?</p>
                        </div>
                        <div className="flex items-center space-x-1">
                          {renderStars(formData.rating.quality, true, 'quality')}
                        </div>
                      </div>

                      {/* Punctuality Rating */}
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Punctuality
                          </label>
                          <p className="text-xs text-gray-500">Was the provider on time?</p>
                        </div>
                        <div className="flex items-center space-x-1">
                          {renderStars(formData.rating.punctuality, true, 'punctuality')}
                        </div>
                      </div>

                      {/* Communication Rating */}
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Communication
                          </label>
                          <p className="text-xs text-gray-500">How clear and professional was the communication?</p>
                        </div>
                        <div className="flex items-center space-x-1">
                          {renderStars(formData.rating.communication, true, 'communication')}
                        </div>
                      </div>

                      {/* Value Rating */}
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Value for Money
                          </label>
                          <p className="text-xs text-gray-500">Was the service worth the price?</p>
                        </div>
                        <div className="flex items-center space-x-1">
                          {renderStars(formData.rating.value, true, 'value')}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Comment */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Review *
                    </label>
                    <textarea
                      name="comment"
                      value={formData.comment}
                      onChange={handleInputChange}
                      rows={6}
                      className="textarea"
                      placeholder="Share your experience with this service. What did you like? What could be improved? Your detailed feedback helps other customers make informed decisions."
                      maxLength={1000}
                      required
                    />
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-sm text-gray-500">
                        Help others by sharing specific details about your experience
                      </p>
                      <span className="text-sm text-gray-500">
                        {formData.comment.length}/1000
                      </span>
                    </div>
                  </div>

                  {/* Would Recommend */}
                  <div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="wouldRecommend"
                        checked={formData.wouldRecommend}
                        onChange={(e) => setFormData(prev => ({ ...prev, wouldRecommend: e.target.checked }))}
                        className="h-4 w-4 text-coral-600 focus:ring-coral-500 border-gray-300 rounded"
                      />
                      <label htmlFor="wouldRecommend" className="ml-2 text-sm font-medium text-gray-700">
                        I would recommend this service provider to others
                      </label>
                    </div>
                  </div>

                  {/* Guidelines */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Review Guidelines</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Be honest and constructive in your feedback</li>
                      <li>• Focus on the service quality and provider's professionalism</li>
                      <li>• Avoid personal attacks or inappropriate language</li>
                      <li>• Include specific details that would help other customers</li>
                    </ul>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => navigate('/customer/bookings')}
                    className="btn btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || formData.rating.overall === 0}
                    className="btn btn-primary flex items-center gap-2"
                  >
                    {submitting ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewForm;
