import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { providerAPI } from '../../services/api';
import { 
  Save, 
  ArrowLeft, 
  Upload, 
  X, 
  AlertCircle,
  Clock,
  DollarSign,
  Calendar
} from 'lucide-react';

const ServiceForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'cooking',
    pricing: {
      type: 'fixed',
      amount: ''
    },
    duration: {
      estimated: 60
    },
    availability: {
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    },
    requirements: {
      materials: '',
      space: '',
      other: ''
    }
  });

  useEffect(() => {
    if (isEditing) {
      fetchService();
    }
  }, [id, isEditing]);

  const fetchService = async () => {
    try {
      setLoading(true);
      // Get all services and find the one with matching ID
      const response = await providerAPI.getMyServices();
      const service = response.data.services.find(s => s._id === id);
      if (service) {
        setFormData({
          title: service.title || '',
          description: service.description || '',
          category: service.category || 'cooking',
          pricing: service.pricing || { type: 'fixed', amount: '' },
          duration: service.duration || { estimated: 60 },
          availability: service.availability || { days: [] },
          requirements: service.requirements || { materials: '', space: '', other: '' }
        });

        if (service.images) {
          setImagePreviews(service.images.map(img => img.url));
        }
      } else {
        setError('Service not found');
      }
    } catch (err) {
      setError('Failed to load service details');
    } finally {
      setLoading(false);
    }
  };

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

  const handleDayToggle = (day) => {
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        days: prev.availability.days.includes(day)
          ? prev.availability.days.filter(d => d !== day)
          : [...prev.availability.days, day]
      }
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      setError('Maximum 5 images allowed');
      return;
    }

    setImages(prev => [...prev, ...files]);

    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Comprehensive client-side validation
    const validationErrors = [];

    // Title validation
    if (!formData.title || formData.title.trim().length === 0) {
      validationErrors.push('Title is required');
    } else if (formData.title.trim().length < 5) {
      validationErrors.push('Title must be at least 5 characters');
    } else if (formData.title.trim().length > 100) {
      validationErrors.push('Title must be less than 100 characters');
    } else if (!/^[a-zA-Z0-9\s\-&.,()]+$/.test(formData.title.trim())) {
      validationErrors.push('Title contains invalid characters. Use only letters, numbers, spaces, and basic punctuation');
    }

    // Description validation
    if (!formData.description || formData.description.trim().length === 0) {
      validationErrors.push('Description is required');
    } else if (formData.description.trim().length < 20) {
      validationErrors.push('Description must be at least 20 characters');
    } else if (formData.description.trim().length > 1000) {
      validationErrors.push('Description must be less than 1000 characters');
    }

    // Category validation
    if (!formData.category) {
      validationErrors.push('Please select a category');
    }

    // Pricing validation
    if (!formData.pricing.type) {
      validationErrors.push('Please select a pricing type');
    } else if (formData.pricing.type !== 'negotiable') {
      if (!formData.pricing.amount || formData.pricing.amount <= 0) {
        validationErrors.push('Please enter a valid price amount');
      } else if (formData.pricing.amount > 50000) {
        validationErrors.push('Price must be less than ₹50,000');
      }
    }

    // Duration validation
    if (!formData.duration.estimated || formData.duration.estimated <= 0) {
      validationErrors.push('Please enter estimated duration');
    } else if (formData.duration.estimated < 15) {
      validationErrors.push('Duration must be at least 15 minutes');
    } else if (formData.duration.estimated > 1440) {
      validationErrors.push('Duration must be less than 24 hours (1440 minutes)');
    }

    // Availability validation
    if (formData.availability.days.length === 0) {
      validationErrors.push('Please select at least one available day');
    }

    // Requirements validation (optional but with limits)
    if (formData.requirements.materials && formData.requirements.materials.length > 500) {
      validationErrors.push('Materials requirements must be less than 500 characters');
    }
    if (formData.requirements.space && formData.requirements.space.length > 500) {
      validationErrors.push('Space requirements must be less than 500 characters');
    }
    if (formData.requirements.other && formData.requirements.other.length > 500) {
      validationErrors.push('Other requirements must be less than 500 characters');
    }

    if (validationErrors.length > 0) {
      setError(validationErrors.join('. '));
      setLoading(false);
      return;
    }

    try {
      const submitData = { ...formData };
      if (images.length > 0) {
        submitData.images = images;
      }

      if (isEditing) {
        await providerAPI.updateService(id, submitData);
        setSuccess('Service updated successfully!');
      } else {
        await providerAPI.createService(submitData);
        setSuccess('Service created successfully!');
      }

      setTimeout(() => {
        navigate('/provider/services');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save service');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: 'cooking', label: 'Cooking' },
    { value: 'tailoring', label: 'Tailoring' },
    { value: 'tuition', label: 'Tuition' },
    { value: 'beauty', label: 'Beauty' },
    { value: 'cleaning', label: 'Cleaning' },
    { value: 'childcare', label: 'Childcare' },
    { value: 'other', label: 'Other' }
  ];

  const days = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center mb-8">
        <button
          onClick={() => navigate('/provider/services')}
          className="mr-4 p-2 text-gray-400 hover:text-gray-600"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Service' : 'Create New Service'}
          </h1>
          <p className="text-gray-600">
            {isEditing ? 'Update your service details' : 'Add a new service to your offerings'}
          </p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  minLength={5}
                  maxLength={100}
                  pattern="^[a-zA-Z0-9\s\-&.,()]+$"
                  className="input"
                  placeholder="e.g., Home Cooking Service, Tailoring & Alterations"
                />
                <div className="flex justify-between items-center mt-1">
                  <span className="text-sm text-gray-500">
                    {formData.title.length}/100 characters (minimum 5)
                  </span>
                  {formData.title && (
                    <div className="text-sm">
                      {formData.title.length < 5 && (
                        <span className="text-red-500">Need {5 - formData.title.length} more characters</span>
                      )}
                      {formData.title.length > 100 && (
                        <span className="text-red-500">Too long by {formData.title.length - 100} characters</span>
                      )}
                      {!/^[a-zA-Z0-9\s\-&.,()]*$/.test(formData.title) && (
                        <span className="text-red-500">Invalid characters detected</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="select"
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  minLength={20}
                  maxLength={1000}
                  rows={4}
                  className="textarea"
                  placeholder="Describe your service in detail. What do you offer? What makes you special? Include your experience, specialties, and what customers can expect. (20-1000 characters)"
                />
                <div className="flex justify-between items-center mt-1">
                  <span className="text-sm text-gray-500">
                    {formData.description.length}/1000 characters (minimum 20)
                  </span>
                  {formData.description && (
                    <div className="text-sm">
                      {formData.description.length < 20 && (
                        <span className="text-red-500">Need {20 - formData.description.length} more characters</span>
                      )}
                      {formData.description.length > 1000 && (
                        <span className="text-red-500">Too long by {formData.description.length - 1000} characters</span>
                      )}
                      {formData.description.length >= 20 && formData.description.length <= 1000 && (
                        <span className="text-green-500">✓ Good length</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-coral-500" />
              Pricing
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pricing Type *
                </label>
                <select
                  name="pricing.type"
                  value={formData.pricing.type}
                  onChange={handleInputChange}
                  className="select"
                >
                  <option value="fixed">Fixed Price</option>
                  <option value="hourly">Per Hour</option>
                  <option value="negotiable">Negotiable</option>
                </select>
              </div>

              {formData.pricing.type !== 'negotiable' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    name="pricing.amount"
                    value={formData.pricing.amount}
                    onChange={handleInputChange}
                    required={formData.pricing.type !== 'negotiable'}
                    min="1"
                    max="50000"
                    step="1"
                    className="input"
                    placeholder="Enter amount (₹1 - ₹50,000)"
                  />
                  {formData.pricing.type !== 'negotiable' && formData.pricing.amount && (
                    <div className="text-sm mt-1">
                      {formData.pricing.amount <= 0 && (
                        <span className="text-red-500">Amount must be greater than ₹0</span>
                      )}
                      {formData.pricing.amount > 50000 && (
                        <span className="text-red-500">Amount must be less than ₹50,000</span>
                      )}
                      {formData.pricing.amount > 0 && formData.pricing.amount <= 50000 && (
                        <span className="text-green-500">✓ Valid amount</span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Duration */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-coral-500" />
              Duration
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Time (minutes)
                </label>
                <input
                  type="number"
                  name="duration.estimated"
                  value={formData.duration.estimated}
                  onChange={handleInputChange}
                  required
                  min="15"
                  max="1440"
                  step="15"
                  className="input"
                  placeholder="60 (15-1440 minutes)"
                />
                {formData.duration.estimated && (
                  <div className="text-sm mt-1">
                    {formData.duration.estimated < 15 && (
                      <span className="text-red-500">Duration must be at least 15 minutes</span>
                    )}
                    {formData.duration.estimated > 1440 && (
                      <span className="text-red-500">Duration must be less than 24 hours (1440 minutes)</span>
                    )}
                    {formData.duration.estimated >= 15 && formData.duration.estimated <= 1440 && (
                      <span className="text-green-500">✓ Valid duration ({Math.floor(formData.duration.estimated / 60)}h {formData.duration.estimated % 60}m)</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Availability */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-coral-500" />
              Available Days
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {days.map(day => (
                <label key={day.value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.availability.days.includes(day.value)}
                    onChange={() => handleDayToggle(day.value)}
                    className="rounded border-gray-300 text-coral-600 focus:ring-coral-500 mr-2"
                  />
                  <span className="text-sm text-gray-700">{day.label}</span>
                </label>
              ))}
            </div>
            {formData.availability.days.length === 0 && (
              <p className="text-red-500 text-sm mt-2">Please select at least one available day</p>
            )}
          </div>

          {/* Images */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Images (Optional)</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-4 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG or JPEG (MAX. 5 images)</p>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Requirements */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Requirements (Optional)</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Materials/Ingredients
                </label>
                <textarea
                  name="requirements.materials"
                  value={formData.requirements.materials}
                  onChange={handleInputChange}
                  rows={2}
                  maxLength={500}
                  className="textarea"
                  placeholder="What materials or ingredients should the customer provide? (max 500 characters)"
                />
                <div className="text-sm text-gray-500 mt-1">
                  {formData.requirements.materials.length}/500 characters
                  {formData.requirements.materials.length > 500 && (
                    <span className="text-red-500 ml-2">Too long!</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Space Requirements
                </label>
                <textarea
                  name="requirements.space"
                  value={formData.requirements.space}
                  onChange={handleInputChange}
                  rows={2}
                  maxLength={500}
                  className="textarea"
                  placeholder="What kind of space or setup do you need? (max 500 characters)"
                />
                <div className="text-sm text-gray-500 mt-1">
                  {formData.requirements.space.length}/500 characters
                  {formData.requirements.space.length > 500 && (
                    <span className="text-red-500 ml-2">Too long!</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Other Requirements
                </label>
                <textarea
                  name="requirements.other"
                  value={formData.requirements.other}
                  onChange={handleInputChange}
                  rows={2}
                  maxLength={500}
                  className="textarea"
                  placeholder="Any other special requirements or conditions? (max 500 characters)"
                />
                <div className="text-sm text-gray-500 mt-1">
                  {formData.requirements.other.length}/500 characters
                  {formData.requirements.other.length > 500 && (
                    <span className="text-red-500 ml-2">Too long!</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg">
              <span className="text-green-700">{success}</span>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/provider/services')}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary flex items-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {loading ? 'Saving...' : (isEditing ? 'Update Service' : 'Create Service')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceForm;
