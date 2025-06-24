import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  IndianRupee,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { customerAPI } from '../../services/api';

const BookingModal = ({ service, provider, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    scheduledDate: '',
    scheduledTime: {
      start: '',
      end: ''
    },
    customerNotes: '',
    location: {
      type: 'customer_address',
      address: ''
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('scheduledTime.')) {
      const timeField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        scheduledTime: {
          ...prev.scheduledTime,
          [timeField]: value
        }
      }));
    } else if (name.startsWith('location.')) {
      const locationField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const calculateEndTime = (startTime, duration) => {
    if (!startTime || !duration) return '';
    
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + duration;
    const endHours = Math.floor(totalMinutes / 60);
    const endMins = totalMinutes % 60;
    
    return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Calculate end time if not provided
      const endTime = formData.scheduledTime.end || 
        calculateEndTime(formData.scheduledTime.start, service.duration?.estimated);

      const bookingData = {
        serviceId: service._id,
        scheduledDate: formData.scheduledDate,
        scheduledTime: {
          start: formData.scheduledTime.start,
          end: endTime
        },
        customerNotes: formData.customerNotes,
        location: formData.location
      };

      await customerAPI.createBooking(bookingData);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (pricing) => {
    if (pricing.type === 'negotiable') {
      return 'Negotiable';
    }
    return `₹${pricing.amount}${pricing.type === 'hourly' ? '/hr' : ''}`;
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Book Service</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Service Summary */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-start space-x-4">
            <img
              src={service.images?.[0] || '/default-service.jpg'}
              alt={service.title}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{service.title}</h3>
              <div className="flex items-center mt-1 text-sm text-gray-600">
                <User className="w-4 h-4 mr-1" />
                {provider?.name}
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-1" />
                  {service.duration?.estimated} minutes
                </div>
                <div className="text-lg font-bold text-coral-600">
                  {formatPrice(service.pricing)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <span className="text-red-700">{error}</span>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {/* Date Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="date"
                  name="scheduledDate"
                  value={formData.scheduledDate}
                  onChange={handleInputChange}
                  min={getMinDate()}
                  required
                  className="pl-10 input"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Bookings must be made at least 24 hours in advance
              </p>
            </div>

            {/* Time Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time *
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="time"
                    name="scheduledTime.start"
                    value={formData.scheduledTime.start}
                    onChange={handleInputChange}
                    required
                    className="pl-10 input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time (Optional)
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="time"
                    name="scheduledTime.end"
                    value={formData.scheduledTime.end || 
                      calculateEndTime(formData.scheduledTime.start, service.duration?.estimated)}
                    onChange={handleInputChange}
                    className="pl-10 input"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Auto-calculated based on service duration
                </p>
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Location
              </label>
              <div className="space-y-3">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="location.type"
                      value="customer_address"
                      checked={formData.location.type === 'customer_address'}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <span className="text-sm">My Address</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="location.type"
                      value="provider_address"
                      checked={formData.location.type === 'provider_address'}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <span className="text-sm">Provider's Location</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="location.type"
                      value="custom"
                      checked={formData.location.type === 'custom'}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <span className="text-sm">Custom Address</span>
                  </label>
                </div>

                {formData.location.type === 'custom' && (
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      name="location.address"
                      value={formData.location.address}
                      onChange={handleInputChange}
                      placeholder="Enter custom address"
                      className="pl-10 input"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Special Instructions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Instructions (Optional)
              </label>
              <textarea
                name="customerNotes"
                value={formData.customerNotes}
                onChange={handleInputChange}
                rows={3}
                className="textarea"
                placeholder="Any special requirements or instructions for the provider..."
              />
              <p className="mt-1 text-xs text-gray-500">
                {formData.customerNotes.length}/500 characters
              </p>
            </div>

            {/* Service Requirements */}
            {(service.requirements?.materials || service.requirements?.space || service.requirements?.other) && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Service Requirements</h4>
                <div className="space-y-1 text-sm text-blue-800">
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

            {/* Pricing Summary */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Pricing Summary</h4>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Service Fee:</span>
                <span className="font-bold text-coral-600 text-lg">
                  {formatPrice(service.pricing)}
                </span>
              </div>
              {service.pricing.type !== 'negotiable' && (
                <p className="mt-2 text-xs text-gray-500">
                  Final amount may vary based on actual service duration and requirements
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary flex items-center gap-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              {loading ? 'Creating Booking...' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
