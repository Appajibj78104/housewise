import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Star, MapPin, Navigation, Filter, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for different service categories
const createServiceIcon = (category, isSelected = false) => {
  const iconMap = {
    'cooking': '🍱',
    'cleaning': '🧹',
    'tailoring': '✂️',
    'tutoring': '📚',
    'beauty': '💄',
    'gardening': '🌱',
    'default': '📍'
  };

  const emoji = iconMap[category] || iconMap.default;
  const bgColor = isSelected ? '#ff6b6b' : '#4f46e5';
  const size = isSelected ? 50 : 40;
  
  return L.divIcon({
    html: `<div style="
      background: ${bgColor};
      border: 3px solid white;
      border-radius: 50%;
      width: ${size}px;
      height: ${size}px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: ${size === 50 ? 22 : 18}px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      cursor: pointer;
      transition: all 0.2s ease;
    ">${emoji}</div>`,
    className: 'custom-service-marker',
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
  });
};

// Component to update map view when center changes
const MapUpdater = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || map.getZoom());
    }
  }, [center, zoom, map]);
  
  return null;
};

// Provider marker with popup
const ProviderMarker = ({ provider, isSelected, onSelect }) => {
  const position = [provider.address?.coordinates?.latitude, provider.address?.coordinates?.longitude];
  
  if (!position[0] || !position[1]) return null;

  return (
    <Marker
      position={position}
      icon={createServiceIcon(provider.primaryCategory, isSelected)}
      eventHandlers={{
        click: () => onSelect(provider)
      }}
    >
      <Popup>
        <div className="p-2 min-w-[250px]">
          <div className="flex items-start gap-3">
            <img
              src={provider.profileImage || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'}
              alt={provider.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{provider.name}</h3>
              <p className="text-sm text-gray-600 capitalize">{provider.primaryCategory}</p>
              
              {/* Rating */}
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm font-medium">
                  {provider.rating?.average?.toFixed(1) || '0.0'}
                </span>
                <span className="text-xs text-gray-500">
                  ({provider.rating?.count || 0} reviews)
                </span>
              </div>

              {/* Distance */}
              {provider.distance && (
                <p className="text-xs text-gray-500 mt-1">
                  📍 {provider.distance.toFixed(1)} km away
                </p>
              )}

              {/* Action buttons */}
              <div className="flex gap-2 mt-3">
                {provider.services && provider.services.length > 0 && provider.services[0]._id ? (
                  <Link
                    to={`/customer/services/${provider.services[0]._id}`}
                    className="flex items-center gap-1 px-3 py-1 bg-coral-600 text-white text-xs rounded-md hover:bg-coral-700"
                  >
                    <Calendar className="w-3 h-3" />
                    View Details
                  </Link>
                ) : (
                  <span className="flex items-center gap-1 px-3 py-1 bg-gray-500 text-white text-xs rounded-md cursor-not-allowed">
                    <Calendar className="w-3 h-3" />
                    No Services
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

const ServiceMapView = ({
  providers = [],
  center = [28.6139, 77.2090], // Default to Delhi
  zoom = 12,
  height = '500px',
  onLocationChange,
  selectedCategory,
  searchScope = 'radius',
  radius = 10,
  userLocationInfo = null,
  className = ''
}) => {
  const [mapCenter, setMapCenter] = useState(center);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const mapRef = useRef();

  // Get user's current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newCenter = [position.coords.latitude, position.coords.longitude];
          setMapCenter(newCenter);
          setUserLocation(newCenter);
          if (onLocationChange) {
            onLocationChange(newCenter);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your current location.');
        }
      );
    }
  };

  // Filter providers by category
  const filteredProviders = selectedCategory 
    ? providers.filter(provider => provider.primaryCategory === selectedCategory)
    : providers;

  return (
    <div className={`service-map-view ${className}`}>
      {/* Map Controls */}
      <div className="mb-4 flex flex-wrap gap-2 items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={getCurrentLocation}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            <Navigation className="h-4 w-4" />
            My Location
          </button>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>{filteredProviders.length} providers found</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {selectedCategory && (
            <div className="flex items-center gap-2 px-3 py-1 bg-coral-100 text-coral-800 rounded-full text-sm">
              <Filter className="h-4 w-4" />
              <span className="capitalize">{selectedCategory}</span>
            </div>
          )}

          {searchScope !== 'radius' && userLocationInfo && (
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              <MapPin className="h-4 w-4" />
              <span className="capitalize">
                {searchScope === 'city' && userLocationInfo.city}
                {searchScope === 'state' && userLocationInfo.state}
                {searchScope === 'country' && (userLocationInfo.country || 'India')}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Map Container */}
      <div className="relative">
        <MapContainer
          center={mapCenter}
          zoom={zoom}
          style={{ height: height, width: '100%' }}
          className="rounded-lg border border-gray-300"
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapUpdater center={mapCenter} />

          {/* User location marker */}
          {userLocation && (
            <Marker
              position={userLocation}
              icon={L.divIcon({
                html: `<div style="
                  background: #10b981;
                  border: 3px solid white;
                  border-radius: 50%;
                  width: 20px;
                  height: 20px;
                  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                "></div>`,
                className: 'user-location-marker',
                iconSize: [20, 20],
                iconAnchor: [10, 10],
              })}
            >
              <Popup>
                <div className="text-center">
                  <div className="font-medium">Your Location</div>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Provider markers */}
          {filteredProviders.map((provider) => (
            <ProviderMarker
              key={provider._id}
              provider={provider}
              isSelected={selectedProvider?._id === provider._id}
              onSelect={setSelectedProvider}
            />
          ))}
        </MapContainer>

        {/* Legend */}
        <div className="absolute bottom-2 left-2 bg-white bg-opacity-90 px-3 py-2 rounded-lg shadow-md">
          <div className="text-xs font-medium text-gray-700 mb-1">Legend:</div>
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Your Location</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>
              <span>Service Providers</span>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Provider Info */}
      {selectedProvider && (
        <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="flex items-start gap-4">
            <img
              src={selectedProvider.profileImage || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'}
              alt={selectedProvider.name}
              className="w-16 h-16 rounded-full object-cover"
            />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{selectedProvider.name}</h3>
              <p className="text-gray-600 capitalize">{selectedProvider.primaryCategory}</p>
              
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="font-medium">
                    {selectedProvider.rating?.average?.toFixed(1) || '0.0'}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({selectedProvider.rating?.count || 0} reviews)
                  </span>
                </div>
                
                {selectedProvider.distance && (
                  <span className="text-sm text-gray-500">
                    • {selectedProvider.distance.toFixed(1)} km away
                  </span>
                )}
              </div>

              <div className="flex gap-3 mt-3">
                <Link
                  to={`/customer/providers/${selectedProvider._id}`}
                  className="btn btn-outline"
                >
                  View Profile
                </Link>
                {selectedProvider.services && selectedProvider.services.length > 0 && selectedProvider.services[0]._id ? (
                  <Link
                    to={`/customer/services/${selectedProvider.services[0]._id}`}
                    className="btn btn-primary"
                  >
                    View Details
                  </Link>
                ) : (
                  <span className="btn btn-primary opacity-50 cursor-not-allowed">
                    No Services
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceMapView;
