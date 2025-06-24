const mongoose = require('mongoose');
const User = require('../models/User');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function inspectProviders() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // 1. Find all users with role 'housewife'
    console.log('\n1. All users with role "housewife":');
    const housewives = await User.find({ role: 'housewife' });
    console.log(`Found ${housewives.length} users with role 'housewife':`);
    
    housewives.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email})`);
      console.log(`   Role: '${user.role}'`);
      console.log(`   isActive: ${user.isActive} (type: ${typeof user.isActive})`);
      console.log(`   isApproved: ${user.isApproved} (type: ${typeof user.isApproved})`);
      console.log(`   isVerified: ${user.isVerified} (type: ${typeof user.isVerified})`);
      console.log('');
    });

    // 2. Test the exact query used by admin
    console.log('\n2. Testing admin query: { role: "housewife", isActive: true, isApproved: true }');
    const adminQuery = { role: 'housewife', isActive: true, isApproved: true };
    const adminResults = await User.find(adminQuery);
    console.log(`Admin query found: ${adminResults.length} providers`);

    // 3. Test variations of the query
    console.log('\n3. Testing query variations:');
    
    const queries = [
      { role: 'housewife' },
      { role: 'housewife', isActive: true },
      { role: 'housewife', isApproved: true },
      { role: 'housewife', isActive: { $ne: false } },
      { role: 'housewife', isApproved: { $ne: false } },
      { role: 'housewife', isActive: { $in: [true, null, undefined] } },
      { role: 'housewife', isApproved: { $in: [true, null, undefined] } }
    ];

    for (const query of queries) {
      const results = await User.find(query);
      console.log(`Query ${JSON.stringify(query)}: ${results.length} results`);
    }

    // 4. Fix all providers to have correct boolean values
    console.log('\n4. Fixing provider boolean fields...');
    for (const provider of housewives) {
      let updated = false;
      
      // Ensure isActive is a boolean
      if (typeof provider.isActive !== 'boolean') {
        provider.isActive = true;
        updated = true;
      }
      
      // Ensure isApproved is a boolean and set to true for testing
      if (typeof provider.isApproved !== 'boolean' || provider.isApproved === false) {
        provider.isApproved = true;
        updated = true;
      }
      
      // Ensure isVerified is a boolean
      if (typeof provider.isVerified !== 'boolean') {
        provider.isVerified = true;
        updated = true;
      }
      
      if (updated) {
        await provider.save();
        console.log(`✅ Fixed ${provider.name} (${provider.email})`);
        console.log(`   isActive: ${provider.isActive} (${typeof provider.isActive})`);
        console.log(`   isApproved: ${provider.isApproved} (${typeof provider.isApproved})`);
        console.log(`   isVerified: ${provider.isVerified} (${typeof provider.isVerified})`);
      }
    }

    // 5. Test admin query again after fixes
    console.log('\n5. Testing admin query after fixes:');
    const finalResults = await User.find(adminQuery);
    console.log(`Admin query now finds: ${finalResults.length} providers`);
    
    finalResults.forEach((provider, index) => {
      console.log(`${index + 1}. ${provider.name} (${provider.email})`);
      console.log(`   isActive: ${provider.isActive}, isApproved: ${provider.isApproved}`);
    });

    console.log('\n🎉 Provider inspection and fix completed!');
    
  } catch (error) {
    console.error('❌ Error inspecting providers:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
inspectProviders();
