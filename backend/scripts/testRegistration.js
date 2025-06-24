const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function testRegistration() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/housewife-services');
    console.log('Connected to MongoDB');

    // Test user data
    const userData = {
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'password123',
      phone: '9999999999',
      role: 'customer'
    };

    console.log('Creating user with data:', userData);

    // Create new user
    const user = new User(userData);
    console.log('User object created');

    // Save user
    await user.save();
    console.log('✅ User saved successfully');

    // Get public profile
    const profile = user.getPublicProfile();
    console.log('✅ Public profile:', profile);

  } catch (error) {
    console.error('❌ Registration test error:', error);
    console.error('Error details:', error.message);
    if (error.errors) {
      console.error('Validation errors:', error.errors);
    }
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testRegistration();
