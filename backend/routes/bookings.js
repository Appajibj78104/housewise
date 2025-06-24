const express = require('express');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const User = require('../models/User');
const { authenticateToken, requireCustomer } = require('../middleware/auth');
const { validateBookingCreation, validateObjectId, validatePagination } = require('../middleware/validation');

const router = express.Router();

// @route   POST /api/bookings
// @desc    Create a new booking
// @access  Private (Customer only)
router.post('/', authenticateToken, requireCustomer, validateBookingCreation, async (req, res) => {
  try {
    const { service: serviceId, scheduledDate, scheduledTime, location, pricing, customerNotes } = req.body;

    // Get service details
    const service = await Service.findOne({
      _id: serviceId,
      isActive: true,
      isApproved: true
    }).populate('provider', 'name phone availability');

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

    // Validate scheduled date and time
    const bookingDateTime = new Date(`${scheduledDate}T${scheduledTime.start}`);
    const now = new Date();
    
    if (bookingDateTime <= now) {
      return res.status(400).json({
        success: false,
        message: 'Booking time must be in the future'
      });
    }

    // Check for conflicting bookings
    const conflictingBooking = await Booking.findOne({
      provider: service.provider._id,
      scheduledDate: new Date(scheduledDate),
      'scheduledTime.start': scheduledTime.start,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (conflictingBooking) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked'
      });
    }

    // Create booking
    const bookingData = {
      customer: req.user._id,
      provider: service.provider._id,
      service: serviceId,
      scheduledDate: new Date(scheduledDate),
      scheduledTime,
      location: location || {
        type: 'customer_address',
        address: req.user.address
      },
      pricing,
      customerNotes,
      duration: {
        estimated: service.duration.estimated
      }
    };

    const booking = new Booking(bookingData);
    await booking.save();

    // Populate the booking with related data
    const populatedBooking = await Booking.findById(booking._id)
      .populate('customer', 'name phone address')
      .populate('provider', 'name phone address')
      .populate('service', 'title category pricing');

    // Update service booking count
    await Service.findByIdAndUpdate(serviceId, {
      $inc: { totalBookings: 1 }
    });

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
});

// @route   GET /api/bookings
// @desc    Get user's bookings
// @access  Private
router.get('/', authenticateToken, validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { status, type } = req.query;

    // Build query based on user role
    let query = {};
    if (req.user.role === 'customer') {
      query.customer = req.user._id;
    } else if (req.user.role === 'housewife') {
      query.provider = req.user._id;
    } else {
      // Admin can see all bookings
      query = {};
    }

    if (status) {
      query.status = status;
    }

    if (type === 'upcoming') {
      query.scheduledDate = { $gte: new Date() };
      query.status = { $in: ['pending', 'confirmed'] };
    } else if (type === 'past') {
      query.status = { $in: ['completed', 'cancelled', 'no_show'] };
    }

    const bookings = await Booking.find(query)
      .populate('customer', 'name phone profileImage')
      .populate('provider', 'name phone profileImage rating')
      .populate('service', 'title category pricing')
      .sort({ scheduledDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Add feedback-based ratings to customers and providers
    const Feedback = require('../models/Feedback');
    for (let booking of bookings) {
      if (booking.customer) {
        const customerRating = await Feedback.getUserAverageRating(
          booking.customer._id,
          'provider_to_customer'
        );
        booking.customer.feedbackRating = {
          averageRating: customerRating.averageRating,
          totalFeedbacks: customerRating.totalFeedbacks
        };
      }
      if (booking.provider) {
        const providerRating = await Feedback.getUserAverageRating(
          booking.provider._id,
          'customer_to_provider'
        );
        booking.provider.feedbackRating = {
          averageRating: providerRating.averageRating,
          totalFeedbacks: providerRating.totalFeedbacks
        };
      }
    }

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
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get bookings',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/bookings/:id
// @desc    Get single booking
// @access  Private
router.get('/:id', authenticateToken, validateObjectId('id'), async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('customer', 'name phone profileImage address')
      .populate('provider', 'name phone profileImage address rating')
      .populate('service', 'title category description pricing');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check access permissions
    const isCustomer = booking.customer._id.toString() === req.user._id.toString();
    const isProvider = booking.provider._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCustomer && !isProvider && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: {
        booking
      }
    });

  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get booking',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   PUT /api/bookings/:id/status
// @desc    Update booking status
// @access  Private
router.put('/:id/status', authenticateToken, validateObjectId('id'), async (req, res) => {
  try {
    const { status, notes } = req.body;
    
    const validStatuses = ['confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check permissions
    const isCustomer = booking.customer.toString() === req.user._id.toString();
    const isProvider = booking.provider.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCustomer && !isProvider && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Validate status transitions
    const currentStatus = booking.status;
    let isValidTransition = false;

    if (isProvider) {
      // Provider can confirm, start, complete, or cancel
      isValidTransition = (
        (currentStatus === 'pending' && ['confirmed', 'cancelled'].includes(status)) ||
        (currentStatus === 'confirmed' && ['in_progress', 'cancelled', 'no_show'].includes(status)) ||
        (currentStatus === 'in_progress' && ['completed'].includes(status))
      );
    } else if (isCustomer) {
      // Customer can only cancel pending bookings
      isValidTransition = (currentStatus === 'pending' && status === 'cancelled');
    } else if (isAdmin) {
      // Admin can change to any status
      isValidTransition = true;
    }

    if (!isValidTransition) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status transition'
      });
    }

    // Update booking
    const updates = { status };

    if (status === 'cancelled') {
      updates.cancellation = {
        cancelledBy: req.user._id,
        reason: notes,
        cancelledAt: new Date()
      };
    } else if (status === 'completed') {
      updates.completion = {
        completedAt: new Date(),
        completedBy: req.user._id
      };
      
      // Update provider's completed services count
      await User.findByIdAndUpdate(booking.provider, {
        $inc: { completedServices: 1 }
      });
    }

    if (notes) {
      if (isProvider) {
        updates.providerNotes = notes;
      } else if (isCustomer) {
        updates.customerNotes = notes;
      }
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    )
    .populate('customer', 'name phone')
    .populate('provider', 'name phone')
    .populate('service', 'title category');

    res.json({
      success: true,
      message: 'Booking status updated successfully',
      data: {
        booking: updatedBooking
      }
    });

  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update booking status',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
