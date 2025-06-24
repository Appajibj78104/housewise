const axios = require('axios');
const bcrypt = require('bcryptjs');

const BASE_URL = 'http://localhost:5000/api';
let authToken = '';
let userId = '';

// Test data
const testProvider = {
  name: 'Test Provider',
  email: 'testprovider@example.com',
  password: 'password123',
  phone: '9999888777',
  role: 'housewife',
  address: {
    street: '123 Test Street',
    city: 'Test City',
    state: 'Test State',
    pincode: '123456'
  }
};

const loginCredentials = {
  email: 'testprovider@example.com',
  password: 'password123'
};

// Helper function to make API calls
const apiCall = async (method, endpoint, data = null, token = null) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      },
      ...(data && { data })
    };

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status || 500
    };
  }
};

// Test functions
const testSignup = async () => {
  console.log('\n🧪 Testing Signup Endpoint...');

  // Clean up any existing test user first
  const User = require('./models/User');
  await User.deleteOne({ email: testProvider.email });
  await User.deleteOne({ phone: testProvider.phone });

  const result = await apiCall('POST', '/auth/register', testProvider);
  
  if (result.success) {
    console.log('✅ Signup successful');
    console.log('📋 Response data:', JSON.stringify(result.data, null, 2));

    const user = result.data.data?.user || result.data.user;
    const token = result.data.data?.token || result.data.token;

    if (user) {
      console.log(`📧 User: ${user.name} (${user.email})`);
      console.log(`👤 Role: ${user.role}`);
      console.log(`📱 Phone: ${user.phone}`);
    }
    console.log(`🔑 Token received: ${token ? 'Yes' : 'No'}`);

    // Store for later tests
    authToken = token;
    userId = user?._id;

    return true;
  } else {
    console.log('❌ Signup failed');
    console.log(`Status: ${result.status}`);
    console.log(`Error: ${JSON.stringify(result.error, null, 2)}`);
    return false;
  }
};

const testPasswordHashing = async () => {
  console.log('\n🔐 Testing Password Hashing...');
  const User = require('./models/User');
  
  try {
    const user = await User.findOne({ email: testProvider.email });
    if (user) {
      const isPlaintext = user.password === testProvider.password;
      const isHashed = await bcrypt.compare(testProvider.password, user.password);
      
      console.log(`✅ Password stored as hash: ${!isPlaintext}`);
      console.log(`✅ Hash verification works: ${isHashed}`);
      console.log(`🔒 Stored hash: ${user.password.substring(0, 20)}...`);
      
      return !isPlaintext && isHashed;
    }
  } catch (error) {
    console.log('❌ Password hashing test failed:', error.message);
    return false;
  }
};

const testLogin = async () => {
  console.log('\n🔑 Testing Login Endpoint...');
  const result = await apiCall('POST', '/auth/login', loginCredentials);
  
  if (result.success) {
    console.log('✅ Login successful');
    console.log('📋 Response data:', JSON.stringify(result.data, null, 2));

    const user = result.data.data?.user || result.data.user;
    const token = result.data.data?.token || result.data.token;

    if (user) {
      console.log(`📧 User: ${user.name} (${user.email})`);
      console.log(`👤 Role: ${user.role}`);
    }
    console.log(`🔑 Token received: ${token ? 'Yes' : 'No'}`);

    // Update token
    authToken = token;
    return true;
  } else {
    console.log('❌ Login failed');
    console.log(`Status: ${result.status}`);
    console.log(`Error: ${JSON.stringify(result.error, null, 2)}`);
    return false;
  }
};

const testProtectedRoute = async () => {
  console.log('\n🛡️ Testing Protected Route...');
  const result = await apiCall('GET', '/auth/me', null, authToken);
  
  if (result.success) {
    console.log('✅ Protected route access successful');
    console.log(`📧 Profile: ${result.data.user.name} (${result.data.user.email})`);
    return true;
  } else {
    console.log('❌ Protected route access failed');
    console.log(`Status: ${result.status}`);
    console.log(`Error: ${JSON.stringify(result.error, null, 2)}`);
    return false;
  }
};

const testInvalidToken = async () => {
  console.log('\n🚫 Testing Invalid Token...');
  const result = await apiCall('GET', '/auth/me', null, 'invalid-token');
  
  if (!result.success && result.status === 401) {
    console.log('✅ Invalid token properly rejected');
    return true;
  } else {
    console.log('❌ Invalid token was accepted (security issue!)');
    return false;
  }
};

const testLogout = async () => {
  console.log('\n🚪 Testing Logout Endpoint...');
  const result = await apiCall('POST', '/auth/logout', null, authToken);
  
  if (result.success) {
    console.log('✅ Logout successful');
    return true;
  } else {
    console.log('❌ Logout failed');
    console.log(`Status: ${result.status}`);
    console.log(`Error: ${JSON.stringify(result.error, null, 2)}`);
    return false;
  }
};

// Main test runner
const runTests = async () => {
  console.log('🚀 Starting Backend Authentication Tests...');
  console.log('=' .repeat(50));
  
  const results = [];
  
  // Run all tests
  results.push(await testSignup());
  results.push(await testPasswordHashing());
  results.push(await testLogin());
  results.push(await testProtectedRoute());
  results.push(await testInvalidToken());
  results.push(await testLogout());
  
  // Summary
  console.log('\n' + '=' .repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('=' .repeat(50));
  
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${total - passed}/${total}`);
  
  if (passed === total) {
    console.log('\n🎉 All backend tests passed!');
  } else {
    console.log('\n⚠️  Some tests failed. Check the output above.');
  }
  
  process.exit(passed === total ? 0 : 1);
};

// Connect to database and run tests
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/housewife_services')
  .then(() => {
    console.log('✅ Connected to MongoDB');
    runTests();
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err);
    process.exit(1);
  });
