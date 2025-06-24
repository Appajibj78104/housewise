const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function updateProviderLocations() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/housewife-services');
    console.log('Connected to MongoDB');

    // Update providers with coordinates closer to Delhi center for testing
    const updates = [
      {
        email: 'priya@example.com',
        coordinates: { latitude: 28.6139, longitude: 77.2090 }, // Delhi center
        city: 'New Delhi',
        state: 'Delhi'
      },
      {
        email: 'sunita@example.com',
        coordinates: { latitude: 28.6304, longitude: 77.2177 }, // Connaught Place
        city: 'New Delhi',
        state: 'Delhi'
      },
      {
        email: 'meera@example.com',
        coordinates: { latitude: 28.5965, longitude: 77.2006 }, // Lajpat Nagar
        city: 'New Delhi',
        state: 'Delhi'
      },
      {
        email: 'kavita@example.com',
        coordinates: { latitude: 28.6517, longitude: 77.2219 }, // Karol Bagh
        city: 'New Delhi',
        state: 'Delhi'
      }
    ];

    for (const update of updates) {
      const result = await User.updateOne(
        { email: update.email, role: 'housewife' },
        {
          $set: {
            'address.coordinates': update.coordinates,
            'address.city': update.city,
            'address.state': update.state,
            'address.country': 'India',
            'address.location': {
              type: 'Point',
              coordinates: [update.coordinates.longitude, update.coordinates.latitude]
            },
            'address.geocoding': {
              lastUpdated: new Date(),
              source: 'manual',
              confidence: 1.0
            }
          }
        }
      );

      if (result.modifiedCount > 0) {
        console.log(`✅ Updated ${update.email} location to ${update.city}`);
      } else {
        console.log(`⚠️ No update for ${update.email} (user not found or no changes)`);
      }
    }

    console.log('\n🎉 Provider locations updated successfully!');
    
    // Verify the updates
    const providers = await User.find({ 
      role: 'housewife', 
      'address.coordinates.latitude': { $exists: true } 
    }).select('name email address.city address.coordinates');
    
    console.log('\n📊 Updated providers:');
    providers.forEach(provider => {
      console.log(`  - ${provider.name} (${provider.email}): ${provider.address.city} [${provider.address.coordinates.latitude}, ${provider.address.coordinates.longitude}]`);
    });
    
  } catch (error) {
    console.error('❌ Error updating provider locations:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

updateProviderLocations();
