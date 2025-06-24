const axios = require('axios');
const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Configuration
const API_BASE_URL = 'http://localhost:5000/api';
const MONGODB_URI = 'mongodb+srv://AppajiB:appubj@cluster0.tb3q7cy.mongodb.net/housewife-services';

// Test data
const testProvider = {
  name: 'Test Provider',
  email: 'testprovider@example.com',
  password: 'testpassword123',
  phone: '9999888777',
  role: 'housewife',
  address: {
    street: '123 Test Street',
    city: 'Test City',
    state: 'Test State',
    pincode: '123456'
  }
};

async function testAuthFlow() {
  try {
    console.log('🚀 Starting Authentication Flow Test...\n');

    // Cleanup: Remove test user if exists
    console.log('🧹 CLEANUP: Removing existing test user');
    await mongoose.connect(MONGODB_URI);
    await User.deleteOne({ email: testProvider.email });
    await mongoose.disconnect();
    console.log('✅ Cleanup completed\n');

    // Test 1: Signup
    console.log('📝 TEST 1: Service Provider Signup');
    try {
      const signupResponse = await axios.post(`${API_BASE_URL}/auth/register`, testProvider);
      console.log('✅ Signup successful');
      console.log(`   Status: ${signupResponse.status}`);
      console.log(`   User ID: ${signupResponse.data.data.user._id}`);
      console.log(`   Token provided: ${!!signupResponse.data.data.token}`);
      console.log(`   User role: ${signupResponse.data.data.user.role}`);
    } catch (error) {
      console.log('❌ Signup failed');
      console.log(`   Status: ${error.response?.status}`);
      console.log(`   Error: ${error.response?.data?.message || error.message}`);
      return;
    }

    // Test 2: Verify password hashing in database
    console.log('\n🔐 TEST 2: Password Hashing Verification');
    await mongoose.connect(MONGODB_URI);
    const user = await User.findOne({ email: testProvider.email });
    if (user && user.password) {
      const isPasswordHashed = user.password !== testProvider.password;
      const isValidHash = await bcrypt.compare(testProvider.password, user.password);
      console.log(`✅ Password hashed: ${isPasswordHashed}`);
      console.log(`✅ Hash validation: ${isValidHash}`);
      console.log(`   Original: ${testProvider.password}`);
      console.log(`   Hashed: ${user.password.substring(0, 20)}...`);
    } else {
      console.log('❌ User not found in database or password missing');
    }
    await mongoose.disconnect();

    // Test 3: Login
    console.log('\n🔑 TEST 3: Service Provider Login');
    let authToken;
    try {
      const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: testProvider.email,
        password: testProvider.password
      });
      console.log('✅ Login successful');
      console.log(`   Status: ${loginResponse.status}`);
      console.log(`   Token provided: ${!!loginResponse.data.data.token}`);
      console.log(`   User role: ${loginResponse.data.data.user.role}`);
      authToken = loginResponse.data.data.token;
    } catch (error) {
      console.log('❌ Login failed');
      console.log(`   Status: ${error.response?.status}`);
      console.log(`   Error: ${error.response?.data?.message || error.message}`);
      return;
    }

    // Test 4: Protected route access
    console.log('\n🛡️  TEST 4: Protected Route Access');
    try {
      const profileResponse = await axios.get(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      console.log('✅ Protected route access successful');
      console.log(`   Status: ${profileResponse.status}`);
      console.log(`   User name: ${profileResponse.data.data.user.name}`);
      console.log(`   User email: ${profileResponse.data.data.user.email}`);
    } catch (error) {
      console.log('❌ Protected route access failed');
      console.log(`   Status: ${error.response?.status}`);
      console.log(`   Error: ${error.response?.data?.message || error.message}`);
    }

    // Test 5: Invalid token access
    console.log('\n🚫 TEST 5: Invalid Token Access');
    try {
      await axios.get(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': 'Bearer invalid-token'
        }
      });
      console.log('❌ Invalid token was accepted (this should not happen)');
    } catch (error) {
      console.log('✅ Invalid token properly rejected');
      console.log(`   Status: ${error.response?.status}`);
    }

    // Test 6: No token access
    console.log('\n🔒 TEST 6: No Token Access');
    try {
      await axios.get(`${API_BASE_URL}/auth/me`);
      console.log('❌ No token was accepted (this should not happen)');
    } catch (error) {
      console.log('✅ No token properly rejected');
      console.log(`   Status: ${error.response?.status}`);
    }

    console.log('\n🎉 Authentication flow test completed!');

  } catch (error) {
    console.error('💥 Test failed with error:', error.message);
  }
}

// Run the test
testAuthFlow();
