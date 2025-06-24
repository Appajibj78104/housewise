const mongoose = require('mongoose');
require('dotenv').config();

async function createGeoIndex() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/housewife-services');
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    
    // Create 2dsphere index for geospatial queries
    await db.collection('users').createIndex({ 'address.location': '2dsphere' });
    console.log('✅ Created 2dsphere index for address.location');

    // Also create index for coordinates (backup)
    await db.collection('users').createIndex({ 
      'address.coordinates.latitude': 1, 
      'address.coordinates.longitude': 1 
    });
    console.log('✅ Created compound index for coordinates');

    // List all indexes to verify
    const indexes = await db.collection('users').indexes();
    console.log('\n📋 Current indexes on users collection:');
    indexes.forEach((index, i) => {
      console.log(`${i + 1}. ${JSON.stringify(index.key)} - ${index.name}`);
    });

    console.log('\n🎉 Geospatial indexes created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createGeoIndex();
