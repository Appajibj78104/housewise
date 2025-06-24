const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
  },
  role: {
    type: String,
    enum: ['customer', 'housewife', 'admin'],
    default: 'customer'
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: {
      type: String,
      default: 'India'
    },
    district: String, // Administrative district
    pincode: {
      type: String,
      match: [/^[0-9]{6}$/, 'Please enter a valid 6-digit pincode']
    },
    formattedAddress: String, // Full formatted address from geocoding
    coordinates: {
      latitude: {
        type: Number,
        min: [-90, 'Latitude must be between -90 and 90'],
        max: [90, 'Latitude must be between -90 and 90']
      },
      longitude: {
        type: Number,
        min: [-180, 'Longitude must be between -180 and 180'],
        max: [180, 'Longitude must be between -180 and 180']
      }
    },
    // GeoJSON Point for MongoDB geospatial queries
    location: {
      type: {
        type: String,
        enum: ['Point']
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: '2dsphere'
      }
    },
    // Geocoding metadata
    geocoding: {
      lastUpdated: Date,
      source: String, // 'nominatim', 'manual', etc.
      confidence: Number
    }
  },
  profileImage: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isApproved: {
    type: Boolean,
    default: function() {
      // Auto-approve customers, require approval for housewives
      return this.role === 'customer';
    }
  },
  // Housewife specific fields
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot be more than 500 characters']
  },
  experience: {
    type: Number,
    min: [0, 'Experience cannot be negative']
  },
  location: {
    address: String,
    city: String,
    state: String,
    pincode: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  workingHours: [{
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    start: String,
    end: String,
    isAvailable: {
      type: Boolean,
      default: true
    }
  }],
  isAvailable: {
    type: Boolean,
    default: true
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  totalEarnings: {
    type: Number,
    default: 0
  },
  completedServices: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for location-based queries
userSchema.index({ 'address.coordinates': '2dsphere' });
userSchema.index({ 'location.coordinates': '2dsphere' });

// Index for text search
userSchema.index({ name: 'text', bio: 'text' });

// Pre-save middleware to hash password, update location, and perform reverse geocoding
userSchema.pre('save', async function(next) {
  // Hash password if modified
  if (this.isModified('password')) {
    try {
      const salt = await bcrypt.genSalt(12);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
      return next(error);
    }
  }

  // Handle address and coordinates updates
  if (this.address && this.address.coordinates &&
      this.address.coordinates.latitude && this.address.coordinates.longitude) {

    // Update GeoJSON location
    this.address.location = {
      type: 'Point',
      coordinates: [this.address.coordinates.longitude, this.address.coordinates.latitude]
    };

    // Perform reverse geocoding if coordinates changed or administrative fields are missing
    const coordsChanged = this.isModified('address.coordinates.latitude') ||
                         this.isModified('address.coordinates.longitude');
    const missingAdminFields = !this.address.city || !this.address.state;

    if (coordsChanged || missingAdminFields) {
      try {
        const { reverseGeocode } = require('../utils/geocoding');
        const geocodeResult = await reverseGeocode(
          this.address.coordinates.latitude,
          this.address.coordinates.longitude
        );

        if (geocodeResult.success || geocodeResult.fallback) {
          const data = geocodeResult.data;

          // Update administrative fields if not manually set
          if (!this.address.city || coordsChanged) {
            this.address.city = data.city;
          }
          if (!this.address.state || coordsChanged) {
            this.address.state = data.state;
          }
          if (!this.address.country || coordsChanged) {
            this.address.country = data.country;
          }
          if (data.district) {
            this.address.district = data.district;
          }
          if (data.pincode && !this.address.pincode) {
            this.address.pincode = data.pincode;
          }
          if (data.formattedAddress) {
            this.address.formattedAddress = data.formattedAddress;
          }

          // Update geocoding metadata
          this.address.geocoding = {
            lastUpdated: new Date(),
            source: geocodeResult.success ? 'nominatim' : 'fallback',
            confidence: geocodeResult.success ? 0.8 : 0.3
          };
        }
      } catch (geocodeError) {
        console.error('Reverse geocoding failed:', geocodeError);
        // Don't fail the save operation, just log the error
      }
    }
  } else {
    // Remove location if coordinates are not provided
    if (this.address) {
      this.address.location = undefined;
    }
  }

  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get public profile
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

// Virtual for full address
userSchema.virtual('fullAddress').get(function() {
  if (!this.address) return '';
  const { street, city, state, pincode } = this.address;
  return [street, city, state, pincode].filter(Boolean).join(', ');
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('User', userSchema);
