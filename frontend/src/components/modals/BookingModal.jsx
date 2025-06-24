import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Calendar, Clock, MapPin, IndianRupee, User } from 'lucide-react';
import { bookingsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const BookingModal = ({ service, onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      scheduledDate: '',
      scheduledTime: { start: '', end: '' },
      location: {
        type: 'customer_address',
        address: user?.address || {}
      },
      pricing: {
        agreedAmount: service?.pricing?.amount || 0,
        paymentMethod: 'cash'
      },
      customerNotes: ''
    }
  });

  const watchedDate = watch('scheduledDate');
  const watchedStartTime = watch('scheduledTime.start');

  // Generate time slots
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 20; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Calculate end time based on service duration
  const calculateEndTime = (startTime) => {
    if (!startTime || !service?.duration?.estimated) return '';
    
    const [hours, minutes] = startTime.split(':').map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + service.duration.estimated;
    
    const endHours = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;
    
    return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Calculate end time
      const endTime = calculateEndTime(data.scheduledTime.start);
      
      const bookingData = {
        service: service._id,
        scheduledDate: data.scheduledDate,
        scheduledTime: {
          start: data.scheduledTime.start,
          end: endTime
        },
        location: data.location,
        pricing: {
          agreedAmount: parseFloat(data.pricing.agreedAmount),
          paymentMethod: data.pricing.paymentMethod
        },
        customerNotes: data.customerNotes
      };

      await bookingsAPI.createBooking(bookingData);
      toast.success('Booking created successfully!');
      onSuccess();
    } catch (error) {
      console.error('Booking error:', error);
      toast.error(error.message || 'Failed to create booking');
    } finally {
      setIsLoading(false);
    }
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Book Service</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Service Info */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
              {service?.images?.[0]?.url ? (
                <img
                  src={service.images[0].url}
                  alt={service.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <span className="text-2xl">🔧</span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{service?.title}</h3>
              <div className="flex items-center text-gray-600 mt-1">
                <User size={16} className="mr-1" />
                <span>{service?.provider?.name}</span>
              </div>
              <div className="flex items-center text-primary-600 font-semibold mt-2">
                <IndianRupee size={16} />
                <span>{service?.pricing?.amount || 'Negotiable'}</span>
                {service?.pricing?.type === 'hourly' && <span className="text-sm">/hr</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar size={16} className="inline mr-1" />
                Preferred Date
              </label>
              <input
                type="date"
                min={today}
                className={`input ${errors.scheduledDate ? 'border-red-300' : ''}`}
                {...register('scheduledDate', {
                  required: 'Please select a date',
                  validate: (value) => {
                    const selectedDate = new Date(value);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return selectedDate >= today || 'Date cannot be in the past';
                  }
                })}
              />
              {errors.scheduledDate && (
                <p className="mt-1 text-sm text-red-600">{errors.scheduledDate.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock size={16} className="inline mr-1" />
                Preferred Time
              </label>
              <select
                className={`select ${errors['scheduledTime.start'] ? 'border-red-300' : ''}`}
                {...register('scheduledTime.start', {
                  required: 'Please select a time'
                })}
              >
                <option value="">Select time</option>
                {timeSlots.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
              {errors['scheduledTime.start'] && (
                <p className="mt-1 text-sm text-red-600">{errors['scheduledTime.start'].message}</p>
              )}
              {watchedStartTime && service?.duration?.estimated && (
                <p className="mt-1 text-sm text-gray-600">
                  Estimated end time: {calculateEndTime(watchedStartTime)}
                </p>
              )}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin size={16} className="inline mr-1" />
              Service Location
            </label>
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="customer_address"
                  value="customer_address"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  {...register('location.type')}
                />
                <label htmlFor="customer_address" className="ml-2 text-sm text-gray-700">
                  At my address
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="provider_address"
                  value="provider_address"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  {...register('location.type')}
                />
                <label htmlFor="provider_address" className="ml-2 text-sm text-gray-700">
                  At provider's location
                </label>
              </div>
            </div>
          </div>

          {/* Address Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Street Address
              </label>
              <input
                type="text"
                className="input"
                placeholder="Enter street address"
                {...register('location.address.street')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                className="input"
                placeholder="Enter city"
                {...register('location.address.city', {
                  required: 'City is required'
                })}
              />
              {errors['location.address.city'] && (
                <p className="mt-1 text-sm text-red-600">{errors['location.address.city'].message}</p>
              )}
            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <IndianRupee size={16} className="inline mr-1" />
                Agreed Amount
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                className={`input ${errors['pricing.agreedAmount'] ? 'border-red-300' : ''}`}
                placeholder="Enter amount"
                {...register('pricing.agreedAmount', {
                  required: 'Amount is required',
                  min: { value: 0, message: 'Amount cannot be negative' }
                })}
              />
              {errors['pricing.agreedAmount'] && (
                <p className="mt-1 text-sm text-red-600">{errors['pricing.agreedAmount'].message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <select
                className="select"
                {...register('pricing.paymentMethod')}
              >
                <option value="cash">Cash</option>
                <option value="online">Online Transfer</option>
                <option value="bank_transfer">Bank Transfer</option>
              </select>
            </div>
          </div>

          {/* Special Instructions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Special Instructions (Optional)
            </label>
            <textarea
              rows={3}
              className="textarea"
              placeholder="Any special requirements or instructions..."
              {...register('customerNotes')}
            />
          </div>

          {/* Terms */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <h4 className="font-medium text-yellow-800 mb-2">Important Notes:</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• This is a booking request. The provider will confirm availability.</li>
              <li>• Payment will be made directly to the service provider.</li>
              <li>• You can cancel or modify the booking up to 2 hours before the scheduled time.</li>
              <li>• Please be available at the scheduled time and location.</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-outline btn-md flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary btn-md flex-1"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Booking...
                </div>
              ) : (
                'Confirm Booking'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
