import React, { useState, useEffect } from 'react';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Camera,
  Save,
  AlertCircle,
  CheckCircle,
  Edit3,
  Calendar,
  Star
} from 'lucide-react';
import { customerAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import MapPicker from '../../components/map/MapPicker';
import { Card, Button, FormInput, LoadingSpinner } from '../../components/shared';

const CustomerProfile = () => {
  const { updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      coordinates: {
        latitude: null,
        longitude: null
      }
    }
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await customerAPI.getProfile();
      const customerData = response.data.customer;
      setProfile(customerData);
      setImagePreview(customerData.profileImage || '');
      setFormData({
        name: customerData.name || '',
        phone: customerData.phone || '',
        address: {
          street: customerData.address?.street || '',
          city: customerData.address?.city || '',
          state: customerData.address?.state || '',
          pincode: customerData.address?.pincode || '',
          coordinates: {
            latitude: customerData.address?.coordinates?.latitude || null,
            longitude: customerData.address?.coordinates?.longitude || null
          }
        }
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
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

  const handleLocationSelect = (locationData) => {
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const updateData = { ...formData };
      if (profileImage) {
        updateData.profileImage = profileImage;
      }

      const response = await customerAPI.updateProfile(updateData);
      updateUser(response.data.customer); // Update auth context
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      setProfileImage(null);
      fetchProfile(); // Refresh profile data
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError('');
    setSuccess('');
    // Reset form data to original profile data
    if (profile) {
      setFormData({
        name: profile.name || '',
        phone: profile.phone || '',
        address: {
          street: profile.address?.street || '',
          city: profile.address?.city || '',
          state: profile.address?.state || '',
          pincode: profile.address?.pincode || ''
        }
      });
    }
  };

  if (loading) {
    return (
      <LoadingSpinner
        size="lg"
        theme="dark"
        text="Loading profile..."
        fullScreen={true}
      />
    );
  }

  if (!profile) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 flex items-center justify-center min-h-screen">
        <Card theme="dark" className="text-center p-8">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-gray-300 mb-4">Failed to load profile</p>
          <Button
            onClick={fetchProfile}
            theme="dark"
            variant="primary"
          >
            Try Again
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
          <div>
            <h1 className="text-2xl font-bold text-white">My Profile</h1>
            <p className="text-gray-300">Manage your account information</p>
          </div>
          {!isEditing && (
            <Button
              onClick={() => setIsEditing(true)}
              theme="dark"
              variant="primary"
              className="flex items-center gap-2"
            >
              <Edit3 className="w-4 h-4" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>
      {/* Success/Error Messages */}
      {success && (
        <Card theme="dark" className="mb-6 border-green-600">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
            <span className="text-green-400">{success}</span>
          </div>
        </Card>
      )}

      {error && (
        <Card theme="dark" className="mb-6 border-red-600">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
            <span className="text-red-400">{error}</span>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <Card theme="dark">
            <div className="text-center">
              <div className="relative inline-block">
                <img
                  src={imagePreview || profile.profileImage || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face'}
                  alt={profile.name}
                  className="w-24 h-24 rounded-full object-cover mx-auto"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face';
                  }}
                />
                {isEditing && (
                  <label className="absolute bottom-0 right-0 p-2 bg-coral-600 text-white rounded-full hover:bg-coral-700 transition-colors cursor-pointer">
                    <Camera className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <h2 className="mt-4 text-xl font-semibold text-white">
                {profile.name || 'Customer'}
              </h2>
              <p className="text-gray-300">{profile.email}</p>
              <div className="mt-4 flex items-center justify-center text-sm text-gray-400">
                <Calendar className="w-4 h-4 mr-1" />
                Member since {new Date(profile.createdAt).toLocaleDateString()}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-6 pt-6 border-t border-gray-700">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-coral-400">
                    {profile.bookingStats?.total || 0}
                  </p>
                  <p className="text-sm text-gray-300">Total Bookings</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-coral-400">
                    {profile.reviewStats?.total || 0}
                  </p>
                  <p className="text-sm text-gray-300">Reviews Given</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Profile Form */}
        <div className="lg:col-span-2">
          <Card theme="dark">
            <div className="border-b border-gray-700 pb-4 mb-6">
              <h3 className="text-lg font-semibold text-white">
                Personal Information
              </h3>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      required
                      className="pl-10 w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:border-coral-500 focus:ring-coral-500 focus:outline-none focus:ring-1 disabled:bg-gray-800 disabled:text-gray-400"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="pl-10 w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:border-coral-500 focus:ring-coral-500 focus:outline-none focus:ring-1 disabled:bg-gray-800 disabled:text-gray-400"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                {/* Email (Read-only) */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="email"
                      value={profile.email}
                      disabled
                      className="pl-10 w-full px-3 py-2 bg-gray-800 border border-gray-600 text-gray-400 rounded-lg"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-400">
                    Email cannot be changed. Contact support if needed.
                  </p>
                </div>
              </div>

              {/* Address Section */}
              <div className="mt-8">
                <h4 className="text-md font-medium text-white mb-4 flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  Address Information
                </h4>

                {/* Map Picker */}
                {isEditing && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Pin Your Location
                    </label>
                    <p className="text-sm text-gray-400 mb-4">
                      Click on the map or search for your location to help service providers find you
                    </p>
                    <MapPicker
                      initialPosition={
                        formData.address.coordinates.latitude && formData.address.coordinates.longitude
                          ? [formData.address.coordinates.latitude, formData.address.coordinates.longitude]
                          : [28.6139, 77.2090]
                      }
                      onLocationSelect={handleLocationSelect}
                      category="default"
                      height="300px"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Street */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Street Address
                    </label>
                    <input
                      type="text"
                      name="address.street"
                      value={formData.address.street}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:border-coral-500 focus:ring-coral-500 focus:outline-none focus:ring-1 disabled:bg-gray-800 disabled:text-gray-400"
                      placeholder="Enter your street address"
                    />
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      name="address.city"
                      value={formData.address.city}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:border-coral-500 focus:ring-coral-500 focus:outline-none focus:ring-1 disabled:bg-gray-800 disabled:text-gray-400"
                      placeholder="Enter your city"
                    />
                  </div>

                  {/* State */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      name="address.state"
                      value={formData.address.state}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:border-coral-500 focus:ring-coral-500 focus:outline-none focus:ring-1 disabled:bg-gray-800 disabled:text-gray-400"
                      placeholder="Enter your state"
                    />
                  </div>

                  {/* Pincode */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Pincode
                    </label>
                    <input
                      type="text"
                      name="address.pincode"
                      value={formData.address.pincode}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:border-coral-500 focus:ring-coral-500 focus:outline-none focus:ring-1 disabled:bg-gray-800 disabled:text-gray-400"
                      placeholder="Enter your pincode"
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

              {/* Action Buttons */}
              {isEditing && (
                <div className="mt-8 flex items-center justify-end space-x-4">
                  <Button
                    type="button"
                    onClick={handleCancel}
                    theme="dark"
                    variant="outline"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving}
                    theme="dark"
                    variant="primary"
                    className="flex items-center gap-2"
                  >
                    {saving ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              )}
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;
