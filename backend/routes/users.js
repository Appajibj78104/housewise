const express = require('express');
const User = require('../models/User');
const Service = require('../models/Service');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const { authenticateToken, requireHousewife } = require('../middleware/auth');
const { validateUserUpdate, validateObjectId, validatePagination } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get current user's detailed profile
// @access  Private
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get additional stats for housewives
    let additionalData = {};
    
    if (user.role === 'housewife') {
      const [services, bookings, reviews] = await Promise.all([
        Service.countDocuments({ provider: user._id, isActive: true }),
        Booking.countDocuments({ provider: user._id, status: 'completed' }),
        Review.getProviderAverageRating(user._id).catch(() => ({ averageRating: 0, totalReviews: 0 }))
      ]);

      additionalData = {
        totalServices: services,
        completedBookings: bookings,
        reviewStats: reviews
      };
    }

    res.json({
      success: true,
      data: {
        user: user.getPublicProfile(),
        ...additionalData
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update current user's profile
// @access  Private
router.put('/profile', authenticateToken, validateUserUpdate, async (req, res) => {
  try {
    const allowedUpdates = [
      'name', 'phone', 'address', 'profileImage', 'bio', 
      'experience', 'availability'
    ];

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: user.getPublicProfile()
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/users/housewives
// @desc    Get list of housewives with their services
// @access  Public
router.get('/housewives', validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { city, category, rating, search } = req.query;

    // Build query
    let query = { 
      role: 'housewife', 
      isActive: true 
    };

    if (city) {
      query['address.city'] = new RegExp(city, 'i');
    }

    if (rating) {
      query['rating.average'] = { $gte: parseFloat(rating) };
    }

    if (search) {
      query.$text = { $search: search };
    }

    // Get housewives
    const housewives = await User.find(query)
      .select('-password')
      .sort({ 'rating.average': -1, completedServices: -1 })
      .skip(skip)
      .limit(limit);

    // Get their services if category filter is applied
    let housewivesWithServices = housewives;
    
    if (category) {
      housewivesWithServices = await Promise.all(
        housewives.map(async (housewife) => {
          const services = await Service.find({
            provider: housewife._id,
            category,
            isActive: true,
            isApproved: true
          }).limit(3);

          return {
            ...housewife.toObject(),
            services
          };
        })
      );

      // Filter out housewives with no services in the category
      housewivesWithServices = housewivesWithServices.filter(h => h.services.length > 0);
    }

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        housewives: housewivesWithServices,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get housewives error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get housewives',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/users/housewives/:id
// @desc    Get housewife profile with services and reviews
// @access  Public
router.get('/housewives/:id', validateObjectId('id'), async (req, res) => {
  try {
    const housewife = await User.findOne({
      _id: req.params.id,
      role: 'housewife',
      isActive: true
    }).select('-password');

    if (!housewife) {
      return res.status(404).json({
        success: false,
        message: 'Housewife not found'
      });
    }

    // Get services
    const services = await Service.find({
      provider: housewife._id,
      isActive: true,
      isApproved: true
    }).sort({ featured: -1, 'rating.average': -1 });

    // Get recent reviews
    const reviews = await Review.getRecentReviews(housewife._id, 5);

    // Get review statistics
    const reviewStats = await Review.getProviderAverageRating(housewife._id);

    res.json({
      success: true,
      data: {
        housewife: housewife.getPublicProfile(),
        services,
        reviews,
        reviewStats
      }
    });

  } catch (error) {
    console.error('Get housewife profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get housewife profile',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/users/dashboard
// @desc    Get user dashboard data
// @access  Private
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    let dashboardData = {};

    if (userRole === 'housewife') {
      // Housewife dashboard
      const [
        totalServices,
        activeServices,
        totalBookings,
        pendingBookings,
        completedBookings,
        totalEarnings,
        recentBookings,
        reviewStats
      ] = await Promise.all([
        Service.countDocuments({ provider: userId }),
        Service.countDocuments({ provider: userId, isActive: true }),
        Booking.countDocuments({ provider: userId }),
        Booking.countDocuments({ provider: userId, status: 'pending' }),
        Booking.countDocuments({ provider: userId, status: 'completed' }),
        Booking.aggregate([
          { $match: { provider: userId, status: 'completed' } },
          { $group: { _id: null, total: { $sum: '$pricing.agreedAmount' } } }
        ]),
        Booking.find({ provider: userId })
          .populate('customer', 'name phone')
          .populate('service', 'title')
          .sort({ createdAt: -1 })
          .limit(5),
        Review.getProviderAverageRating(userId).catch(() => ({ averageRating: 0, totalReviews: 0 }))
      ]);

      dashboardData = {
        stats: {
          totalServices,
          activeServices,
          totalBookings,
          pendingBookings,
          completedBookings,
          totalEarnings: totalEarnings[0]?.total || 0,
          averageRating: reviewStats.averageRating,
          totalReviews: reviewStats.totalReviews
        },
        recentBookings,
        reviewStats
      };

    } else if (userRole === 'customer') {
      // Customer dashboard
      const [
        totalBookings,
        upcomingBookings,
        completedBookings,
        recentBookings,
        favoriteServices
      ] = await Promise.all([
        Booking.countDocuments({ customer: userId }),
        Booking.countDocuments({ 
          customer: userId, 
          status: { $in: ['pending', 'confirmed'] },
          scheduledDate: { $gte: new Date() }
        }),
        Booking.countDocuments({ customer: userId, status: 'completed' }),
        Booking.find({ customer: userId })
          .populate('provider', 'name phone rating')
          .populate('service', 'title category')
          .sort({ createdAt: -1 })
          .limit(5),
        Service.find({ isActive: true, isApproved: true })
          .sort({ 'rating.average': -1 })
          .limit(6)
      ]);

      dashboardData = {
        stats: {
          totalBookings,
          upcomingBookings,
          completedBookings
        },
        recentBookings,
        favoriteServices
      };
    }

    res.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard data',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   POST /api/users/deactivate
// @desc    Deactivate user account
// @access  Private
router.post('/deactivate', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { isActive: false },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Account deactivated successfully'
    });

  } catch (error) {
    console.error('Deactivate account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deactivate account',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
