import React, { useState, useEffect } from 'react';
import { Map, List, Filter, Search, MapPin, Star, Navigation, AlertCircle, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import ServiceMapView from '../../components/map/ServiceMapView';
import { Card, Button, LoadingSpinner } from '../../components/shared';

const ServiceMapDiscovery = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('map'); // 'map' or 'list'
  const [userLocation, setUserLocation] = useState(null);
  const [searchCenter, setSearchCenter] = useState([28.6139, 77.2090]); // Default to Delhi
  const [userLocationInfo, setUserLocationInfo] = useState(null); // City, state info
  const [autoExpanding, setAutoExpanding] = useState(false);

  const [filters, setFilters] = useState({
    category: '',
    scope: 'radius', // 'radius', 'city', 'state', 'country'
    radius: 10,
    search: ''
  });

  const [searchHistory, setSearchHistory] = useState([]);
  const [suggestions, setSuggestions] = useState(null);

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'cooking', label: 'Cooking & Catering' },
    { value: 'cleaning', label: 'House Cleaning' },
    { value: 'tailoring', label: 'Tailoring & Alterations' },
    { value: 'tutoring', label: 'Home Tutoring' },
    { value: 'beauty', label: 'Beauty & Wellness' },
    { value: 'gardening', label: 'Gardening & Landscaping' }
  ];

  // Progressive search scopes
  const getSearchScopes = () => {
    const scopes = [
      { value: 'radius', label: 'Within 10 km', radius: 10 },
      { value: 'radius', label: 'Within 25 km', radius: 25 },
      { value: 'radius', label: 'Within 50 km', radius: 50 }
    ];

    if (userLocationInfo) {
      if (userLocationInfo.city && userLocationInfo.city !== 'Unknown City') {
        scopes.push({ value: 'city', label: `Entire ${userLocationInfo.city}` });
      }
      if (userLocationInfo.state && userLocationInfo.state !== 'Unknown State') {
        scopes.push({ value: 'state', label: `Entire ${userLocationInfo.state}` });
      }
      scopes.push({ value: 'country', label: `Entire ${userLocationInfo.country || 'India'}` });
    } else {
      scopes.push(
        { value: 'city', label: 'Entire City' },
        { value: 'state', label: 'Entire State' },
        { value: 'country', label: 'Entire Country' }
      );
    }

    return scopes;
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (searchCenter) {
      fetchNearbyProviders();
    }
  }, [searchCenter, filters]);

  const getCurrentLocation = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location = [position.coords.latitude, position.coords.longitude];
          setUserLocation(location);
          setSearchCenter(location);

          // Get location information via reverse geocoding
          try {
            const response = await fetch(
              `http://localhost:5000/api/services/reverse-geocode?lat=${position.coords.latitude}&lng=${position.coords.longitude}`
            );
            const data = await response.json();

            if (data.success) {
              setUserLocationInfo(data.data);
            }
          } catch (error) {
            console.error('Error getting location info:', error);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('Unable to get your location. Using default location (Delhi).');
          // Use default location (Delhi) if geolocation fails
          setUserLocationInfo({
            city: 'Delhi',
            state: 'Delhi',
            country: 'India'
          });
        }
      );
    }
  };

  const fetchNearbyProviders = async (customFilters = null) => {
    const currentFilters = customFilters || filters;

    if (!searchCenter && currentFilters.scope === 'radius') return;

    setLoading(true);
    setError('');
    setSuggestions(null);

    try {
      const params = {
        scope: currentFilters.scope,
        limit: 50
      };

      // Add scope-specific parameters
      if (currentFilters.scope === 'radius') {
        params.lat = searchCenter[0];
        params.lng = searchCenter[1];
        params.radiusKm = currentFilters.radius;
      } else if (currentFilters.scope === 'city' && userLocationInfo?.city) {
        params.city = userLocationInfo.city;
      } else if (currentFilters.scope === 'state' && userLocationInfo?.state) {
        params.state = userLocationInfo.state;
      } else if (currentFilters.scope === 'country') {
        params.country = userLocationInfo?.country || 'India';
      }

      if (currentFilters.category) {
        params.category = currentFilters.category;
      }

      const response = await fetch(`http://localhost:5000/api/services/nearby-providers?${new URLSearchParams(params)}`);
      const data = await response.json();

      if (data.success) {
        setProviders(data.data.providers);

        // Add to search history
        const searchEntry = {
          scope: currentFilters.scope,
          radius: currentFilters.radius,
          category: currentFilters.category,
          resultCount: data.data.providers.length,
          timestamp: new Date()
        };
        setSearchHistory(prev => [searchEntry, ...prev.slice(0, 4)]);

        // Auto-expand if no results found
        if (data.data.providers.length === 0 && !autoExpanding) {
          suggestBroaderSearch(currentFilters);
        }
      } else {
        setError(data.message || 'Failed to fetch providers');
      }
    } catch (err) {
      setError('Failed to fetch nearby providers');
      console.error('Error fetching providers:', err);
    } finally {
      setLoading(false);
    }
  };

  const suggestBroaderSearch = (currentFilters) => {
    const scopes = getSearchScopes();
    const currentIndex = scopes.findIndex(scope =>
      scope.value === currentFilters.scope &&
      (scope.radius === currentFilters.radius || !scope.radius)
    );

    if (currentIndex < scopes.length - 1) {
      const nextScope = scopes[currentIndex + 1];
      setSuggestions({
        message: `No providers found. Try searching ${nextScope.label.toLowerCase()}?`,
        nextScope: nextScope,
        action: () => {
          const newFilters = {
            ...currentFilters,
            scope: nextScope.value,
            radius: nextScope.radius || currentFilters.radius
          };
          setFilters(newFilters);
          setAutoExpanding(true);
          fetchNearbyProviders(newFilters);
          setTimeout(() => setAutoExpanding(false), 1000);
        }
      });
    }
  };

  const handleLocationChange = (newCenter) => {
    setSearchCenter(newCenter);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const filteredProviders = providers.filter(provider => {
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      return (
        provider.name.toLowerCase().includes(searchTerm) ||
        provider.bio?.toLowerCase().includes(searchTerm) ||
        provider.primaryCategory?.toLowerCase().includes(searchTerm)
      );
    }
    return true;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Discover Local Services</h1>
        <p className="text-gray-300">Find trusted service providers with progressive search</p>
        {userLocationInfo && (
          <p className="text-sm text-gray-400 mt-1">
            📍 Your location: {userLocationInfo.city}, {userLocationInfo.state}
          </p>
        )}
      </div>

      {/* Filters and Controls */}
      <Card theme="dark" className="mb-6">
        <div className="space-y-4">
          {/* Search and Category Row */}
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search providers, services, or areas..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10 pr-4 py-2 w-full bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:border-coral-500 focus:ring-coral-500 focus:outline-none focus:ring-1"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="min-w-[200px]">
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:border-coral-500 focus:ring-coral-500 focus:outline-none focus:ring-1"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Progressive Search Scope */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Search Scope
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
              {getSearchScopes().map((scope, index) => (
                <button
                  key={`${scope.value}-${scope.radius || scope.label}`}
                  onClick={() => {
                    const newFilters = {
                      ...filters,
                      scope: scope.value,
                      radius: scope.radius || filters.radius
                    };
                    setFilters(newFilters);
                    fetchNearbyProviders(newFilters);
                  }}
                  className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                    (filters.scope === scope.value &&
                     (scope.radius === filters.radius || !scope.radius))
                      ? 'bg-coral-600 text-white border-coral-600'
                      : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                  }`}
                >
                  {scope.label}
                </button>
              ))}
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'map'
                  ? 'bg-gray-600 text-white shadow-sm'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <Map className="h-4 w-4" />
              Map
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-gray-600 text-white shadow-sm'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <List className="h-4 w-4" />
              List
            </button>
          </div>
        </div>

        {/* Results Count and Status */}
        <div className="mt-4 flex items-center justify-between text-sm text-gray-300">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>
              {loading ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Searching...
                </span>
              ) : (
                `${filteredProviders.length} providers found`
              )}
              {filters.category && ` in ${categories.find(c => c.value === filters.category)?.label}`}
              {filters.scope === 'radius' && ` within ${filters.radius} km`}
              {filters.scope === 'city' && userLocationInfo?.city && ` in ${userLocationInfo.city}`}
              {filters.scope === 'state' && userLocationInfo?.state && ` in ${userLocationInfo.state}`}
              {filters.scope === 'country' && ` in ${userLocationInfo?.country || 'India'}`}
            </span>
          </div>

          {userLocation && (
            <button
              onClick={getCurrentLocation}
              className="flex items-center gap-1 text-coral-400 hover:text-coral-300"
            >
              <Navigation className="h-4 w-4" />
              Refresh location
            </button>
          )}
        </div>
      </Card>

      {/* Suggestions for broader search */}
      {suggestions && (
        <Card theme="dark" className="mb-6 border-yellow-600">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-yellow-300">{suggestions.message}</p>
              <Button
                onClick={suggestions.action}
                theme="dark"
                variant="primary"
                size="sm"
                className="mt-2 bg-yellow-600 hover:bg-yellow-700"
              >
                Expand Search
              </Button>
            </div>
            <button
              onClick={() => setSuggestions(null)}
              className="text-yellow-400 hover:text-yellow-300"
            >
              ×
            </button>
          </div>
        </Card>
      )}

      {/* Search History */}
      {searchHistory.length > 0 && (
        <Card theme="dark" className="mb-6">
          <h3 className="text-sm font-medium text-white mb-2">Recent Searches</h3>
          <div className="flex flex-wrap gap-2">
            {searchHistory.slice(0, 3).map((search, index) => (
              <button
                key={index}
                onClick={() => {
                  const newFilters = {
                    ...filters,
                    scope: search.scope,
                    radius: search.radius,
                    category: search.category
                  };
                  setFilters(newFilters);
                  fetchNearbyProviders(newFilters);
                }}
                className="px-3 py-1 bg-gray-700 border border-gray-600 rounded-full text-xs text-gray-300 hover:bg-gray-600"
              >
                {search.scope === 'radius' ? `${search.radius}km` : search.scope}
                {search.category && ` • ${search.category}`}
                <span className="ml-1 text-gray-400">({search.resultCount})</span>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Error Message */}
      {error && (
        <Card theme="dark" className="mb-6 border-red-600">
          <div className="text-red-400">{error}</div>
        </Card>
      )}

      {/* Content */}
      {viewMode === 'map' ? (
        <Card theme="dark">
          <ServiceMapView
            providers={filteredProviders}
            center={searchCenter}
            zoom={filters.scope === 'radius' ? 12 : (filters.scope === 'city' ? 10 : 8)}
            height="600px"
            onLocationChange={handleLocationChange}
            selectedCategory={filters.category}
            searchScope={filters.scope}
            radius={filters.radius}
            userLocationInfo={userLocationInfo}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProviders.map((provider) => (
            <Card key={provider._id} theme="dark">
              <div className="flex items-start gap-4">
                <img
                  src={provider.profileImage || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'}
                  alt={provider.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{provider.name}</h3>
                  <p className="text-sm text-gray-300 capitalize">{provider.primaryCategory}</p>

                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium text-white">
                      {provider.rating?.average?.toFixed(1) || '0.0'}
                    </span>
                    <span className="text-xs text-gray-400">
                      ({provider.rating?.count || 0})
                    </span>
                  </div>

                  {provider.distance && (
                    <p className="text-xs text-gray-400 mt-1">
                      📍 {provider.distance.toFixed(1)} km away
                    </p>
                  )}

                  <div className="flex gap-2 mt-3">
                    <Link to={`/customer/providers/${provider._id}`}>
                      <Button theme="dark" variant="outline" size="sm">View Profile</Button>
                    </Link>
                    {provider.services && provider.services.length > 0 && provider.services[0]._id ? (
                      <Link to={`/customer/services/${provider.services[0]._id}`}>
                        <Button theme="dark" variant="primary" size="sm">View Details</Button>
                      </Link>
                    ) : (
                      <Button theme="dark" variant="primary" size="sm" disabled>No Services</Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {!loading && filteredProviders.length === 0 && (
            <div className="col-span-full text-center py-12">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No providers found</h3>
              <p className="text-gray-300">Try adjusting your filters or search in a different area.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ServiceMapDiscovery;
