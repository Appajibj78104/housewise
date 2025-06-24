const mongoose = require('mongoose');
const User = require('../models/User');
const Service = require('../models/Service');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function createAdminTestData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get existing users
    const customers = await User.find({ role: 'customer', isActive: true }).limit(5);
    const providers = await User.find({ role: 'housewife', isActive: true, isApproved: true }).limit(5);
    
    console.log(`Found ${customers.length} customers and ${providers.length} providers`);

    if (customers.length === 0 || providers.length === 0) {
      console.log('❌ Need customers and providers to create test data');
      return;
    }

    // 1. Create services for providers
    console.log('\n1. Creating services...');
    const serviceTemplates = [
      {
        title: 'Complete House Cleaning',
        description: 'Professional deep cleaning service for your entire house',
        category: 'cleaning',
        subcategory: 'deep cleaning',
        pricing: { type: 'fixed', amount: 500, currency: 'INR' },
        duration: { estimated: 180, unit: 'minutes' }
      },
      {
        title: 'Kitchen Deep Clean',
        description: 'Thorough kitchen cleaning including appliances and cabinets',
        category: 'cleaning',
        subcategory: 'kitchen cleaning',
        pricing: { type: 'fixed', amount: 300, currency: 'INR' },
        duration: { estimated: 120, unit: 'minutes' }
      },
      {
        title: 'Bathroom Sanitization',
        description: 'Complete bathroom cleaning and sanitization service',
        category: 'cleaning',
        subcategory: 'bathroom cleaning',
        pricing: { type: 'fixed', amount: 200, currency: 'INR' },
        duration: { estimated: 90, unit: 'minutes' }
      },
      {
        title: 'Home Cooking Service',
        description: 'Professional home cooking for daily meals',
        category: 'cooking',
        subcategory: 'daily meals',
        pricing: { type: 'fixed', amount: 250, currency: 'INR' },
        duration: { estimated: 120, unit: 'minutes' }
      },
      {
        title: 'Child Care Service',
        description: 'Professional child care and babysitting service',
        category: 'childcare',
        subcategory: 'babysitting',
        pricing: { type: 'hourly', amount: 100, currency: 'INR' },
        duration: { estimated: 240, unit: 'minutes' }
      }
    ];

    const createdServices = [];
    for (let i = 0; i < Math.min(providers.length, serviceTemplates.length); i++) {
      const provider = providers[i];
      const template = serviceTemplates[i];
      
      const existingService = await Service.findOne({ 
        title: template.title, 
        provider: provider._id 
      });
      
      if (!existingService) {
        const service = new Service({
          ...template,
          provider: provider._id,
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
          tags: template.category.split(' '),
          isActive: true,
          isApproved: true,
          rating: {
            average: 4.0 + Math.random() * 1,
            count: Math.floor(Math.random() * 20) + 5
          }
        });
        
        await service.save();
        createdServices.push(service);
        console.log(`✅ Created service: ${template.title} for ${provider.name}`);
      } else {
        createdServices.push(existingService);
        console.log(`✅ Service already exists: ${template.title} for ${provider.name}`);
      }
    }

    // 2. Create bookings with different statuses
    console.log('\n2. Creating bookings...');
    const bookingStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
    const createdBookings = [];

    for (let i = 0; i < 15; i++) {
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const service = createdServices[Math.floor(Math.random() * createdServices.length)];
      const provider = providers.find(p => p._id.toString() === service.provider.toString());
      const status = bookingStatuses[Math.floor(Math.random() * bookingStatuses.length)];
      
      // Generate random date within last 30 days or next 30 days
      const randomDays = Math.floor(Math.random() * 60) - 30;
      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() + randomDays);
      
      const existingBooking = await Booking.findOne({
        customer: customer._id,
        service: service._id,
        scheduledDate: {
          $gte: new Date(scheduledDate.getFullYear(), scheduledDate.getMonth(), scheduledDate.getDate()),
          $lt: new Date(scheduledDate.getFullYear(), scheduledDate.getMonth(), scheduledDate.getDate() + 1)
        }
      });

      if (!existingBooking) {
        // Generate unique booking ID
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 5);
        const bookingId = `BK${timestamp}${random}`.toUpperCase();

        const booking = new Booking({
          bookingId: bookingId,
          customer: customer._id,
          provider: provider._id,
          service: service._id,
          scheduledDate: scheduledDate,
          scheduledTime: {
            start: '10:00',
            end: '13:00'
          },
          duration: {
            estimated: service.duration.estimated
          },
          status: status,
          pricing: {
            agreedAmount: service.pricing.amount,
            currency: service.pricing.currency,
            paymentMethod: 'cash'
          },
          location: {
            type: 'customer_address',
            address: {
              street: `${Math.floor(Math.random() * 999) + 1} Test Street`,
              city: 'Bangalore',
              state: 'Karnataka',
              pincode: '560001'
            }
          },
          customerNotes: `Test booking for ${service.title} - ${status} status`
        });

        await booking.save();
        createdBookings.push(booking);
        console.log(`✅ Created ${status} booking: ${customer.name} -> ${service.title}`);
      }
    }

    // 3. Create reviews for completed bookings
    console.log('\n3. Creating reviews...');
    const completedBookings = createdBookings.filter(b => b.status === 'completed');
    
    for (const booking of completedBookings) {
      const existingReview = await Review.findOne({ booking: booking._id });
      
      if (!existingReview) {
        const rating = Math.floor(Math.random() * 5) + 1;
        const comments = [
          'Excellent service! Very professional and thorough.',
          'Good work overall, satisfied with the cleaning.',
          'Average service, could be better.',
          'Outstanding work! Highly recommended.',
          'Decent service, will book again.',
          'Very happy with the results!',
          'Professional and punctual service.',
          'Great attention to detail.'
        ];

        const review = new Review({
          customer: booking.customer,
          provider: booking.provider,
          service: booking.service,
          booking: booking._id,
          rating: {
            overall: rating,
            quality: rating,
            punctuality: Math.max(1, rating + Math.floor(Math.random() * 3) - 1),
            communication: Math.max(1, rating + Math.floor(Math.random() * 3) - 1),
            value: Math.max(1, rating + Math.floor(Math.random() * 3) - 1)
          },
          comment: comments[Math.floor(Math.random() * comments.length)],
          isReported: Math.random() < 0.1, // 10% chance of being reported
          isVisible: Math.random() > 0.05 // 95% visible
        });

        await review.save();
        console.log(`✅ Created review: ${rating} stars for booking ${booking.bookingId}`);
      }
    }

    // 4. Update provider ratings based on reviews
    console.log('\n4. Updating provider ratings...');
    for (const provider of providers) {
      const reviews = await Review.find({ 
        provider: provider._id, 
        isVisible: true 
      });
      
      if (reviews.length > 0) {
        const avgRating = reviews.reduce((sum, review) => sum + review.rating.overall, 0) / reviews.length;
        provider.rating = {
          average: Math.round(avgRating * 10) / 10,
          count: reviews.length
        };
        await provider.save();
        console.log(`✅ Updated ${provider.name}: ${provider.rating.average} stars (${provider.rating.count} reviews)`);
      }
    }

    // 5. Final summary
    console.log('\n📊 ADMIN TEST DATA SUMMARY:');
    const totalCustomers = await User.countDocuments({ role: 'customer', isActive: true });
    const totalProviders = await User.countDocuments({ role: 'housewife', isActive: true, isApproved: true });
    const totalServices = await Service.countDocuments({ isActive: true });
    const totalBookings = await Booking.countDocuments();
    const totalReviews = await Review.countDocuments();
    const flaggedReviews = await Review.countDocuments({ isReported: true });
    
    console.log(`✅ Total Customers: ${totalCustomers}`);
    console.log(`✅ Total Approved Providers: ${totalProviders}`);
    console.log(`✅ Total Services: ${totalServices}`);
    console.log(`✅ Total Bookings: ${totalBookings}`);
    console.log(`✅ Total Reviews: ${totalReviews}`);
    console.log(`✅ Flagged Reviews: ${flaggedReviews}`);

    console.log('\n🎉 Admin test data creation completed successfully!');
    console.log('\n🔗 Admin can now login at: http://localhost:5173/login');
    console.log('📧 Admin credentials: admin@example.com / ChangeMe123!');
    
  } catch (error) {
    console.error('❌ Error creating admin test data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
createAdminTestData();
