const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function debugAuth() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/housewife-services');
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const users = db.collection('users');
    
    // Find the customer user
    const customer = await users.findOne({ email: 'customer@example.com' });
    
    if (!customer) {
      console.log('❌ Customer user not found');
      return;
    }
    
    console.log('✅ Customer user found:');
    console.log(`  - Name: ${customer.name}`);
    console.log(`  - Email: ${customer.email}`);
    console.log(`  - Role: ${customer.role}`);
    console.log(`  - Active: ${customer.isActive}`);
    console.log(`  - Password hash exists: ${!!customer.password}`);
    
    // Test password comparison
    const testPassword = 'password123';
    const isValid = await bcrypt.compare(testPassword, customer.password);
    console.log(`  - Password test (${testPassword}): ${isValid ? '✅ Valid' : '❌ Invalid'}`);
    
    // Test with different password
    const wrongPassword = 'wrongpassword';
    const isWrong = await bcrypt.compare(wrongPassword, customer.password);
    console.log(`  - Wrong password test: ${isWrong ? '❌ Should be false' : '✅ Correctly false'}`);
    
    // Check all users
    console.log('\n📋 All users in database:');
    const allUsers = await users.find({}).toArray();
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - ${user.role} - Active: ${user.isActive}`);
    });
    
  } catch (error) {
    console.error('❌ Debug error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

debugAuth();
