const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const fixProviderLocations = async () => {
  try {
    console.log('🔄 Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database');

    console.log('🔄 Fixing provider location data...');
    
    // Get all providers (housewives)
    const providers = await User.find({ role: 'housewife' });
    console.log(`📊 Found ${providers.length} providers to process`);

    let fixedCount = 0;
    let skippedCount = 0;

    for (const provider of providers) {
      let needsUpdate = false;
      const updateData = {};

      // Check if provider has coordinates but missing GeoJSON location
      if (provider.address && provider.address.coordinates) {
        const { latitude, longitude } = provider.address.coordinates;
        
        if (latitude && longitude) {
          // Check if GeoJSON location is missing or incorrect
          if (!provider.address.location || 
              !provider.address.location.coordinates ||
              provider.address.location.coordinates[0] !== longitude ||
              provider.address.location.coordinates[1] !== latitude) {
            
            updateData['address.location'] = {
              type: 'Point',
              coordinates: [longitude, latitude] // GeoJSON format: [lng, lat]
            };
            needsUpdate = true;
          }
        }
      }

      if (needsUpdate) {
        await User.findByIdAndUpdate(provider._id, { $set: updateData });
        console.log(`✅ Fixed location for provider: ${provider.name} (${provider.email})`);
        console.log(`   Coordinates: [${updateData['address.location'].coordinates[1]}, ${updateData['address.location'].coordinates[0]}]`);
        fixedCount++;
      } else {
        console.log(`⏭️  Skipped provider: ${provider.name} (location already correct or missing coordinates)`);
        skippedCount++;
      }
    }

    console.log('\n🎉 Provider location fix completed!');
    console.log(`✅ Fixed: ${fixedCount} providers`);
    console.log(`⏭️  Skipped: ${skippedCount} providers`);
    
    // Verify the fixes
    console.log('\n🔍 Verifying fixes...');
    const providersWithLocation = await User.find({
      role: 'housewife',
      'address.location': { $exists: true }
    });
    
    console.log(`📍 Providers with GeoJSON location: ${providersWithLocation.length}`);
    
    // Show sample of fixed providers
    if (providersWithLocation.length > 0) {
      console.log('\n📋 Sample of providers with location data:');
      for (let i = 0; i < Math.min(5, providersWithLocation.length); i++) {
        const provider = providersWithLocation[i];
        if (provider.address && provider.address.location) {
          console.log(`   ${provider.name}: [${provider.address.location.coordinates[1]}, ${provider.address.location.coordinates[0]}]`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error fixing provider locations:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
    process.exit(0);
  }
};

// Run the script
fixProviderLocations();
