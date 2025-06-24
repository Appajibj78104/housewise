import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { providerAPI } from '../../services/api';
import { Camera, MapPin, Clock, Save, AlertCircle } from 'lucide-react';
import MapPicker from '../../components/map/MapPicker';

const ProviderProfile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(user?.profileImage || '');

  // Clear messages when component unmounts or user navigates away
  useEffect(() => {
    return () => {
      setError('');
      setSuccess('');
    };
  }, []);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    address: {
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      pincode: user?.address?.pincode || '',
      coordinates: {
        latitude: user?.address?.coordinates?.latitude || null,
        longitude: user?.address?.coordinates?.longitude || null
      }
    },
    workingHours: user?.workingHours || [
      { day: 'monday', start: '09:00', end: '17:00', isAvailable: true },
      { day: 'tuesday', start: '09:00', end: '17:00', isAvailable: true },
      { day: 'wednesday', start: '09:00', end: '17:00', isAvailable: true },
      { day: 'thursday', start: '09:00', end: '17:00', isAvailable: true },
      { day: 'friday', start: '09:00', end: '17:00', isAvailable: true },
      { day: 'saturday', start: '09:00', end: '17:00', isAvailable: true },
      { day: 'sunday', start: '09:00', end: '17:00', isAvailable: false }
    ]
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleWorkingHoursChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      workingHours: prev.workingHours.map((hour, i) => 
        i === index ? { ...hour, [field]: value } : hour
      )
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLocationSelect = useCallback((locationData) => {
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        street: locationData.address || prev.address.street,
        coordinates: {
          latitude: locationData.latitude,
          longitude: locationData.longitude
        }
      }
    }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const updateData = { ...formData };
      if (profileImage) {
        updateData.profileImage = profileImage;
      }

      const response = await providerAPI.updateProfile(updateData);
      updateUser(response.data.user);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const dayNames = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday'
  };

  return (
    <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 border border-gray-700 rounded-lg">
          <div className="px-6 py-4 border-b border-gray-700">
            <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
            <p className="text-gray-400">Manage your profile information and availability</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Profile Image */}
          <div className="flex items-center space-x-6">
            <div className="relative">
              <img
                className="h-24 w-24 rounded-full object-cover border-2 border-gray-600"
                src={imagePreview || user?.profileImage || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face'}
                alt="Profile"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face';
                }}
              />
              <label className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2 cursor-pointer hover:bg-blue-700 transition-colors">
                <Camera className="h-4 w-4 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
            <div>
              <h3 className="text-lg font-medium text-white">Profile Photo</h3>
              <p className="text-sm text-gray-400">Upload a professional photo to build trust with customers</p>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled
                className="w-full px-3 py-2 bg-gray-600 border border-gray-600 rounded-lg text-gray-400 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your phone number"
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              About Me
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Tell customers about yourself, your experience, and what makes you special..."
            />
            <p className="text-sm text-gray-400 mt-1">
              {formData.bio.length}/500 characters
            </p>
          </div>

          {/* Location */}
          <div>
            <h3 className="text-lg font-medium text-white mb-4 flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-blue-500" />
              Service Location
            </h3>

            {/* Map Picker */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Pin Your Exact Location *
              </label>
              <p className="text-sm text-gray-400 mb-4">
                Click on the map or search for your location to help customers find you easily
              </p>
              <MapPicker
                initialPosition={
                  formData.address.coordinates.latitude && formData.address.coordinates.longitude
                    ? [formData.address.coordinates.latitude, formData.address.coordinates.longitude]
                    : [28.6139, 77.2090]
                }
                onLocationSelect={handleLocationSelect}
                category="default"
                height="350px"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Street Address *
                </label>
                <input
                  type="text"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your street address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="City"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  State *
                </label>
                <input
                  type="text"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="State"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  PIN Code *
                </label>
                <input
                  type="text"
                  name="address.pincode"
                  value={formData.address.pincode}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="PIN Code"
                  pattern="[0-9]{6}"
                  maxLength="6"
                />
              </div>
            </div>

            {/* Coordinates Display */}
            {formData.address.coordinates.latitude && formData.address.coordinates.longitude && (
              <div className="mt-4 p-3 bg-green-900 border border-green-700 rounded-lg">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-green-400" />
                  <span className="text-sm font-medium text-green-300">Location Set Successfully</span>
                </div>
                <div className="text-xs text-green-400 mt-1">
                  Coordinates: {formData.address.coordinates.latitude.toFixed(6)}, {formData.address.coordinates.longitude.toFixed(6)}
                </div>
              </div>
            )}
          </div>

          {/* Working Hours */}
          <div>
            <h3 className="text-lg font-medium text-white mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-blue-500" />
              Working Hours
            </h3>
            <div className="space-y-4">
              {formData.workingHours.map((hour, index) => (
                <div key={hour.day} className="flex items-center space-x-4 p-4 bg-gray-700 rounded-lg">
                  <div className="w-24">
                    <span className="text-sm font-medium text-white">
                      {dayNames[hour.day]}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={hour.isAvailable}
                      onChange={(e) => handleWorkingHoursChange(index, 'isAvailable', e.target.checked)}
                      className="rounded border-gray-600 text-blue-600 focus:ring-blue-500 bg-gray-600"
                    />
                    <span className="text-sm text-gray-300">Available</span>
                  </div>

                  {hour.isAvailable && (
                    <>
                      <div>
                        <input
                          type="time"
                          value={hour.start}
                          onChange={(e) => handleWorkingHoursChange(index, 'start', e.target.value)}
                          className="px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <span className="text-gray-400">to</span>
                      <div>
                        <input
                          type="time"
                          value={hour.end}
                          onChange={(e) => handleWorkingHoursChange(index, 'end', e.target.value)}
                          className="px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="flex items-center p-4 bg-red-900 border border-red-700 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <span className="text-red-300">{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center p-4 bg-green-900 border border-green-700 rounded-lg">
              <span className="text-green-300">{success}</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-medium rounded-lg transition-colors flex items-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default React.memo(ProviderProfile);
