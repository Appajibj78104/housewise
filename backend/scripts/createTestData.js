const mongoose = require('mongoose');
const User = require('../models/User');
const Service = require('../models/Service');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
require('dotenv').config();

async function createTestData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/housewife-services');
    console.log('Connected to MongoDB');

    // Get the existing users
    const shreyasProvider = await User.findOne({ email: 'shreyas@gmail.com' });
    const bhargavCustomer = await User.findOne({ email: 'bhargav@gmail.com' });

    if (!shreyasProvider || !bhargavCustomer) {
      console.log('❌ Required users not found. Please run fixAdminData.js first.');
      return;
    }

    console.log('✅ Found required users');

    // 1. Create a simple service
    console.log('\n1. Creating sample service...');
    let sampleService = await Service.findOne({ 
      title: 'Complete House Cleaning',
      provider: shreyasProvider._id 
    });
    
    if (!sampleService) {
      sampleService = new Service({
        title: 'Complete House Cleaning',
        description: 'Professional deep cleaning service for your entire house',
        category: 'cleaning',
        subcategory: 'deep cleaning',
        provider: shreyasProvider._id,
        pricing: {
          type: 'fixed',
          amount: 500,
          currency: 'INR'
        },
        duration: {
          estimated: 180, // 3 hours
          unit: 'minutes'
        },
        location: {
          type: 'customer_place',
          serviceArea: {
            radius: 10,
            coordinates: {
              latitude: 12.9716,
              longitude: 77.5946
            }
          }
        },
        availability: {
          days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
          timeSlots: [
            { start: '09:00', end: '12:00' },
            { start: '14:00', end: '17:00' }
          ],
          isAvailable: true
        },
        tags: ['cleaning', 'house', 'professional', 'deep-clean'],
        isActive: true,
        isApproved: true,
        rating: {
          average: 4.8,
          count: 15
        }
      });
      await sampleService.save();
      console.log('✅ Created sample service');
    } else {
      console.log('✅ Sample service already exists');
    }

    // 2. Create multiple bookings with different statuses
    console.log('\n2. Creating sample bookings...');
    
    const bookingsToCreate = [
      {
        status: 'completed',
        scheduledDate: new Date('2024-12-15'),
        notes: 'Complete house cleaning service - excellent work!'
      },
      {
        status: 'pending',
        scheduledDate: new Date('2024-12-25'),
        notes: 'Holiday cleaning service'
      },
      {
        status: 'confirmed',
        scheduledDate: new Date('2024-12-20'),
        notes: 'Regular weekly cleaning'
      },
      {
        status: 'cancelled',
        scheduledDate: new Date('2024-12-10'),
        notes: 'Customer cancelled due to emergency'
      }
    ];

    for (const bookingData of bookingsToCreate) {
      const existingBooking = await Booking.findOne({
        customer: bhargavCustomer._id,
        provider: shreyasProvider._id,
        status: bookingData.status
      });

      if (!existingBooking) {
        // Generate unique booking ID
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 5);
        const bookingId = `BK${timestamp}${random}`.toUpperCase();

        const newBooking = new Booking({
          bookingId: bookingId,
          customer: bhargavCustomer._id,
          provider: shreyasProvider._id,
          service: sampleService._id,
          scheduledDate: bookingData.scheduledDate,
          scheduledTime: {
            start: '10:00',
            end: '13:00'
          },
          duration: {
            estimated: 180
          },
          status: bookingData.status,
          pricing: {
            agreedAmount: 500,
            currency: 'INR',
            paymentMethod: 'cash'
          },
          location: {
            type: 'customer_address',
            address: {
              street: '456 Customer Lane',
              city: 'Bangalore',
              state: 'Karnataka',
              pincode: '560002'
            }
          },
          customerNotes: bookingData.notes
        });
        await newBooking.save();
        console.log(`✅ Created ${bookingData.status} booking`);
      } else {
        console.log(`✅ ${bookingData.status} booking already exists`);
      }
    }

    // 3. Create reviews
    console.log('\n3. Creating sample reviews...');
    
    const reviewsToCreate = [
      {
        rating: {
          overall: 5,
          quality: 5,
          punctuality: 5,
          communication: 5,
          value: 5
        },
        comment: 'Excellent service! Shreyas did a fantastic job cleaning our house. Very professional and thorough. Highly recommended!',
        isFlagged: false
      },
      {
        rating: {
          overall: 4,
          quality: 4,
          punctuality: 3,
          communication: 4,
          value: 4
        },
        comment: 'Good service overall. House was clean but took a bit longer than expected.',
        isFlagged: false
      },
      {
        rating: {
          overall: 1,
          quality: 1,
          punctuality: 1,
          communication: 1,
          value: 1
        },
        comment: 'This is a test flagged review with inappropriate content for testing admin moderation.',
        isFlagged: true
      }
    ];

    // Get all bookings for creating reviews
    const allBookings = await Booking.find({
      customer: bhargavCustomer._id,
      provider: shreyasProvider._id
    });

    for (let i = 0; i < reviewsToCreate.length && i < allBookings.length; i++) {
      const reviewData = reviewsToCreate[i];
      const booking = allBookings[i];

      const existingReview = await Review.findOne({
        booking: booking._id
      });

      if (!existingReview) {
        const newReview = new Review({
          customer: bhargavCustomer._id,
          provider: shreyasProvider._id,
          service: sampleService._id,
          booking: booking._id,
          rating: reviewData.rating,
          comment: reviewData.comment,
          isReported: reviewData.isFlagged,
          isVisible: !reviewData.isFlagged
        });
        await newReview.save();
        console.log(`✅ Created review with rating ${reviewData.rating.overall} for booking ${booking.status}`);
      } else {
        console.log(`✅ Review for booking ${booking.status} already exists`);
      }
    }

    // 4. Update provider rating based on reviews
    console.log('\n4. Updating provider rating...');
    const allReviews = await Review.find({ provider: shreyasProvider._id, isVisible: true });
    if (allReviews.length > 0) {
      const avgRating = allReviews.reduce((sum, review) => sum + review.rating.overall, 0) / allReviews.length;
      shreyasProvider.rating = {
        average: Math.round(avgRating * 10) / 10,
        count: allReviews.length
      };
      await shreyasProvider.save();
      console.log(`✅ Updated provider rating: ${shreyasProvider.rating.average} (${shreyasProvider.rating.count} reviews)`);
    }

    // 5. Create additional customers for testing
    console.log('\n5. Creating additional test customers...');
    const additionalCustomers = [
      {
        name: 'Rajesh Kumar',
        email: 'rajesh@example.com',
        phone: '9876543212'
      },
      {
        name: 'Anita Singh',
        email: 'anita@example.com',
        phone: '9876543213'
      }
    ];

    for (const customerData of additionalCustomers) {
      const existingCustomer = await User.findOne({ email: customerData.email });
      if (!existingCustomer) {
        const newCustomer = new User({
          name: customerData.name,
          email: customerData.email,
          password: 'password123',
          role: 'customer',
          phone: customerData.phone,
          isActive: true,
          isApproved: true,
          isVerified: true,
          address: {
            street: '789 Test Street',
            city: 'Bangalore',
            state: 'Karnataka',
            pincode: '560003',
            country: 'India'
          }
        });
        await newCustomer.save();
        console.log(`✅ Created customer: ${customerData.name}`);
      } else {
        console.log(`✅ Customer ${customerData.name} already exists`);
      }
    }

    // 6. Summary
    console.log('\n📊 FINAL SUMMARY:');
    const totalCustomers = await User.countDocuments({ role: 'customer', isActive: true });
    const totalProviders = await User.countDocuments({ role: 'housewife', isActive: true, isApproved: true });
    const totalBookings = await Booking.countDocuments();
    const totalReviews = await Review.countDocuments();
    const flaggedReviews = await Review.countDocuments({ isFlagged: true });
    
    console.log(`✅ Total Customers: ${totalCustomers}`);
    console.log(`✅ Total Approved Providers: ${totalProviders}`);
    console.log(`✅ Total Bookings: ${totalBookings}`);
    console.log(`✅ Total Reviews: ${totalReviews}`);
    console.log(`✅ Flagged Reviews: ${flaggedReviews}`);

    console.log('\n🎉 Test data creation completed successfully!');
    console.log('\n🔗 Admin can now login at: http://localhost:5173/login');
    console.log('📧 Admin credentials: admin@example.com / ChangeMe123!');
    
  } catch (error) {
    console.error('❌ Error creating test data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
createTestData();
