const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function fixUserRoles() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/housewife-services');
    console.log('Connected to MongoDB');

    // 1. Fix admin user
    console.log('\n1. Fixing admin user...');
    let adminUser = await User.findOne({ email: 'admin@example.com' });
    if (adminUser) {
      adminUser.role = 'admin';
      adminUser.isActive = true;
      adminUser.isApproved = true;
      await adminUser.save();
      console.log('✅ Fixed admin user role');
    } else {
      // Create admin user
      adminUser = new User({
        name: 'System Administrator',
        email: 'admin@example.com',
        password: 'ChangeMe123!',
        role: 'admin',
        phone: '9999999999',
        isActive: true,
        isApproved: true,
        isVerified: true,
        address: {
          street: 'Admin Office',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560001',
          country: 'India'
        }
      });
      await adminUser.save();
      console.log('✅ Created admin user');
    }

    // 2. Fix shreyas@gmail.com as provider
    console.log('\n2. Fixing shreyas@gmail.com as provider...');
    const shreyasUser = await User.findOne({ email: 'shreyas@gmail.com' });
    if (shreyasUser) {
      shreyasUser.role = 'housewife';
      shreyasUser.isActive = true;
      shreyasUser.isApproved = true;
      await shreyasUser.save();
      console.log('✅ Fixed shreyas@gmail.com as provider');
    } else {
      console.log('❌ shreyas@gmail.com not found');
    }

    // 3. Fix bhargav@gmail.com as customer
    console.log('\n3. Fixing bhargav@gmail.com as customer...');
    const bhargavUser = await User.findOne({ email: 'bhargav@gmail.com' });
    if (bhargavUser) {
      bhargavUser.role = 'customer';
      bhargavUser.isActive = true;
      bhargavUser.isApproved = true;
      await bhargavUser.save();
      console.log('✅ Fixed bhargav@gmail.com as customer');
    } else {
      console.log('❌ bhargav@gmail.com not found');
    }

    // 4. Fix all other users as customers (except admin and shreyas)
    console.log('\n4. Fixing other users as customers...');
    const otherUsers = await User.find({ 
      email: { 
        $nin: ['admin@example.com', 'shreyas@gmail.com', 'bhargav@gmail.com'] 
      },
      $or: [
        { role: { $exists: false } },
        { role: '' },
        { role: null }
      ]
    });

    for (const user of otherUsers) {
      user.role = 'customer';
      user.isActive = true;
      user.isApproved = true;
      await user.save();
      console.log(`✅ Fixed ${user.email} as customer`);
    }

    // 5. Create additional providers for testing
    console.log('\n5. Creating additional test providers...');
    const additionalProviders = [
      {
        name: 'Priya Sharma',
        email: 'priya.sharma@example.com',
        phone: '9876543214',
        bio: 'Professional house cleaning and organizing services',
        experience: 3
      },
      {
        name: 'Meera Patel',
        email: 'meera.patel@example.com',
        phone: '9876543215',
        bio: 'Expert in deep cleaning and home maintenance',
        experience: 4
      }
    ];

    for (const providerData of additionalProviders) {
      const existingProvider = await User.findOne({ email: providerData.email });
      if (!existingProvider) {
        const newProvider = new User({
          name: providerData.name,
          email: providerData.email,
          password: 'password123',
          role: 'housewife',
          phone: providerData.phone,
          isActive: true,
          isApproved: true,
          isVerified: true,
          bio: providerData.bio,
          experience: providerData.experience,
          address: {
            street: '123 Provider Street',
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
            average: 4.5,
            count: 10
          }
        });
        await newProvider.save();
        console.log(`✅ Created provider: ${providerData.name}`);
      } else {
        existingProvider.role = 'housewife';
        existingProvider.isActive = true;
        existingProvider.isApproved = true;
        await existingProvider.save();
        console.log(`✅ Updated existing provider: ${providerData.name}`);
      }
    }

    // 6. Summary
    console.log('\n📊 FINAL SUMMARY:');
    const totalAdmins = await User.countDocuments({ role: 'admin', isActive: true });
    const totalCustomers = await User.countDocuments({ role: 'customer', isActive: true });
    const totalProviders = await User.countDocuments({ role: 'housewife', isActive: true, isApproved: true });
    const pendingProviders = await User.countDocuments({ role: 'housewife', isActive: true, isApproved: false });
    
    console.log(`✅ Total Admins: ${totalAdmins}`);
    console.log(`✅ Total Customers: ${totalCustomers}`);
    console.log(`✅ Total Approved Providers: ${totalProviders}`);
    console.log(`✅ Total Pending Providers: ${pendingProviders}`);

    console.log('\n🎉 User roles fix completed successfully!');
    console.log('\n🔗 Admin can now login at: http://localhost:5173/login');
    console.log('📧 Admin credentials: admin@example.com / ChangeMe123!');
    
  } catch (error) {
    console.error('❌ Error fixing user roles:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
fixUserRoles();
