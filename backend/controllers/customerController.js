const User = require('../models/User');
const Service = require('../models/Service');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const { validationResult } = require('express-validator');

// @desc    Get customer dashboard data
// @route   GET /api/customer/dashboard
// @access  Private (Customer only)
const getDashboard = async (req, res) => {
  try {
    const customerId = req.user._id;

    // Get upcoming bookings
    const upcomingBookings = await Booking.find({
      customer: customerId,
      scheduledDate: { $gte: new Date() },
      status: { $in: ['pending', 'confirmed'] }
    })
    .populate('service', 'title category')
    .populate('provider', 'name profileImage')
    .sort({ scheduledDate: 1 })
    .limit(5);

    // Get recent bookings
    const recentBookings = await Booking.find({
      customer: customerId,
      status: { $in: ['completed', 'cancelled'] }
    })
    .populate('service', 'title category')
    .populate('provider', 'name profileImage')
    .sort({ createdAt: -1 })
    .limit(5);

    // Get booking stats
    const bookingStats = await Booking.aggregate([
      { $match: { customer: customerId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const stats = {
      total: 0,
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0
    };

    bookingStats.forEach(stat => {
      stats[stat._id] = stat.count;
      stats.total += stat.count;
    });

    // Get favorite services (most booked categories)
    const favoriteCategories = await Booking.aggregate([
      { $match: { customer: customerId } },
      {
        $lookup: {
          from: 'services',
          localField: 'service',
          foreignField: '_id',
          as: 'serviceData'
        }
      },
      { $unwind: '$serviceData' },
      {
        $group: {
          _id: '$serviceData.category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 3 }
    ]);

    // Get customer's average rating from reviews
    const Review = require('../models/Review');
    const customerReviews = await Review.find({ customer: customerId });
    const totalReviews = customerReviews.length;
    const averageRating = totalReviews > 0 ?
      customerReviews.reduce((sum, review) => sum + (review.rating?.overall || review.rating), 0) / totalReviews : 0;

    res.json({
      success: true,
      data: {
        upcomingBookings,
        recentBookings,
        stats,
        favoriteCategories,
        rating: {
          averageRating: Math.round(averageRating * 10) / 10,
          totalReviews: totalReviews
        }
      }
    });

  } catch (error) {
    console.error('Get customer dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard data',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get customer profile
// @route   GET /api/customer/profile
// @access  Private (Customer only)
const getProfile = async (req, res) => {
  try {
    const customer = await User.findById(req.user._id).select('-password');
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({
      success: true,
      data: {
        customer
      }
    });

  } catch (error) {
    console.error('Get customer profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Update customer profile
// @route   PUT /api/customer/profile
// @access  Private (Customer only)
const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const allowedUpdates = ['name', 'phone', 'address'];
    const updates = {};

    // Handle regular form data
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        if (key === 'address' && typeof req.body[key] === 'string') {
          // Parse JSON string for address
          try {
            updates[key] = JSON.parse(req.body[key]);
          } catch (e) {
            updates[key] = req.body[key];
          }
        } else {
          updates[key] = req.body[key];
        }
      }
    });

    // Handle profile image upload
    if (req.file) {
      const { uploadProfileImage } = require('../middleware/upload');
      try {
        const result = await uploadProfileImage(req.file.buffer);
        updates.profileImage = result.secure_url;
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
        return res.status(400).json({
          success: false,
          message: 'Failed to upload profile image'
        });
      }
    }

    const customer = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        customer
      }
    });

  } catch (error) {
    console.error('Update customer profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get customer bookings
// @route   GET /api/customer/bookings
// @access  Private (Customer only)
const getBookings = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status;

    let query = { customer: req.user._id };
    
    if (status && status !== 'all') {
      if (status === 'upcoming') {
        query.scheduledDate = { $gte: new Date() };
        query.status = { $in: ['pending', 'confirmed'] };
      } else if (status === 'past') {
        query.status = { $in: ['completed', 'cancelled', 'no_show'] };
      } else {
        query.status = status;
      }
    }

    const bookings = await Booking.find(query)
      .populate('service', 'title category images')
      .populate('provider', 'name profileImage phone address')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get customer bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get bookings',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get single booking by ID
// @route   GET /api/customer/bookings/:id
// @access  Private (Customer only)
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      customer: req.user._id
    })
    .populate('service', 'title description category images pricing duration requirements')
    .populate('provider', 'name phone profileImage address rating bio')
    .populate('customer', 'name phone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.json({
      success: true,
      data: {
        booking
      }
    });

  } catch (error) {
    console.error('Get booking by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get booking details',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Create a new booking
// @route   POST /api/customer/bookings
// @access  Private (Customer only)
const createBooking = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { serviceId, scheduledDate, scheduledTime, customerNotes, location } = req.body;

    // Check if service exists and is active
    const service = await Service.findOne({
      _id: serviceId,
      isActive: true,
      isApproved: true
    }).populate('provider', 'name phone');

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found or not available'
      });
    }

    // Check if customer is trying to book their own service
    if (service.provider._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot book your own service'
      });
    }

    // Generate booking ID
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    const bookingId = `BK${timestamp}${random}`.toUpperCase();

    // Create booking
    const bookingData = {
      bookingId,
      customer: req.user._id,
      provider: service.provider._id,
      service: serviceId,
      scheduledDate: new Date(scheduledDate),
      scheduledTime: {
        start: scheduledTime.start,
        end: scheduledTime.end
      },
      duration: {
        estimated: service.duration.estimated
      },
      pricing: {
        agreedAmount: service.pricing.amount || 0
      },
      customerNotes,
      location: location || {
        type: 'customer_address',
        address: req.user.address
      }
    };

    const booking = new Booking(bookingData);
    await booking.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate('service', 'title category')
      .populate('provider', 'name phone profileImage')
      .populate('customer', 'name phone');

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: {
        booking: populatedBooking
      }
    });

  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create booking',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Cancel a booking
// @route   PUT /api/customer/bookings/:id/cancel
// @access  Private (Customer only)
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if customer owns this booking
    if (booking.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only cancel your own bookings'
      });
    }

    // Check if booking can be cancelled
    if (!booking.canBeCancelled()) {
      return res.status(400).json({
        success: false,
        message: 'Booking cannot be cancelled. It must be at least 2 hours before the scheduled time'
      });
    }

    booking.status = 'cancelled';
    booking.cancellation = {
      cancelledBy: req.user._id,
      reason: req.body.reason || 'Cancelled by customer',
      cancelledAt: new Date()
    };

    await booking.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate('service', 'title category')
      .populate('provider', 'name phone');

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: {
        booking: populatedBooking
      }
    });

  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel booking',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get provider details
// @route   GET /api/customer/providers/:id
// @access  Private (Customer only)
const getProviderDetails = async (req, res) => {
  try {
    const provider = await User.findOne({
      _id: req.params.id,
      role: 'housewife',
      isActive: true
    }).select('-password');

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found'
      });
    }

    // Get provider's services
    const services = await Service.find({
      provider: req.params.id,
      isActive: true,
      isApproved: true
    }).sort({ featured: -1, 'rating.average': -1 });

    // Get provider's reviews
    const reviews = await Review.find({
      provider: req.params.id
    })
    .populate('customer', 'name profileImage')
    .sort({ createdAt: -1 })
    .limit(10);

    res.json({
      success: true,
      data: {
        provider,
        services,
        reviews
      }
    });

  } catch (error) {
    console.error('Get provider details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get provider details',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Create a review
// @route   POST /api/customer/reviews
// @access  Private (Customer only)
const createReview = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { bookingId, rating, comment, wouldRecommend, pros, cons } = req.body;

    // Check if booking exists and belongs to customer
    const booking = await Booking.findOne({
      _id: bookingId,
      customer: req.user._id,
      status: 'completed'
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or not completed'
      });
    }

    // Check if already reviewed
    const existingReview = await Review.findOne({
      booking: bookingId,
      customer: req.user._id
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this booking'
      });
    }

    // Create review
    const review = new Review({
      customer: req.user._id,
      provider: booking.provider,
      service: booking.service,
      booking: bookingId,
      rating,
      comment,
      wouldRecommend: wouldRecommend !== undefined ? wouldRecommend : true,
      pros: pros || [],
      cons: cons || []
    });

    await review.save();

    // Update service rating
    const Service = require('../models/Service');
    const service = await Service.findById(booking.service);
    if (service) {
      await service.updateRating(rating.overall);
    }

    // Update provider rating
    const User = require('../models/User');
    const provider = await User.findById(booking.provider);
    const allReviews = await Review.find({
      provider: booking.provider,
      isVisible: true
    });

    if (allReviews.length > 0) {
      const avgRating = allReviews.reduce((sum, r) => sum + r.rating.overall, 0) / allReviews.length;
      provider.rating.average = Math.round(avgRating * 10) / 10;
      provider.rating.count = allReviews.length;
      await provider.save();
    }

    // Mark booking as reviewed
    booking.isReviewed = true;
    await booking.save();

    const populatedReview = await Review.findById(review._id)
      .populate('customer', 'name profileImage')
      .populate('service', 'title category');

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: {
        review: populatedReview
      }
    });

  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create review',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get customer's reviews
// @route   GET /api/customer/reviews
// @access  Private (Customer only)
const getMyReviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ customer: req.user._id })
      .populate('provider', 'name profileImage')
      .populate('service', 'title category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments({ customer: req.user._id });

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get customer reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get reviews',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get pending reviews for completed bookings
// @route   GET /api/customer/reviews/pending
// @access  Private (Customer only)
const getPendingReviews = async (req, res) => {
  try {
    const customerId = req.user._id;
    const pendingReviews = await Review.getPendingReviews(customerId);

    res.json({
      success: true,
      data: {
        pendingReviews,
        count: pendingReviews.length
      }
    });

  } catch (error) {
    console.error('Get pending reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get pending reviews',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Update a review (within 24 hours)
// @route   PUT /api/customer/reviews/:id
// @access  Private (Customer only)
const updateReview = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const reviewId = req.params.id;
    const { rating, comment, wouldRecommend, pros, cons } = req.body;

    // Find the review
    const review = await Review.findOne({
      _id: reviewId,
      customer: req.user._id
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if review is still editable
    if (!review.isStillEditable()) {
      return res.status(400).json({
        success: false,
        message: 'Review is no longer editable (24-hour limit exceeded)'
      });
    }

    // Update review
    review.rating = rating;
    review.comment = comment;
    if (wouldRecommend !== undefined) review.wouldRecommend = wouldRecommend;
    if (pros) review.pros = pros;
    if (cons) review.cons = cons;

    await review.save();

    // Recalculate service rating
    const Service = require('../models/Service');
    const allServiceReviews = await Review.find({
      service: review.service,
      isVisible: true
    });

    if (allServiceReviews.length > 0) {
      const avgRating = allServiceReviews.reduce((sum, r) => sum + r.rating.overall, 0) / allServiceReviews.length;
      await Service.findByIdAndUpdate(review.service, {
        'rating.average': Math.round(avgRating * 10) / 10,
        'rating.count': allServiceReviews.length
      });
    }

    // Recalculate provider rating
    const User = require('../models/User');
    const allProviderReviews = await Review.find({
      provider: review.provider,
      isVisible: true
    });

    if (allProviderReviews.length > 0) {
      const avgRating = allProviderReviews.reduce((sum, r) => sum + r.rating.overall, 0) / allProviderReviews.length;
      await User.findByIdAndUpdate(review.provider, {
        'rating.average': Math.round(avgRating * 10) / 10,
        'rating.count': allProviderReviews.length
      });
    }

    const populatedReview = await Review.findById(review._id)
      .populate('provider', 'name profileImage')
      .populate('service', 'title category');

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: {
        review: populatedReview
      }
    });

  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update review',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  getDashboard,
  getProfile,
  updateProfile,
  getBookings,
  getBookingById,
  createBooking,
  cancelBooking,
  getProviderDetails,
  createReview,
  getMyReviews,
  getPendingReviews,
  updateReview
};
