const mongoose = require('mongoose');
require('dotenv').config();

async function migrateUserLocations() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/housewife-services');
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const users = db.collection('users');
    
    // Find users who are housewives but don't have proper location data
    const housewives = await users.find({ 
      role: 'housewife',
      isActive: true
    }).toArray();

    console.log(`Found ${housewives.length} housewife users`);

    let updated = 0;
    
    for (const user of housewives) {
      let needsUpdate = false;
      let updateData = {};

      // Check if user has coordinates but no GeoJSON location
      if (user.address && user.address.coordinates && 
          user.address.coordinates.latitude && user.address.coordinates.longitude &&
          !user.address.location) {
        
        updateData['address.location'] = {
          type: 'Point',
          coordinates: [user.address.coordinates.longitude, user.address.coordinates.latitude]
        };
        needsUpdate = true;
      }
      
      // If user doesn't have coordinates, add sample coordinates for Delhi area
      if (!user.address || !user.address.coordinates || 
          !user.address.coordinates.latitude || !user.address.coordinates.longitude) {
        
        // Generate random coordinates around Delhi
        const delhiLat = 28.6139;
        const delhiLng = 77.2090;
        const randomLat = delhiLat + (Math.random() - 0.5) * 0.1; // ±0.05 degrees
        const randomLng = delhiLng + (Math.random() - 0.5) * 0.1; // ±0.05 degrees
        
        updateData['address.coordinates'] = {
          latitude: randomLat,
          longitude: randomLng
        };
        
        updateData['address.location'] = {
          type: 'Point',
          coordinates: [randomLng, randomLat]
        };
        
        // Add basic address if missing
        if (!user.address || !user.address.city) {
          updateData['address.city'] = 'Delhi';
          updateData['address.state'] = 'Delhi';
          updateData['address.pincode'] = '110001';
          updateData['address.street'] = 'Sample Address, Delhi';
        }
        
        needsUpdate = true;
      }

      if (needsUpdate) {
        await users.updateOne(
          { _id: user._id },
          { $set: updateData }
        );
        updated++;
        console.log(`✅ Updated user: ${user.name} (${user.email})`);
      }
    }

    console.log(`\n🎉 Migration completed! Updated ${updated} users with location data.`);
    
    // Verify the migration
    const usersWithLocation = await users.countDocuments({
      role: 'housewife',
      isActive: true,
      'address.location': { $exists: true }
    });
    
    console.log(`📊 Total housewives with location data: ${usersWithLocation}`);
    
  } catch (error) {
    console.error('❌ Error migrating user locations:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

migrateUserLocations();
