const mongoose = require('mongoose');
const User = require('./models/User');
const Service = require('./models/Service');
require('dotenv').config();

const cleanupProviders = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/housewife_services');
    console.log('✅ Connected to MongoDB');

    // Count existing providers
    const existingCount = await User.countDocuments({ role: 'housewife' });
    console.log(`📊 Found ${existingCount} service providers`);

    // Delete all service providers
    const userResult = await User.deleteMany({ role: 'housewife' });
    console.log(`🗑️  Deleted ${userResult.deletedCount} service provider users`);

    // Delete all services (since providers are deleted)
    const serviceResult = await Service.deleteMany({});
    console.log(`🗑️  Deleted ${serviceResult.deletedCount} services`);

    // Verify deletion
    const remainingProviders = await User.countDocuments({ role: 'housewife' });
    const remainingServices = await Service.countDocuments({});
    
    console.log(`✅ Remaining providers: ${remainingProviders}`);
    console.log(`✅ Remaining services: ${remainingServices}`);

    // Show remaining users
    const allUsers = await User.find({}, { name: 1, email: 1, role: 1 });
    console.log('\n📋 Remaining users in database:');
    allUsers.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - Role: ${user.role}`);
    });

    console.log('\n🎉 Cleanup completed successfully!');
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

cleanupProviders();
