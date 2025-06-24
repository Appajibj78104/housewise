import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, Search } from 'lucide-react';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icon for service providers
const createCustomIcon = (category) => {
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
  
  return L.divIcon({
    html: `<div style="
      background: #ff6b6b;
      border: 3px solid white;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    ">${emoji}</div>`,
    className: 'custom-marker',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

// Component to handle map clicks
const LocationMarker = ({ position, setPosition, category }) => {
  const map = useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position === null ? null : (
    <Marker 
      position={position} 
      icon={createCustomIcon(category)}
    />
  );
};

const MapPicker = ({ 
  initialPosition = [28.6139, 77.2090], // Default to Delhi
  onLocationSelect,
  category = 'default',
  height = '400px',
  className = ''
}) => {
  const [position, setPosition] = useState(initialPosition);
  const [address, setAddress] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const mapRef = useRef();

  // Memoize the callback to prevent unnecessary re-renders
  const notifyLocationChange = useCallback(() => {
    if (position && onLocationSelect) {
      onLocationSelect({
        latitude: position[0],
        longitude: position[1],
        address: address
      });
    }
  }, [position, address, onLocationSelect]);

  useEffect(() => {
    notifyLocationChange();
  }, [notifyLocationChange]);

  // Get current location
  const getCurrentLocation = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (location) => {
          const newPos = [location.coords.latitude, location.coords.longitude];
          setPosition(newPos);
          reverseGeocode(newPos);
          setLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setLoading(false);
          alert('Unable to get your current location. Please click on the map to set your location.');
        }
      );
    } else {
      setLoading(false);
      alert('Geolocation is not supported by this browser.');
    }
  };

  // Reverse geocoding to get address from coordinates
  const reverseGeocode = async (coords) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords[0]}&lon=${coords[1]}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      if (data.display_name) {
        setAddress(data.display_name);
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
    }
  };

  // Search for location
  const searchLocation = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&countrycodes=in`
      );
      const data = await response.json();
      
      if (data.length > 0) {
        const newPos = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        setPosition(newPos);
        setAddress(data[0].display_name);
        
        // Pan map to new location
        if (mapRef.current) {
          mapRef.current.setView(newPos, 15);
        }
      } else {
        alert('Location not found. Please try a different search term.');
      }
    } catch (error) {
      console.error('Error searching location:', error);
      alert('Error searching for location. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchLocation();
    }
  };

  return (
    <div className={`map-picker ${className}`}>
      {/* Search and Controls */}
      <div className="mb-4 space-y-3">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search for a location (e.g., Connaught Place, Delhi)"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-coral-500"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          <button
            onClick={searchLocation}
            disabled={loading}
            className="px-4 py-2 bg-coral-600 text-white rounded-lg hover:bg-coral-700 disabled:opacity-50"
          >
            Search
          </button>
        </div>
        
        <button
          onClick={getCurrentLocation}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <Navigation className="h-4 w-4" />
          {loading ? 'Getting Location...' : 'Use Current Location'}
        </button>
      </div>

      {/* Map Container */}
      <div className="relative">
        <MapContainer
          center={position}
          zoom={13}
          style={{ height: height, width: '100%' }}
          className="rounded-lg border border-gray-300"
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker 
            position={position} 
            setPosition={setPosition} 
            category={category}
          />
        </MapContainer>
        
        {/* Instructions overlay */}
        <div className="absolute top-2 left-2 bg-white bg-opacity-90 px-3 py-2 rounded-lg shadow-md">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <MapPin className="h-4 w-4" />
            Click on the map to set your location
          </div>
        </div>
      </div>

      {/* Selected Address Display */}
      {address && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium text-gray-700 mb-1">Selected Location:</div>
          <div className="text-sm text-gray-600">{address}</div>
          <div className="text-xs text-gray-500 mt-1">
            Coordinates: {position[0].toFixed(6)}, {position[1].toFixed(6)}
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(MapPicker);
