const { validationResult } = require('express-validator');
const User = require('../models/User');
const Service = require('../models/Service');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const { uploadToCloudinary, uploadProfileImage } = require('../middleware/upload');

// Get provider profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update provider profile
const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = req.user.id;
    const updateData = { ...req.body };

    // Handle profile image upload
    if (req.file) {
      try {
        const result = await uploadProfileImage(req.file.buffer);
        updateData.profileImage = result.secure_url;
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
        return res.status(400).json({ message: 'Failed to upload image' });
      }
    }

    // Parse JSON fields if they come as strings
    if (typeof updateData.address === 'string') {
      updateData.address = JSON.parse(updateData.address);
    }
    if (typeof updateData.workingHours === 'string') {
      updateData.workingHours = JSON.parse(updateData.workingHours);
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new service
const createService = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('Service creation validation errors:', errors.array());
      console.error('Request body:', req.body);

      // Format error messages for better user experience
      const errorMessages = errors.array().map(error => error.msg);
      const message = errorMessages.length === 1
        ? errorMessages[0]
        : `Please fix the following issues: ${errorMessages.join(', ')}`;

      return res.status(400).json({
        message,
        errors: errors.array()
      });
    }

    const serviceData = {
      ...req.body,
      provider: req.user.id
    };

    // Handle image uploads
    if (req.files && req.files.length > 0) {
      try {
        const imageUploads = await Promise.all(
          req.files.map(file => uploadToCloudinary(file.buffer, 'services'))
        );
        serviceData.images = imageUploads.map(result => ({
          url: result.secure_url,
          publicId: result.public_id
        }));
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
        return res.status(400).json({ message: 'Failed to upload images' });
      }
    }

    // JSON parsing is now done before validation

    const service = new Service(serviceData);
    await service.save();

    await service.populate('provider', 'name profileImage location rating');

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: { service }
    });
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get provider's services
const getMyServices = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, category } = req.query;
    const query = { provider: req.user.id };

    if (status) query.status = status;
    if (category) query.category = category;

    const services = await Service.find(query)
      .populate('provider', 'name profileImage location rating')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Service.countDocuments(query);

    res.json({
      success: true,
      data: {
        services,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update service
const updateService = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const serviceId = req.params.id;
    const updateData = { ...req.body };

    // Check if service belongs to the provider
    const service = await Service.findOne({ _id: serviceId, provider: req.user.id });
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Handle new image uploads
    if (req.files && req.files.length > 0) {
      try {
        // Delete old images
        if (service.images && service.images.length > 0) {
          await Promise.all(
            service.images.map(img => deleteFromCloudinary(img.publicId))
          );
        }

        // Upload new images
        const imageUploads = await Promise.all(
          req.files.map(file => uploadToCloudinary(file.buffer, 'services'))
        );
        updateData.images = imageUploads.map(result => ({
          url: result.secure_url,
          publicId: result.public_id
        }));
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
        return res.status(400).json({ message: 'Failed to upload images' });
      }
    }

    // JSON parsing is now done before validation

    const updatedService = await Service.findByIdAndUpdate(
      serviceId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('provider', 'name profileImage location rating');

    res.json({
      success: true,
      message: 'Service updated successfully',
      data: { service: updatedService }
    });
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete service
const deleteService = async (req, res) => {
  try {
    const serviceId = req.params.id;

    const service = await Service.findOne({ _id: serviceId, provider: req.user.id });
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Check if there are active bookings
    const activeBookings = await Booking.countDocuments({
      service: serviceId,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (activeBookings > 0) {
      return res.status(400).json({
        message: 'Cannot delete service with active bookings'
      });
    }

    // Delete images from cloudinary
    if (service.images && service.images.length > 0) {
      await Promise.all(
        service.images.map(img => deleteFromCloudinary(img.publicId))
      );
    }

    await Service.findByIdAndDelete(serviceId);

    res.json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get provider's bookings
const getMyBookings = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, date } = req.query;
    const query = { provider: req.user.id };

    if (status) query.status = status;
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.scheduledDate = { $gte: startDate, $lt: endDate };
    }

    const bookings = await Booking.find(query)
      .populate('customer', 'name email phone profileImage')
      .populate('service', 'title category pricing duration')
      .sort({ scheduledDate: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update booking status
const updateBookingStatus = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const bookingId = req.params.id;
    const { status, notes } = req.body;

    const booking = await Booking.findOne({ _id: bookingId, provider: req.user.id });
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Validate status transitions
    const validTransitions = {
      'pending': ['confirmed', 'declined'],
      'confirmed': ['completed', 'cancelled'],
      'declined': [],
      'completed': [],
      'cancelled': []
    };

    if (!validTransitions[booking.status].includes(status)) {
      return res.status(400).json({
        message: `Cannot change status from ${booking.status} to ${status}`
      });
    }

    booking.status = status;
    if (notes) booking.providerNotes = notes;
    if (status === 'completed') booking.completedAt = new Date();

    await booking.save();

    await booking.populate([
      { path: 'customer', select: 'name email phone profileImage' },
      { path: 'service', select: 'title category pricing duration' }
    ]);

    res.json({
      success: true,
      message: 'Booking status updated successfully',
      data: { booking }
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get provider dashboard data
const getDashboard = async (req, res) => {
  try {
    const providerId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's bookings
    const todaysBookings = await Booking.find({
      provider: providerId,
      scheduledDate: { $gte: today, $lt: tomorrow }
    })
    .populate('customer', 'name phone')
    .populate('service', 'title')
    .sort({ 'scheduledTime.start': 1 });

    // Get statistics
    const [
      totalServices,
      activeServices,
      totalBookings,
      completedServices,
      pendingBookings,
      reviews
    ] = await Promise.all([
      Service.countDocuments({ provider: providerId }),
      Service.countDocuments({ provider: providerId, status: 'active' }),
      Booking.countDocuments({ provider: providerId }),
      Booking.countDocuments({ provider: providerId, status: 'completed' }),
      Booking.countDocuments({ provider: providerId, status: 'pending' }),
      Review.find({ provider: providerId }).select('rating')
    ]);

    // Calculate average rating
    const averageRating = reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating.overall, 0) / reviews.length
      : 0;

    // Get recent bookings
    const recentBookings = await Booking.find({ provider: providerId })
      .populate('customer', 'name')
      .populate('service', 'title')
      .sort({ createdAt: -1 })
      .limit(5);

    // Provider rating is already calculated from reviews above

    res.json({
      success: true,
      data: {
        stats: {
          totalServices,
          activeServices,
          totalBookings,
          completedServices,
          pendingBookings,
          averageRating: Math.round(averageRating * 10) / 10,
          totalReviews: reviews.length
        },
        todaysBookings,
        recentBookings
      }
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Toggle availability
const toggleAvailability = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { isAvailable } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { isAvailable },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      message: `Availability ${isAvailable ? 'enabled' : 'disabled'} successfully`,
      data: { user }
    });
  } catch (error) {
    console.error('Toggle availability error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  createService,
  getMyServices,
  updateService,
  deleteService,
  getMyBookings,
  updateBookingStatus,
  getDashboard,
  toggleAvailability
};
