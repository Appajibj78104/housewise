const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    unique: true,
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  scheduledDate: {
    type: Date,
    required: [true, 'Scheduled date is required']
  },
  scheduledTime: {
    start: {
      type: String,
      required: [true, 'Start time is required']
    },
    end: String
  },
  duration: {
    estimated: Number, // in minutes
    actual: Number
  },
  location: {
    type: {
      type: String,
      enum: ['customer_address', 'provider_address', 'custom'],
      default: 'customer_address'
    },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    },
    instructions: String
  },
  pricing: {
    agreedAmount: {
      type: Number,
      required: true,
      min: [0, 'Amount cannot be negative']
    },
    currency: {
      type: String,
      default: 'INR'
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'online', 'bank_transfer'],
      default: 'cash'
    }
  },
  status: {
    type: String,
    enum: [
      'pending',      // Waiting for provider confirmation
      'confirmed',    // Provider confirmed
      'in_progress',  // Service is being performed
      'completed',    // Service completed
      'cancelled',    // Cancelled by customer or provider
      'no_show'       // Customer or provider didn't show up
    ],
    default: 'pending'
  },
  customerNotes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  },
  providerNotes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  },
  cancellation: {
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String,
    cancelledAt: Date
  },
  completion: {
    completedAt: Date,
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    customerSatisfaction: {
      type: String,
      enum: ['very_satisfied', 'satisfied', 'neutral', 'dissatisfied', 'very_dissatisfied']
    }
  },
  communication: [{
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    type: {
      type: String,
      enum: ['message', 'status_update', 'system'],
      default: 'message'
    }
  }],
  reminders: {
    customerReminded: {
      type: Boolean,
      default: false
    },
    providerReminded: {
      type: Boolean,
      default: false
    },
    reminderSentAt: Date
  },
  isReviewed: {
    type: Boolean,
    default: false
  },
  feedback: {
    customerFeedbackGiven: {
      type: Boolean,
      default: false
    },
    providerFeedbackGiven: {
      type: Boolean,
      default: false
    },
    customerFeedbackId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review'
    },
    providerFeedbackId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review'
    }
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
bookingSchema.index({ customer: 1, createdAt: -1 });
bookingSchema.index({ provider: 1, createdAt: -1 });
bookingSchema.index({ service: 1 });
bookingSchema.index({ status: 1, scheduledDate: 1 });
bookingSchema.index({ scheduledDate: 1 });

// Pre-save middleware to generate booking ID
bookingSchema.pre('save', async function(next) {
  if (!this.bookingId) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.bookingId = `BK${timestamp}${random}`.toUpperCase();
  }
  next();
});

// Virtual for formatted scheduled date and time
bookingSchema.virtual('formattedSchedule').get(function() {
  const date = this.scheduledDate.toLocaleDateString('en-IN');
  const time = this.scheduledTime.start;
  return `${date} at ${time}`;
});

// Virtual for booking duration in hours
bookingSchema.virtual('durationInHours').get(function() {
  if (!this.duration.estimated) return null;
  return (this.duration.estimated / 60).toFixed(1);
});

// Method to check if booking can be cancelled
bookingSchema.methods.canBeCancelled = function() {
  const now = new Date();
  const scheduledDateTime = new Date(this.scheduledDate);
  const timeDiff = scheduledDateTime - now;
  const hoursDiff = timeDiff / (1000 * 60 * 60);
  
  return ['pending', 'confirmed'].includes(this.status) && hoursDiff > 2;
};

// Method to check if booking can be modified
bookingSchema.methods.canBeModified = function() {
  const now = new Date();
  const scheduledDateTime = new Date(this.scheduledDate);
  const timeDiff = scheduledDateTime - now;
  const hoursDiff = timeDiff / (1000 * 60 * 60);
  
  return this.status === 'pending' && hoursDiff > 24;
};

// Static method to get upcoming bookings
bookingSchema.statics.getUpcoming = function(userId, role = 'customer') {
  const query = {
    [role === 'customer' ? 'customer' : 'provider']: userId,
    scheduledDate: { $gte: new Date() },
    status: { $in: ['pending', 'confirmed'] }
  };
  
  return this.find(query)
    .populate('customer', 'name phone')
    .populate('provider', 'name phone')
    .populate('service', 'title category')
    .sort({ scheduledDate: 1 });
};

// Static method to get booking history
bookingSchema.statics.getHistory = function(userId, role = 'customer') {
  const query = {
    [role === 'customer' ? 'customer' : 'provider']: userId,
    status: { $in: ['completed', 'cancelled', 'no_show'] }
  };
  
  return this.find(query)
    .populate('customer', 'name phone')
    .populate('provider', 'name phone')
    .populate('service', 'title category')
    .sort({ createdAt: -1 });
};

// Ensure virtual fields are serialized
bookingSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Booking', bookingSchema);
