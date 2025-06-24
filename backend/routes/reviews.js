const express = require('express');
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const User = require('../models/User');
const { authenticateToken, requireCustomer } = require('../middleware/auth');
const { validateReviewCreation, validateObjectId, validatePagination } = require('../middleware/validation');

const router = express.Router();

// @route   POST /api/reviews
// @desc    Create a new review
// @access  Private (Customer only)
router.post('/', authenticateToken, requireCustomer, validateReviewCreation, async (req, res) => {
  try {
    const { booking: bookingId, rating, comment, pros, cons, wouldRecommend, isAnonymous } = req.body;

    // Get booking details
    const booking = await Booking.findById(bookingId)
      .populate('service')
      .populate('provider');

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
        message: 'You can only review your own bookings'
      });
    }

    // Check if booking is completed
    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'You can only review completed bookings'
      });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ booking: bookingId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'Review already exists for this booking'
      });
    }

    // Create review
    const reviewData = {
      booking: bookingId,
      customer: req.user._id,
      provider: booking.provider._id,
      service: booking.service._id,
      rating,
      comment,
      pros: pros || [],
      cons: cons || [],
      wouldRecommend: wouldRecommend !== undefined ? wouldRecommend : true,
      isAnonymous: isAnonymous || false
    };

    const review = new Review(reviewData);
    await review.save();

    // Update service rating
    await booking.service.updateRating(rating.overall);

    // Update provider rating
    const provider = await User.findById(booking.provider._id);
    const allReviews = await Review.find({ 
      provider: booking.provider._id, 
      isVisible: true 
    });
    
    if (allReviews.length > 0) {
      const avgRating = allReviews.reduce((sum, r) => sum + r.rating.overall, 0) / allReviews.length;
      provider.rating.average = Math.round(avgRating * 10) / 10;
      provider.rating.count = allReviews.length;
      await provider.save();
    }

    // Mark booking as reviewed
    await Booking.findByIdAndUpdate(bookingId, { isReviewed: true });

    // Populate the review
    const populatedReview = await Review.findById(review._id)
      .populate('customer', 'name profileImage')
      .populate('service', 'title category')
      .populate('provider', 'name');

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
});

// @route   GET /api/reviews/service/:serviceId
// @desc    Get reviews for a service
// @access  Public
router.get('/service/:serviceId', validateObjectId('serviceId'), validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { rating, sortBy } = req.query;

    let query = {
      service: req.params.serviceId,
      isVisible: true
    };

    if (rating) {
      query['rating.overall'] = parseInt(rating);
    }

    let sort = {};
    switch (sortBy) {
      case 'newest':
        sort = { createdAt: -1 };
        break;
      case 'oldest':
        sort = { createdAt: 1 };
        break;
      case 'rating_high':
        sort = { 'rating.overall': -1 };
        break;
      case 'rating_low':
        sort = { 'rating.overall': 1 };
        break;
      case 'helpful':
        sort = { 'helpfulVotes.count': -1 };
        break;
      default:
        sort = { createdAt: -1 };
    }

    const reviews = await Review.find(query)
      .populate('customer', 'name profileImage')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments(query);

    // Get rating distribution
    const ratingDistribution = await Review.aggregate([
      { $match: { service: req.params.serviceId, isVisible: true } },
      {
        $group: {
          _id: '$rating.overall',
          count: { $sum: 1 }
        }
      }
    ]);

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratingDistribution.forEach(item => {
      distribution[item._id] = item.count;
    });

    res.json({
      success: true,
      data: {
        reviews,
        ratingDistribution: distribution,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get service reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get service reviews',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/reviews/provider/:providerId
// @desc    Get reviews for a provider
// @access  Public
router.get('/provider/:providerId', validateObjectId('providerId'), validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({
      provider: req.params.providerId,
      isVisible: true
    })
    .populate('customer', 'name profileImage')
    .populate('service', 'title category')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    const total = await Review.countDocuments({
      provider: req.params.providerId,
      isVisible: true
    });

    // Get provider rating stats
    const ratingStats = await Review.getProviderAverageRating(req.params.providerId);

    res.json({
      success: true,
      data: {
        reviews,
        ratingStats,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get provider reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get provider reviews',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   POST /api/reviews/:id/helpful
// @desc    Mark review as helpful
// @access  Private
router.post('/:id/helpful', authenticateToken, validateObjectId('id'), async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    await review.markAsHelpful(req.user._id);

    res.json({
      success: true,
      message: 'Review marked as helpful',
      data: {
        helpfulCount: review.helpfulVotes.count
      }
    });

  } catch (error) {
    console.error('Mark review helpful error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark review as helpful',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   DELETE /api/reviews/:id/helpful
// @desc    Remove helpful vote from review
// @access  Private
router.delete('/:id/helpful', authenticateToken, validateObjectId('id'), async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    await review.removeHelpfulVote(req.user._id);

    res.json({
      success: true,
      message: 'Helpful vote removed',
      data: {
        helpfulCount: review.helpfulVotes.count
      }
    });

  } catch (error) {
    console.error('Remove helpful vote error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove helpful vote',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   POST /api/reviews/:id/response
// @desc    Add provider response to review
// @access  Private (Provider only)
router.post('/:id/response', authenticateToken, validateObjectId('id'), async (req, res) => {
  try {
    const { message, isPublic = true } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Response message is required'
      });
    }

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user is the provider for this review
    if (review.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only respond to reviews for your services'
      });
    }

    await review.addProviderResponse(message.trim(), isPublic);

    res.json({
      success: true,
      message: 'Response added successfully',
      data: {
        response: review.providerResponse
      }
    });

  } catch (error) {
    console.error('Add provider response error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add response',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
