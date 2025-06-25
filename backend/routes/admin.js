const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Service = require('../models/Service');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const { requireAdmin } = require('../middleware/adminAuth');

const router = express.Router();

// Admin login is now handled through the normal auth system

// @route   GET /api/admin/overview
// @desc    Get dashboard overview metrics
// @access  Admin only
router.get('/overview', requireAdmin, async (req, res) => {
  try {
    // Get metrics
    const totalCustomers = await User.countDocuments({ role: 'customer', isActive: true });
    const totalProviders = await User.countDocuments({ role: 'housewife', isActive: true, isApproved: true });
    const pendingProviders = await User.countDocuments({ role: 'housewife', isActive: true, isApproved: false });
    
    const totalBookings = await Booking.countDocuments();
    const todayBookings = await Booking.countDocuments({
      createdAt: { $gte: new Date().setHours(0, 0, 0, 0) }
    });

    // Calculate average provider rating
    const ratingStats = await User.aggregate([
      { $match: { role: 'housewife', isActive: true, 'rating.average': { $exists: true } } },
      { $group: { _id: null, avgRating: { $avg: '$rating.average' } } }
    ]);
    const averageProviderRating = ratingStats.length > 0 ? ratingStats[0].avgRating : 0;

    // Recent activity
    const recentBookings = await Booking.find()
      .populate('customer', 'name email')
      .populate('provider', 'name email')
      .populate('service', 'title')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentSignups = await User.find({ isActive: true })
      .select('name email role createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    const flaggedReviews = await Review.find({ isFlagged: true })
      .populate('customer', 'name')
      .populate('provider', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        metrics: {
          totalCustomers,
          totalProviders,
          pendingProviders,
          totalBookings,
          todayBookings,
          averageProviderRating: Math.round(averageProviderRating * 10) / 10
        },
        recentActivity: {
          bookings: recentBookings,
          signups: recentSignups,
          flaggedReviews
        }
      }
    });

  } catch (error) {
    console.error('Admin overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch overview data'
    });
  }
});

// @route   GET /api/admin/customers
// @desc    Get all customers with pagination
// @access  Admin only
router.get('/customers', requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', status = 'all' } = req.query;
    
    let query = { role: 'customer' };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status !== 'all') {
      query.isActive = status === 'active';
    }

    const customers = await User.find(query)
      .select('name email phone createdAt isActive address')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        customers,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customers'
    });
  }
});

// @route   PUT /api/admin/customers/:id/toggle
// @desc    Toggle customer active status
// @access  Admin only
router.put('/customers/:id/toggle', requireAdmin, async (req, res) => {
  try {
    const customer = await User.findById(req.params.id);
    
    if (!customer || customer.role !== 'customer') {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    customer.isActive = !customer.isActive;
    await customer.save();

    res.json({
      success: true,
      message: `Customer ${customer.isActive ? 'activated' : 'deactivated'} successfully`,
      data: { customer: { id: customer._id, isActive: customer.isActive } }
    });

  } catch (error) {
    console.error('Toggle customer status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update customer status'
    });
  }
});

// @route   GET /api/admin/providers/pending
// @desc    Get pending provider approvals
// @access  Admin only
router.get('/providers/pending', requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const pendingProviders = await User.find({ 
      role: 'housewife', 
      isActive: true, 
      isApproved: false 
    })
      .select('name email phone bio experience createdAt address')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments({ 
      role: 'housewife', 
      isActive: true, 
      isApproved: false 
    });

    res.json({
      success: true,
      data: {
        providers: pendingProviders,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get pending providers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending providers'
    });
  }
});

// @route   GET /api/admin/providers/approved
// @desc    Get approved providers
// @access  Admin only
router.get('/providers/approved', requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', status = 'all' } = req.query;

    let query = { role: 'housewife', isActive: true, isApproved: true };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status !== 'all') {
      query.isActive = status === 'active';
    }

    const providers = await User.find(query)
      .select('name email phone bio experience rating createdAt isActive address')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        providers,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get approved providers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch approved providers'
    });
  }
});

// @route   PUT /api/admin/providers/:id/approve
// @desc    Approve a pending provider
// @access  Admin only
router.put('/providers/:id/approve', requireAdmin, async (req, res) => {
  try {
    const provider = await User.findById(req.params.id);

    if (!provider || provider.role !== 'housewife') {
      return res.status(404).json({
        success: false,
        message: 'Provider not found'
      });
    }

    provider.isApproved = true;
    await provider.save();

    res.json({
      success: true,
      message: 'Provider approved successfully',
      data: { provider: { id: provider._id, isApproved: provider.isApproved } }
    });

  } catch (error) {
    console.error('Approve provider error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve provider'
    });
  }
});

// @route   PUT /api/admin/providers/:id/reject
// @desc    Reject a pending provider
// @access  Admin only
router.put('/providers/:id/reject', requireAdmin, async (req, res) => {
  try {
    const provider = await User.findById(req.params.id);

    if (!provider || provider.role !== 'housewife') {
      return res.status(404).json({
        success: false,
        message: 'Provider not found'
      });
    }

    // Mark as rejected (you could also delete the record)
    provider.isActive = false;
    provider.isApproved = false;
    await provider.save();

    res.json({
      success: true,
      message: 'Provider rejected successfully'
    });

  } catch (error) {
    console.error('Reject provider error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject provider'
    });
  }
});

// @route   PUT /api/admin/providers/:id/toggle
// @desc    Toggle provider active status
// @access  Admin only
router.put('/providers/:id/toggle', requireAdmin, async (req, res) => {
  try {
    const provider = await User.findById(req.params.id);

    if (!provider || provider.role !== 'housewife') {
      return res.status(404).json({
        success: false,
        message: 'Provider not found'
      });
    }

    provider.isActive = !provider.isActive;
    await provider.save();

    res.json({
      success: true,
      message: `Provider ${provider.isActive ? 'activated' : 'deactivated'} successfully`,
      data: { provider: { id: provider._id, isActive: provider.isActive } }
    });

  } catch (error) {
    console.error('Toggle provider status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update provider status'
    });
  }
});

// @route   GET /api/admin/bookings
// @desc    Get all bookings with filters
// @access  Admin only
router.get('/bookings', requireAdmin, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status = 'all',
      dateFrom,
      dateTo,
      customer,
      provider
    } = req.query;

    let query = {};

    if (status !== 'all') {
      query.status = status;
    }

    if (dateFrom || dateTo) {
      query.scheduledDate = {};
      if (dateFrom) query.scheduledDate.$gte = new Date(dateFrom);
      if (dateTo) query.scheduledDate.$lte = new Date(dateTo);
    }

    if (customer) {
      const customerUser = await User.findOne({
        $or: [
          { name: { $regex: customer, $options: 'i' } },
          { email: { $regex: customer, $options: 'i' } }
        ],
        role: 'customer'
      });
      if (customerUser) query.customer = customerUser._id;
    }

    if (provider) {
      const providerUser = await User.findOne({
        $or: [
          { name: { $regex: provider, $options: 'i' } },
          { email: { $regex: provider, $options: 'i' } }
        ],
        role: 'housewife'
      });
      if (providerUser) query.provider = providerUser._id;
    }

    const bookings = await Booking.find(query)
      .populate('customer', 'name email phone')
      .populate('provider', 'name email phone')
      .populate('service', 'title category pricing')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings'
    });
  }
});

// @route   PUT /api/admin/bookings/:id/status
// @desc    Force update booking status
// @access  Admin only
router.put('/bookings/:id/status', requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be: pending, confirmed, completed, or cancelled'
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    booking.status = status;
    await booking.save();

    res.json({
      success: true,
      message: `Booking status updated to ${status}`,
      data: { booking: { id: booking._id, status: booking.status } }
    });

  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update booking status'
    });
  }
});

// @route   GET /api/admin/reviews
// @desc    Get all reviews with filtering
// @access  Admin only
router.get('/reviews', requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, flagged = 'all' } = req.query;

    let query = {};

    if (flagged === 'true') {
      query.isReported = true;
    } else if (flagged === 'false') {
      query.isReported = { $ne: true };
    }

    const reviews = await Review.find(query)
      .populate('customer', 'name email')
      .populate('provider', 'name email')
      .populate('service', 'title')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments(query);

    // Get review statistics
    const stats = await Review.aggregate([
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          averageRating: { $avg: '$rating.overall' },
          flaggedCount: {
            $sum: { $cond: [{ $eq: ['$isReported', true] }, 1, 0] }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        },
        statistics: stats.length > 0 ? stats[0] : {
          totalReviews: 0,
          averageRating: 0,
          flaggedCount: 0
        }
      }
    });

  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews'
    });
  }
});

// @route   PUT /api/admin/reviews/:id/flag
// @desc    Flag or unflag a review
// @access  Admin only
router.put('/reviews/:id/flag', requireAdmin, async (req, res) => {
  try {
    const { flagged } = req.body;

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    review.isReported = flagged;
    review.isVisible = !flagged; // Hide flagged reviews
    await review.save();

    res.json({
      success: true,
      message: `Review ${flagged ? 'flagged' : 'unflagged'} successfully`,
      data: { review: { id: review._id, isReported: review.isReported } }
    });

  } catch (error) {
    console.error('Flag review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update review flag status'
    });
  }
});

// @route   DELETE /api/admin/reviews/:id
// @desc    Delete a review
// @access  Admin only
router.delete('/reviews/:id', requireAdmin, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    await Review.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });

  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete review'
    });
  }
});

// @route   POST /api/admin/settings/password
// @desc    Change admin password (demo - not persisted)
// @access  Admin only
router.post('/settings/password', requireAdmin, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (currentPassword !== ADMIN_CREDENTIALS.password) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long'
      });
    }

    // In demo mode, we don't actually change the password
    res.json({
      success: true,
      message: 'Password change validated (not persisted in demo mode)'
    });

  } catch (error) {
    console.error('Change admin password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change admin password'
    });
  }
});

// @route   POST /api/admin/logout
// @desc    Admin logout (client-side token removal)
// @access  Admin only
router.post('/logout', requireAdmin, (req, res) => {
  res.json({
    success: true,
    message: 'Admin logged out successfully'
  });
});

// @route   POST /api/admin/recalculate-ratings
// @desc    Recalculate all service and provider ratings
// @access  Private (Admin only)
router.post('/recalculate-ratings', async (req, res) => {
  try {
    const Service = require('../models/Service');
    const Review = require('../models/Review');
    const User = require('../models/User');

    let servicesUpdated = 0;
    let providersUpdated = 0;

    // Recalculate service ratings
    const services = await Service.find({});
    for (const service of services) {
      const reviews = await Review.find({
        service: service._id,
        isVisible: true
      });

      if (reviews.length > 0) {
        const avgRating = reviews.reduce((sum, r) => sum + r.rating.overall, 0) / reviews.length;
        service.rating.average = Math.round(avgRating * 10) / 10;
        service.rating.count = reviews.length;
      } else {
        service.rating.average = 0;
        service.rating.count = 0;
      }

      await service.save();
      servicesUpdated++;
    }

    // Recalculate provider ratings
    const providers = await User.find({ role: 'housewife' });
    for (const provider of providers) {
      const reviews = await Review.find({
        provider: provider._id,
        isVisible: true
      });

      if (reviews.length > 0) {
        const avgRating = reviews.reduce((sum, r) => sum + r.rating.overall, 0) / reviews.length;
        provider.rating.average = Math.round(avgRating * 10) / 10;
        provider.rating.count = reviews.length;
      } else {
        provider.rating.average = 0;
        provider.rating.count = 0;
      }

      await provider.save();
      providersUpdated++;
    }

    res.json({
      success: true,
      message: 'Ratings recalculated successfully',
      data: {
        servicesUpdated,
        providersUpdated
      }
    });

  } catch (error) {
    console.error('Recalculate ratings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to recalculate ratings',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
