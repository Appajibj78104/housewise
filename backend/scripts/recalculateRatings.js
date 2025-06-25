const mongoose = require('mongoose');
const Service = require('../models/Service');
const Review = require('../models/Review');
const User = require('../models/User');
require('dotenv').config();

const recalculateAllRatings = async () => {
  try {
    console.log('🔄 Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database');

    console.log('🔄 Recalculating service ratings...');
    
    // Get all services
    const services = await Service.find({});
    console.log(`📊 Found ${services.length} services to process`);

    for (const service of services) {
      // Get all reviews for this service
      const reviews = await Review.find({ 
        service: service._id, 
        isVisible: true 
      });

      if (reviews.length > 0) {
        const avgRating = reviews.reduce((sum, r) => sum + r.rating.overall, 0) / reviews.length;
        const roundedRating = Math.round(avgRating * 10) / 10;
        
        // Update service rating
        service.rating.average = roundedRating;
        service.rating.count = reviews.length;
        await service.save();
        
        console.log(`✅ Updated service "${service.title}": ${roundedRating} (${reviews.length} reviews)`);
      } else {
        // No reviews, ensure rating is 0
        service.rating.average = 0;
        service.rating.count = 0;
        await service.save();
        console.log(`📝 Reset service "${service.title}": 0 (no reviews)`);
      }
    }

    console.log('🔄 Recalculating provider ratings...');
    
    // Get all providers
    const providers = await User.find({ role: 'housewife' });
    console.log(`📊 Found ${providers.length} providers to process`);

    for (const provider of providers) {
      // Get all reviews for this provider
      const reviews = await Review.find({ 
        provider: provider._id, 
        isVisible: true 
      });

      if (reviews.length > 0) {
        const avgRating = reviews.reduce((sum, r) => sum + r.rating.overall, 0) / reviews.length;
        const roundedRating = Math.round(avgRating * 10) / 10;
        
        // Update provider rating
        provider.rating.average = roundedRating;
        provider.rating.count = reviews.length;
        await provider.save();
        
        console.log(`✅ Updated provider "${provider.name}": ${roundedRating} (${reviews.length} reviews)`);
      } else {
        // No reviews, ensure rating is 0
        provider.rating.average = 0;
        provider.rating.count = 0;
        await provider.save();
        console.log(`📝 Reset provider "${provider.name}": 0 (no reviews)`);
      }
    }

    console.log('🎉 Rating recalculation completed successfully!');
    
  } catch (error) {
    console.error('❌ Error recalculating ratings:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
    process.exit(0);
  }
};

// Run the script
recalculateAllRatings();
