const mongoose = require('mongoose');
const User = require('../models/User');
const Service = require('../models/Service');
const Booking = require('../models/Booking');

// MongoDB connection string
const MONGODB_URI = 'mongodb+srv://AppajiB:appubj@cluster0.tb3q7cy.mongodb.net/housewife-services';

async function verifyDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully');

    // Check users by role
    const userCounts = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    console.log('\n📊 USER STATISTICS:');
    userCounts.forEach(({ _id, count }) => {
      console.log(`  ${_id}: ${count} users`);
    });

    // List all users
    const allUsers = await User.find({}, 'name email role isActive createdAt').lean();
    console.log('\n👥 ALL USERS:');
    allUsers.forEach(user => {
      const createdDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown';
      console.log(`  - ${user.name} (${user.email}) - Role: ${user.role} - Active: ${user.isActive} - Created: ${createdDate}`);
    });

    // Check services
    const serviceCount = await Service.countDocuments();
    console.log(`\n🛠️  SERVICES: ${serviceCount} total`);

    if (serviceCount > 0) {
      const servicesByProvider = await Service.aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'provider',
            foreignField: '_id',
            as: 'providerInfo'
          }
        },
        {
          $group: {
            _id: '$provider',
            count: { $sum: 1 },
            providerName: { $first: '$providerInfo.name' }
          }
        }
      ]);

      console.log('  Services by provider:');
      servicesByProvider.forEach(({ _id, count, providerName }) => {
        console.log(`    - ${providerName[0] || 'Unknown'}: ${count} services`);
      });
    }

    // Check bookings
    const bookingCount = await Booking.countDocuments();
    console.log(`\n📅 BOOKINGS: ${bookingCount} total`);

    console.log('\n✅ Database verification completed');

  } catch (error) {
    console.error('❌ Error verifying database:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the verification
verifyDatabase();
