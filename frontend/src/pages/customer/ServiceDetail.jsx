import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Star, 
  MapPin, 
  Clock, 
  IndianRupee, 
  Calendar, 
  Phone, 
  MessageCircle,
  Heart,
  Share2,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  User,
  Award
} from 'lucide-react';
import { servicesAPI, customerAPI } from '../../services/api';
import BookingModal from '../../components/customer/BookingModal';

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [provider, setProvider] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    fetchServiceDetails();
  }, [id]);

  const fetchServiceDetails = async () => {
    try {
      setLoading(true);
      const serviceResponse = await servicesAPI.getServiceById(id);
      const serviceData = serviceResponse.data.service;
      setService(serviceData);

      // Get provider details if service has provider info
      if (serviceData.provider) {
        try {
          const providerDetails = await customerAPI.getProviderDetails(serviceData.provider._id || serviceData.provider);
          setProvider(providerDetails.data.provider);
          setReviews(providerDetails.data.reviews || []);
        } catch (providerErr) {
          console.warn('Could not fetch provider details:', providerErr);
          // Set basic provider info from service data
          setProvider(serviceData.provider);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load service details');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const formatPrice = (pricing) => {
    if (pricing.type === 'negotiable') {
      return 'Negotiable';
    }
    return `₹${pricing.amount}${pricing.type === 'hourly' ? '/hr' : ''}`;
  };

  const handleBookNow = () => {
    setShowBookingModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral-600"></div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">{error || 'Service not found'}</p>
          <button 
            onClick={() => navigate('/services')}
            className="mt-4 btn btn-primary"
          >
            Browse Services
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </button>
            <div className="flex items-center space-x-3">
              <button className="p-2 text-gray-400 hover:text-coral-600 transition-colors">
                <Heart className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-coral-600 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Service Images */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="aspect-w-16 aspect-h-9">
                <img
                  src={service.images?.[selectedImage]?.url || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=400&fit=crop&crop=center'}
                  alt={service.title}
                  className="w-full h-64 object-cover"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=400&fit=crop&crop=center';
                  }}
                />
              </div>
              {service.images && service.images.length > 1 && (
                <div className="p-4">
                  <div className="flex space-x-2 overflow-x-auto">
                    {service.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                          selectedImage === index ? 'border-coral-600' : 'border-gray-200'
                        }`}
                      >
                        <img
                          src={image?.url || image}
                          alt={`${service.title} ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop&crop=center';
                          }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Service Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {service.title}
                  </h1>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      {renderStars(service.rating?.average || 0)}
                      <span className="ml-2 text-sm text-gray-600">
                        {service.rating?.average?.toFixed(1) || 'No ratings'} ({service.rating?.count || 0} reviews)
                      </span>
                    </div>
                    <span className="px-3 py-1 bg-coral-100 text-coral-800 text-sm font-medium rounded-full">
                      {service.category}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-coral-600">
                    {formatPrice(service.pricing)}
                  </div>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <Clock className="w-4 h-4 mr-1" />
                    {service.duration?.estimated} minutes
                  </div>
                </div>
              </div>

              <div className="prose max-w-none">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-700 leading-relaxed">
                  {service.description}
                </p>
              </div>

              {/* Service Details */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Service Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">{service.duration?.estimated} minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Category:</span>
                      <span className="font-medium capitalize">{service.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pricing:</span>
                      <span className="font-medium">{formatPrice(service.pricing)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Availability</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Days:</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {service.availability?.days?.map(day => (
                          <span key={day} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded capitalize">
                            {day}
                          </span>
                        ))}
                      </div>
                    </div>
                    {service.availability?.timeSlots && (
                      <div>
                        <span className="text-gray-600">Time:</span>
                        <span className="ml-2 font-medium">
                          {service.availability.timeSlots.start} - {service.availability.timeSlots.end}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Requirements */}
              {(service.requirements?.materials || service.requirements?.space || service.requirements?.other) && (
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Requirements</h4>
                  <div className="space-y-2 text-sm text-gray-700">
                    {service.requirements.materials && (
                      <div>
                        <span className="font-medium">Materials:</span> {service.requirements.materials}
                      </div>
                    )}
                    {service.requirements.space && (
                      <div>
                        <span className="font-medium">Space:</span> {service.requirements.space}
                      </div>
                    )}
                    {service.requirements.other && (
                      <div>
                        <span className="font-medium">Other:</span> {service.requirements.other}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Provider Info */}
            {provider && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">About the Provider</h3>
                <div className="flex items-start space-x-4">
                  <img
                    src={provider.profileImage || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'}
                    alt={provider.name}
                    className="w-16 h-16 rounded-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face';
                    }}
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{provider.name}</h4>
                    <div className="flex items-center mt-1">
                      {provider.feedbackRating?.averageRating > 0 ? (
                        <>
                          {renderStars(provider.feedbackRating.averageRating)}
                          <span className="ml-2 text-sm text-gray-600">
                            {provider.feedbackRating.averageRating.toFixed(1)} ({provider.feedbackRating.totalFeedbacks} feedback{provider.feedbackRating.totalFeedbacks !== 1 ? 's' : ''})
                          </span>
                        </>
                      ) : (
                        <>
                          {renderStars(provider.rating?.average || 0)}
                          <span className="ml-2 text-sm text-gray-600">
                            {provider.rating?.count || 0} reviews
                          </span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center mt-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-1" />
                      {provider.address?.city}, {provider.address?.state}
                    </div>
                    {provider.bio && (
                      <p className="mt-3 text-gray-700 text-sm">
                        {provider.bio}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Reviews */}
            {reviews.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Reviews ({reviews.length})
                </h3>
                <div className="space-y-4">
                  {reviews.slice(0, 3).map((review) => (
                    <div key={review._id} className="border-b border-gray-200 pb-4 last:border-b-0">
                      <div className="flex items-start space-x-3">
                        <img
                          src={review.customer?.profileImage || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'}
                          alt={review.customer?.name}
                          className="w-10 h-10 rounded-full object-cover"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face';
                          }}
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h5 className="font-medium text-gray-900">
                              {review.customer?.name}
                            </h5>
                            <div className="flex items-center">
                              {renderStars(review.rating)}
                            </div>
                          </div>
                          <p className="mt-1 text-gray-700 text-sm">
                            {review.comment}
                          </p>
                          <p className="mt-2 text-xs text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {reviews.length > 3 && (
                  <button className="mt-4 text-coral-600 hover:text-coral-700 text-sm font-medium">
                    View all reviews
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              {/* Booking Card */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-coral-600 mb-2">
                    {formatPrice(service.pricing)}
                  </div>
                  <p className="text-gray-600 text-sm">
                    {service.pricing.type === 'hourly' ? 'per hour' : 'per service'}
                  </p>
                </div>

                <button
                  onClick={handleBookNow}
                  className="w-full btn btn-primary mb-4"
                >
                  Book Now
                </button>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Response time:</span>
                    <span className="font-medium">Within 2 hours</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Cancellation:</span>
                    <span className="font-medium">2 hours before</span>
                  </div>
                </div>
              </div>

              {/* Contact Provider */}
              {provider && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Contact Provider</h4>
                  <div className="space-y-3">
                    {provider.phone && (
                      <a
                        href={`tel:${provider.phone}`}
                        className="flex items-center justify-center w-full p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Call Now
                      </a>
                    )}
                    <button className="flex items-center justify-center w-full p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Send Message
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <BookingModal
          service={service}
          provider={provider}
          onClose={() => setShowBookingModal(false)}
          onSuccess={() => {
            setShowBookingModal(false);
            navigate('/customer/bookings');
          }}
        />
      )}
    </div>
  );
};



export default ServiceDetail;
