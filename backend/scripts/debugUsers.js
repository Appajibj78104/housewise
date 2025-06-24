const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function debugUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/housewife-services');
    console.log('Connected to MongoDB');

    // 1. Check all users in database
    console.log('\n1. All users in database:');
    const allUsers = await User.find({});
    console.log(`Total users found: ${allUsers.length}`);
    
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email})`);
      console.log(`   Role: '${user.role}' (type: ${typeof user.role})`);
      console.log(`   Active: ${user.isActive}, Approved: ${user.isApproved}`);
      console.log('');
    });

    // 2. Check specific users
    console.log('\n2. Checking specific users:');
    const shreyas = await User.findOne({ email: 'shreyas@gmail.com' });
    if (shreyas) {
      console.log(`Shreyas: Role='${shreyas.role}', Active=${shreyas.isActive}, Approved=${shreyas.isApproved}`);
    }

    const bhargav = await User.findOne({ email: 'bhargav@gmail.com' });
    if (bhargav) {
      console.log(`Bhargav: Role='${bhargav.role}', Active=${bhargav.isActive}, Approved=${bhargav.isApproved}`);
    }

    const admin = await User.findOne({ email: 'admin@example.com' });
    if (admin) {
      console.log(`Admin: Role='${admin.role}', Active=${admin.isActive}, Approved=${admin.isApproved}`);
    }

    // 3. Try to manually update one user
    console.log('\n3. Manually updating bhargav role...');
    if (bhargav) {
      bhargav.role = 'customer';
      bhargav.isActive = true;
      bhargav.isApproved = true;
      await bhargav.save();
      console.log('✅ Updated bhargav');
      
      // Check if it saved correctly
      const updatedBhargav = await User.findOne({ email: 'bhargav@gmail.com' });
      console.log(`After update - Bhargav: Role='${updatedBhargav.role}', Active=${updatedBhargav.isActive}, Approved=${updatedBhargav.isApproved}`);
    }

    // 4. Try to manually update shreyas
    console.log('\n4. Manually updating shreyas role...');
    if (shreyas) {
      shreyas.role = 'housewife';
      shreyas.isActive = true;
      shreyas.isApproved = true;
      await shreyas.save();
      console.log('✅ Updated shreyas');
      
      // Check if it saved correctly
      const updatedShreyas = await User.findOne({ email: 'shreyas@gmail.com' });
      console.log(`After update - Shreyas: Role='${updatedShreyas.role}', Active=${updatedShreyas.isActive}, Approved=${updatedShreyas.isApproved}`);
    }

    // 5. Query by role
    console.log('\n5. Querying by role:');
    const customers = await User.find({ role: 'customer' });
    console.log(`Customers found: ${customers.length}`);
    
    const providers = await User.find({ role: 'housewife' });
    console.log(`Providers found: ${providers.length}`);
    
    const admins = await User.find({ role: 'admin' });
    console.log(`Admins found: ${admins.length}`);

    console.log('\n🎉 Debug completed!');
    
  } catch (error) {
    console.error('❌ Error debugging users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
debugUsers();
