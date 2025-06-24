import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  MapPin,
  Star,
  Clock,
  IndianRupee,
  Heart,
  Grid3X3,
  List,
  SlidersHorizontal,
  RefreshCw
} from 'lucide-react';
import { servicesAPI } from '../../services/api';
import { Card, Button, FormInput, LoadingSpinner } from '../../components/shared';

const BrowseServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    location: '',
    minRating: '',
    priceRange: '',
    availability: '',
    sortBy: 'rating'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    { value: 'cooking', label: 'Cooking', icon: '🍱' },
    { value: 'tailoring', label: 'Tailoring', icon: '✂️' },
    { value: 'tuition', label: 'Tuition', icon: '🧑‍🏫' },
    { value: 'beauty', label: 'Beauty & Grooming', icon: '💄' },
    { value: 'cleaning', label: 'Cleaning', icon: '🧹' },
    { value: 'childcare', label: 'Childcare', icon: '👶' },
    { value: 'other', label: 'Other', icon: '🔧' }
  ];

  const sortOptions = [
    { value: 'rating', label: 'Highest Rated' },
    { value: 'newest', label: 'Recently Added' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
    { value: 'distance', label: 'Nearest First' }
  ];

  useEffect(() => {
    fetchServices();
  }, [filters, pagination.page]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search || undefined,
        category: filters.category || undefined,
        location: filters.location || undefined,
        minRating: filters.minRating || undefined,
        sortBy: filters.sortBy,
        isActive: true,
        isApproved: true,
        _t: Date.now() // Cache busting parameter
      };

      const response = await servicesAPI.getServices(params);
      setServices(response.data.services || []);
      setPagination(response.data.pagination || pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      location: '',
      minRating: '',
      priceRange: '',
      availability: '',
      sortBy: 'rating'
    });
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-600'
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

  const ServiceCard = ({ service }) => (
    <Card theme="dark" hover={true} className="overflow-hidden">
      <div className="relative">
        <img
          src={service.images?.[0]?.url || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&crop=center'}
          alt={service.title}
          className="w-full h-48 object-cover"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&crop=center';
          }}
        />
        <button className="absolute top-3 right-3 p-2 bg-gray-800 bg-opacity-80 rounded-full shadow-sm hover:bg-gray-700">
          <Heart className="w-4 h-4 text-gray-300" />
        </button>
        <div className="absolute bottom-3 left-3">
          <span className="px-2 py-1 bg-gray-800 bg-opacity-90 text-white text-xs font-medium rounded-full">
            {categories.find(c => c.value === service.category)?.icon} {service.category}
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-white line-clamp-2">
            {service.title}
          </h3>
          <div className="flex items-center ml-2">
            {renderStars(service.rating?.average || 0)}
            <span className="ml-1 text-sm text-gray-400">
              ({service.rating?.count || 0})
            </span>
          </div>
        </div>

        <p className="text-gray-300 text-sm mb-3 line-clamp-2">
          {service.description}
        </p>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center text-sm text-gray-400">
            <MapPin className="w-4 h-4 mr-1" />
            {service.provider?.address?.city || 'Location not specified'}
          </div>
          <div className="flex items-center text-sm text-gray-400">
            <Clock className="w-4 h-4 mr-1" />
            {service.duration?.estimated}min
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <img
              src={service.provider?.profileImage || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'}
              alt={service.provider?.name}
              className="w-8 h-8 rounded-full object-cover mr-2"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face';
              }}
            />
            <div>
              <span className="text-sm font-medium text-white">
                {service.provider?.name}
              </span>
              {service.provider?.feedbackRating?.averageRating > 0 && (
                <div className="flex items-center mt-1">
                  <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
                  <span className="text-xs text-gray-400">
                    {service.provider.feedbackRating.averageRating.toFixed(1)}
                    ({service.provider.feedbackRating.totalFeedbacks})
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="text-lg font-bold text-coral-400">
            {formatPrice(service.pricing)}
          </div>
        </div>

        <Link to={`/customer/services/${service._id}`} className="mt-4 block">
          <Button theme="dark" variant="primary" className="w-full">
            View Details
          </Button>
        </Link>
      </div>
    </Card>
  );

  if (loading && services.length === 0) {
    return (
      <LoadingSpinner
        size="lg"
        theme="dark"
        text="Loading services..."
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
            <h1 className="text-2xl font-bold text-white">Browse Services</h1>
            <p className="text-gray-300">Discover amazing services from talented providers</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              onClick={fetchServices}
              theme="dark"
              variant="outline"
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <div className="flex items-center bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-gray-600 text-white' : 'text-gray-300'}`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-gray-600 text-white' : 'text-gray-300'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Search and Filters */}
      <Card theme="dark" className="mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search services..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10 w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:border-coral-500 focus:ring-coral-500 focus:outline-none focus:ring-1"
              />
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-3">
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:border-coral-500 focus:ring-coral-500 focus:outline-none focus:ring-1"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.icon} {category.label}
                </option>
              ))}
            </select>

            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:border-coral-500 focus:ring-coral-500 focus:outline-none focus:ring-1"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <Button
              onClick={() => setShowFilters(!showFilters)}
              theme="dark"
              variant="outline"
              className="flex items-center gap-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              More Filters
            </Button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  placeholder="Enter city or area"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:border-coral-500 focus:ring-coral-500 focus:outline-none focus:ring-1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Minimum Rating
                </label>
                <select
                  value={filters.minRating}
                  onChange={(e) => handleFilterChange('minRating', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:border-coral-500 focus:ring-coral-500 focus:outline-none focus:ring-1"
                >
                  <option value="">Any Rating</option>
                  <option value="4">4+ Stars</option>
                  <option value="3">3+ Stars</option>
                  <option value="2">2+ Stars</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Price Range
                </label>
                <select
                  value={filters.priceRange}
                  onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:border-coral-500 focus:ring-coral-500 focus:outline-none focus:ring-1"
                >
                  <option value="">Any Price</option>
                  <option value="0-500">Under ₹500</option>
                  <option value="500-1000">₹500 - ₹1000</option>
                  <option value="1000-2000">₹1000 - ₹2000</option>
                  <option value="2000+">Above ₹2000</option>
                </select>
              </div>

              <div className="flex items-end">
                <Button
                  onClick={clearFilters}
                  theme="dark"
                  variant="outline"
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-300">
          {loading ? 'Loading...' : `${pagination.total || 0} services found`}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <Card theme="dark" className="mb-6 border-red-600">
          <p className="text-red-400">{error}</p>
        </Card>
      )}

      {/* Services Grid */}
      {services.length === 0 && !loading ? (
        <Card theme="dark" className="p-12 text-center">
          <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No services found</h3>
          <p className="text-gray-300 mb-6">
            Try adjusting your search criteria or browse all categories.
          </p>
          <Button
            onClick={clearFilters}
            theme="dark"
            variant="primary"
          >
            Clear Filters
          </Button>
        </Card>
      ) : (
        <div className={`grid gap-6 ${
          viewMode === 'grid'
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            : 'grid-cols-1'
        }`}>
          {services.map((service) => (
            <ServiceCard key={service._id} service={service} />
          ))}
        </div>
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

export default BrowseServices;
