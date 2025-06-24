const mongoose = require('mongoose');
const User = require('../models/User');
const Service = require('../models/Service');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const Category = require('../models/Category');
require('dotenv').config();

async function fixAdminData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/housewife-services');
    console.log('Connected to MongoDB');

    // 1. Fix existing providers - add isApproved field
    console.log('\n1. Fixing existing providers...');
    const providersToFix = await User.find({ 
      role: 'housewife',
      isApproved: { $exists: false }
    });
    
    for (const provider of providersToFix) {
      provider.isApproved = true; // Approve existing providers
      await provider.save();
      console.log(`✅ Fixed provider: ${provider.name} (${provider.email})`);
    }

    // 2. Ensure shreyas@gmail.com exists and is approved
    console.log('\n2. Ensuring shreyas@gmail.com provider exists...');
    let shreyasProvider = await User.findOne({ email: 'shreyas@gmail.com' });
    
    if (!shreyasProvider) {
      shreyasProvider = new User({
        name: 'Shreyas Kumar',
        email: 'shreyas@gmail.com',
        password: 'password123',
        role: 'housewife',
        phone: '+91-9876543210',
        isActive: true,
        isApproved: true,
        isVerified: true,
        bio: 'Professional house cleaning service provider with 5+ years experience',
        experience: '5+ years',
        address: {
          street: '123 Service Street',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560001',
          country: 'India'
        },
        location: {
          type: 'Point',
          coordinates: [77.5946, 12.9716] // Bangalore coordinates
        },
        rating: {
          average: 4.8,
          count: 15
        }
      });
      await shreyasProvider.save();
      console.log('✅ Created shreyas@gmail.com provider');
    } else {
      shreyasProvider.isApproved = true;
      shreyasProvider.isActive = true;
      await shreyasProvider.save();
      console.log('✅ Updated shreyas@gmail.com provider');
    }

    // 3. Ensure bhargav@gmail.com customer exists
    console.log('\n3. Ensuring bhargav@gmail.com customer exists...');
    let bhargavCustomer = await User.findOne({ email: 'bhargav@gmail.com' });
    
    if (!bhargavCustomer) {
      bhargavCustomer = new User({
        name: 'Bhargav Patel',
        email: 'bhargav@gmail.com',
        password: 'password123',
        role: 'customer',
        phone: '+91-9876543211',
        isActive: true,
        isApproved: true,
        isVerified: true,
        address: {
          street: '456 Customer Lane',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560002',
          country: 'India'
        }
      });
      await bhargavCustomer.save();
      console.log('✅ Created bhargav@gmail.com customer');
    } else {
      bhargavCustomer.isActive = true;
      await bhargavCustomer.save();
      console.log('✅ Updated bhargav@gmail.com customer');
    }

    // 4. Create a service if it doesn't exist
    console.log('\n4. Creating sample service...');
    let sampleService = await Service.findOne({ title: 'Complete House Cleaning' });
    
    if (!sampleService) {
      // First ensure category exists
      let cleaningCategory = await Category.findOne({ name: 'Cleaning' });
      if (!cleaningCategory) {
        cleaningCategory = new Category({
          name: 'Cleaning',
          description: 'Professional cleaning services',
          icon: 'cleaning-icon'
        });
        await cleaningCategory.save();
      }

      sampleService = new Service({
        title: 'Complete House Cleaning',
        description: 'Professional deep cleaning service for your entire house',
        category: cleaningCategory._id,
        provider: shreyasProvider._id,
        pricing: {
          basePrice: 500,
          currency: 'INR',
          priceType: 'fixed'
        },
        duration: 180, // 3 hours
        availability: {
          days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
          timeSlots: ['09:00-12:00', '14:00-17:00']
        },
        location: {
          type: 'Point',
          coordinates: [77.5946, 12.9716]
        },
        isActive: true
      });
      await sampleService.save();
      console.log('✅ Created sample service');
    }

    // 5. Create a completed booking
    console.log('\n5. Creating sample booking...');
    let sampleBooking = await Booking.findOne({ 
      customer: bhargavCustomer._id,
      provider: shreyasProvider._id 
    });
    
    if (!sampleBooking) {
      sampleBooking = new Booking({
        customer: bhargavCustomer._id,
        provider: shreyasProvider._id,
        service: sampleService._id,
        scheduledDate: new Date('2024-12-15'),
        scheduledTime: '10:00 AM',
        status: 'completed',
        pricing: {
          agreedAmount: 500,
          currency: 'INR'
        },
        notes: 'Complete house cleaning service - excellent work!',
        address: {
          street: '456 Customer Lane',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560002'
        }
      });
      await sampleBooking.save();
      console.log('✅ Created sample booking');
    }

    // 6. Create a review
    console.log('\n6. Creating sample review...');
    let sampleReview = await Review.findOne({ 
      customer: bhargavCustomer._id,
      provider: shreyasProvider._id 
    });
    
    if (!sampleReview) {
      sampleReview = new Review({
        customer: bhargavCustomer._id,
        provider: shreyasProvider._id,
        service: sampleService._id,
        booking: sampleBooking._id,
        rating: 5,
        comment: 'Excellent service! Shreyas did a fantastic job cleaning our house. Very professional and thorough. Highly recommended!',
        isFlagged: false
      });
      await sampleReview.save();
      console.log('✅ Created sample review');

      // Update provider rating
      const reviews = await Review.find({ provider: shreyasProvider._id });
      const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
      shreyasProvider.rating = {
        average: avgRating,
        count: reviews.length
      };
      await shreyasProvider.save();
      console.log('✅ Updated provider rating');
    }

    // 7. Create additional test bookings and reviews
    console.log('\n7. Creating additional test data...');
    
    // Create a few more bookings with different statuses
    const additionalBookings = [
      {
        status: 'pending',
        scheduledDate: new Date('2024-12-25'),
        notes: 'Holiday cleaning service'
      },
      {
        status: 'confirmed',
        scheduledDate: new Date('2024-12-20'),
        notes: 'Regular weekly cleaning'
      }
    ];

    for (const bookingData of additionalBookings) {
      const existingBooking = await Booking.findOne({
        customer: bhargavCustomer._id,
        provider: shreyasProvider._id,
        status: bookingData.status
      });

      if (!existingBooking) {
        const newBooking = new Booking({
          customer: bhargavCustomer._id,
          provider: shreyasProvider._id,
          service: sampleService._id,
          scheduledDate: bookingData.scheduledDate,
          scheduledTime: '10:00 AM',
          status: bookingData.status,
          pricing: {
            agreedAmount: 500,
            currency: 'INR'
          },
          notes: bookingData.notes,
          address: {
            street: '456 Customer Lane',
            city: 'Bangalore',
            state: 'Karnataka',
            pincode: '560002'
          }
        });
        await newBooking.save();
        console.log(`✅ Created ${bookingData.status} booking`);
      }
    }

    // 8. Summary
    console.log('\n📊 SUMMARY:');
    const totalCustomers = await User.countDocuments({ role: 'customer', isActive: true });
    const totalProviders = await User.countDocuments({ role: 'housewife', isActive: true, isApproved: true });
    const totalBookings = await Booking.countDocuments();
    const totalReviews = await Review.countDocuments();
    
    console.log(`✅ Total Customers: ${totalCustomers}`);
    console.log(`✅ Total Approved Providers: ${totalProviders}`);
    console.log(`✅ Total Bookings: ${totalBookings}`);
    console.log(`✅ Total Reviews: ${totalReviews}`);

    console.log('\n🎉 Admin data fix completed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing admin data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
fixAdminData();
