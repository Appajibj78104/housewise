const express = require('express');
const Service = require('../models/Service');
const Category = require('../models/Category');
const User = require('../models/User');
const { authenticateToken, requireHousewife, optionalAuth } = require('../middleware/auth');
const { reverseGeocode, forwardGeocode } = require('../utils/geocoding');
const { 
  validateServiceCreation, 
  validateServiceUpdate, 
  validateObjectId, 
  validatePagination,
  validateLocationQuery 
} = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/services
// @desc    Get all services with filtering and pagination
// @access  Public
router.get('/', validatePagination, validateLocationQuery, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const { 
      category, 
      subcategory, 
      city, 
      search, 
      minPrice, 
      maxPrice, 
      rating,
      latitude,
      longitude,
      radius,
      sortBy 
    } = req.query;

    // Build query
    let query = { 
      isActive: true, 
      isApproved: true 
    };

    if (category) {
      query.category = category;
    }

    if (subcategory) {
      query.subcategory = new RegExp(subcategory, 'i');
    }

    if (city) {
      query['location.serviceArea.city'] = new RegExp(city, 'i');
    }

    if (minPrice || maxPrice) {
      query['pricing.amount'] = {};
      if (minPrice) query['pricing.amount'].$gte = parseFloat(minPrice);
      if (maxPrice) query['pricing.amount'].$lte = parseFloat(maxPrice);
    }

    if (rating) {
      query['rating.average'] = { $gte: parseFloat(rating) };
    }

    if (search) {
      query.$text = { $search: search };
    }

    // Location-based query
    if (latitude && longitude) {
      const maxDistance = (radius || 10) * 1000; // Convert km to meters
      query['location.serviceArea.coordinates'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: maxDistance
        }
      };
    }

    // Build sort
    let sort = {};
    switch (sortBy) {
      case 'price_low':
        sort = { 'pricing.amount': 1 };
        break;
      case 'price_high':
        sort = { 'pricing.amount': -1 };
        break;
      case 'rating':
        sort = { 'rating.average': -1 };
        break;
      case 'newest':
        sort = { createdAt: -1 };
        break;
      case 'popular':
        sort = { totalBookings: -1 };
        break;
      default:
        sort = { featured: -1, 'rating.average': -1 };
    }

    const services = await Service.find(query)
      .populate('provider', 'name rating profileImage address')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Add review-based ratings to providers
    const Review = require('../models/Review');
    for (let service of services) {
      if (service.provider) {
        const reviews = await Review.find({ provider: service.provider._id });
        const totalReviews = reviews.length;
        const averageRating = totalReviews > 0 ?
          reviews.reduce((sum, review) => sum + (review.rating?.overall || review.rating), 0) / totalReviews : 0;

        service.provider.reviewRating = {
          averageRating: Math.round(averageRating * 10) / 10,
          totalReviews: totalReviews
        };
      }
    }

    const total = await Service.countDocuments(query);

    res.json({
      success: true,
      data: {
        services,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get services',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/services/categories
// @desc    Get all service categories
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ sortOrder: 1, displayName: 1 });

    res.json({
      success: true,
      data: {
        categories
      }
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get categories',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/services/nearby-providers
// @desc    Get nearby service providers with progressive/hierarchical filtering
// @access  Public
router.get('/nearby-providers', async (req, res) => {
  try {
    const {
      lat, lng,
      radiusKm,
      city, state, country = 'India',
      category,
      limit = 50,
      scope = 'radius' // 'radius', 'city', 'state', 'country'
    } = req.query;

    let providerQuery = {
      role: 'housewife',
      isActive: true
    };

    let searchCenter = null;
    let searchScope = scope;
    let actualRadius = null;

    // Build query based on scope
    if (scope === 'radius' && lat && lng && radiusKm) {
      // Radius-based search
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      const radius = parseFloat(radiusKm);

      if (isNaN(latitude) || isNaN(longitude) || isNaN(radius)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid coordinates or radius for radius search'
        });
      }

      providerQuery['address.location'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: radius * 1000 // Convert km to meters
        }
      };

      searchCenter = { latitude, longitude };
      actualRadius = radius;

    } else if (scope === 'city' && city) {
      // City-based search
      providerQuery['address.city'] = new RegExp(city, 'i');
      searchScope = 'city';

    } else if (scope === 'state' && state) {
      // State-based search
      providerQuery['address.state'] = new RegExp(state, 'i');
      searchScope = 'state';

    } else if (scope === 'country') {
      // Country-based search
      providerQuery['address.country'] = new RegExp(country, 'i');
      searchScope = 'country';

    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid search parameters. Provide either (lat, lng, radiusKm) or city or state for the specified scope.'
      });
    }

    // Get providers based on query
    const providers = await User.find(providerQuery)
      .select('name email profileImage bio experience rating address')
      .limit(parseInt(limit));

    // Get services for each provider and add category filtering
    const providersWithServices = await Promise.all(
      providers.map(async (provider) => {
        let serviceQuery = {
          provider: provider._id,
          isActive: true,
          isApproved: true
        };

        if (category) {
          serviceQuery.category = category;
        }

        const services = await Service.find(serviceQuery)
          .select('title category subcategory pricing rating');

        // Skip providers with no services in the requested category
        if (category && services.length === 0) {
          return null;
        }

        // Calculate distance if we have search center
        let distance = null;
        if (searchCenter) {
          distance = calculateDistance(
            searchCenter.latitude, searchCenter.longitude,
            provider.address.coordinates.latitude,
            provider.address.coordinates.longitude
          );
        }

        // Get primary category from services
        const primaryCategory = services.length > 0 ? services[0].category : null;

        return {
          ...provider.toObject(),
          services,
          distance,
          primaryCategory,
          serviceCount: services.length
        };
      })
    );

    // Filter out null results
    let validProviders = providersWithServices.filter(provider => provider !== null);

    // Sort by distance if available, otherwise by rating
    if (searchCenter) {
      validProviders.sort((a, b) => a.distance - b.distance);
    } else {
      validProviders.sort((a, b) => (b.rating?.average || 0) - (a.rating?.average || 0));
    }

    res.json({
      success: true,
      data: {
        providers: validProviders,
        searchCenter,
        radius: actualRadius,
        scope: searchScope,
        searchParams: {
          city: scope === 'city' ? city : null,
          state: scope === 'state' ? state : null,
          country: scope === 'country' ? country : null
        },
        category: category || 'all',
        total: validProviders.length
      }
    });

  } catch (error) {
    console.error('Get nearby providers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get nearby providers',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Helper function to calculate distance between two points
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  return distance;
}

// @route   GET /api/services/reverse-geocode
// @desc    Reverse geocode coordinates to get administrative information
// @access  Public
router.get('/reverse-geocode', async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates'
      });
    }

    const result = await reverseGeocode(latitude, longitude);

    res.json({
      success: true,
      data: result.data,
      geocodingSuccess: result.success,
      source: result.success ? 'nominatim' : 'fallback'
    });

  } catch (error) {
    console.error('Reverse geocoding error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reverse geocode coordinates',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/services/forward-geocode
// @desc    Forward geocode address to get coordinates and administrative information
// @access  Public
router.get('/forward-geocode', async (req, res) => {
  try {
    const { address } = req.query;

    if (!address) {
      return res.status(400).json({
        success: false,
        message: 'Address is required'
      });
    }

    const result = await forwardGeocode(address);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: 'Address not found',
        error: result.error
      });
    }

    res.json({
      success: true,
      data: result.data
    });

  } catch (error) {
    console.error('Forward geocoding error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to geocode address',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/services/featured
// @desc    Get featured services
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;

    const services = await Service.find({
      isActive: true,
      isApproved: true,
      featured: true
    })
    .populate('provider', 'name rating profileImage')
    .sort({ 'rating.average': -1 })
    .limit(limit);

    res.json({
      success: true,
      data: {
        services
      }
    });

  } catch (error) {
    console.error('Get featured services error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get featured services',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/services/by-provider/:providerId
// @desc    Get services by provider
// @access  Public
router.get('/by-provider/:providerId', validateObjectId('providerId'), validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const services = await Service.find({
      provider: req.params.providerId,
      isActive: true,
      isApproved: true
    })
    .sort({ featured: -1, 'rating.average': -1 })
    .skip(skip)
    .limit(limit);

    const total = await Service.countDocuments({
      provider: req.params.providerId,
      isActive: true,
      isApproved: true
    });

    res.json({
      success: true,
      data: {
        services,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get provider services error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get provider services',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/services/my-services
// @desc    Get current user's services
// @access  Private (Housewife only)
router.get('/my-services', authenticateToken, requireHousewife, validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const services = await Service.find({ provider: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Service.countDocuments({ provider: req.user._id });

    // Get stats
    const stats = await Service.aggregate([
      { $match: { provider: req.user._id } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: ['$isActive', 1, 0] } },
          approved: { $sum: { $cond: ['$isApproved', 1, 0] } },
          totalViews: { $sum: '$views' },
          totalBookings: { $sum: '$totalBookings' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        services,
        stats: stats[0] || {
          total: 0,
          active: 0,
          approved: 0,
          totalViews: 0,
          totalBookings: 0
        },
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get my services error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get your services',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/services/:id
// @desc    Get single service by ID
// @access  Public
router.get('/:id', validateObjectId('id'), optionalAuth, async (req, res) => {
  try {
    const service = await Service.findOne({
      _id: req.params.id,
      isActive: true,
      isApproved: true
    }).populate('provider', 'name rating profileImage address phone bio experience');

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Increment view count (only if not the owner)
    if (!req.user || req.user._id.toString() !== service.provider._id.toString()) {
      await service.incrementViews();
    }

    // Add review-based rating to provider
    const Review = require('../models/Review');
    const reviews = await Review.find({ provider: service.provider._id });
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 ?
      reviews.reduce((sum, review) => sum + (review.rating?.overall || review.rating), 0) / totalReviews : 0;

    service.provider.reviewRating = {
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: totalReviews
    };

    // Get related services
    const relatedServices = await Service.find({
      category: service.category,
      _id: { $ne: service._id },
      isActive: true,
      isApproved: true
    })
    .populate('provider', 'name rating profileImage')
    .limit(4);

    res.json({
      success: true,
      data: {
        service,
        relatedServices
      }
    });

  } catch (error) {
    console.error('Get service error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get service',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   POST /api/services
// @desc    Create a new service
// @access  Private (Housewife only)
router.post('/', authenticateToken, requireHousewife, validateServiceCreation, async (req, res) => {
  try {
    const serviceData = {
      ...req.body,
      provider: req.user._id
    };

    const service = new Service(serviceData);
    await service.save();

    const populatedService = await Service.findById(service._id)
      .populate('provider', 'name rating profileImage');

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: {
        service: populatedService
      }
    });

  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create service',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   PUT /api/services/:id
// @desc    Update a service
// @access  Private (Owner only)
router.put('/:id', authenticateToken, validateObjectId('id'), validateServiceUpdate, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Check ownership
    if (service.provider.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own services'
      });
    }

    const allowedUpdates = [
      'title', 'description', 'subcategory', 'pricing', 'duration',
      'location', 'availability', 'images', 'requirements', 'tags'
    ];

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    // If significant changes, require re-approval
    const significantFields = ['title', 'description', 'category', 'pricing'];
    const hasSignificantChanges = significantFields.some(field => 
      req.body[field] !== undefined
    );

    if (hasSignificantChanges && service.isApproved) {
      updates.isApproved = false;
      updates.approvedBy = null;
      updates.approvedAt = null;
    }

    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('provider', 'name rating profileImage');

    res.json({
      success: true,
      message: 'Service updated successfully',
      data: {
        service: updatedService
      }
    });

  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update service',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   DELETE /api/services/:id
// @desc    Delete a service
// @access  Private (Owner only)
router.delete('/:id', authenticateToken, validateObjectId('id'), async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Check ownership
    if (service.provider.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own services'
      });
    }

    // Soft delete - just mark as inactive
    await Service.findByIdAndUpdate(req.params.id, { isActive: false });

    res.json({
      success: true,
      message: 'Service deleted successfully'
    });

  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete service',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
