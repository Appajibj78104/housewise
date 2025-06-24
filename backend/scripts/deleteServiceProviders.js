const mongoose = require('mongoose');
const User = require('../models/User');

// MongoDB connection string
const MONGODB_URI = 'mongodb+srv://AppajiB:appubj@cluster0.tb3q7cy.mongodb.net/housewife-services';

async function deleteServiceProviders() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully');

    // Count existing service providers
    const beforeCount = await User.countDocuments({ role: 'housewife' });
    console.log(`📊 Found ${beforeCount} service provider users`);

    if (beforeCount === 0) {
      console.log('ℹ️  No service provider users found to delete');
      return;
    }

    // Delete all service provider users
    const deleteResult = await User.deleteMany({ role: 'housewife' });
    console.log(`🗑️  Deleted ${deleteResult.deletedCount} service provider users`);

    // Verify deletion
    const afterCount = await User.countDocuments({ role: 'housewife' });
    console.log(`📊 Service providers remaining: ${afterCount}`);

    // Show all remaining users by role
    const allUsers = await User.find({}, 'name email role').lean();
    console.log('\n📋 Remaining users in database:');
    
    const usersByRole = allUsers.reduce((acc, user) => {
      acc[user.role] = acc[user.role] || [];
      acc[user.role].push(`${user.name} (${user.email})`);
      return acc;
    }, {});

    Object.entries(usersByRole).forEach(([role, users]) => {
      console.log(`  ${role}: ${users.length} users`);
      users.forEach(user => console.log(`    - ${user}`));
    });

    console.log('\n✅ Service provider deletion completed successfully');

  } catch (error) {
    console.error('❌ Error deleting service providers:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the deletion
deleteServiceProviders();
