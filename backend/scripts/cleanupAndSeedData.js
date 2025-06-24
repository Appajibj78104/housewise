const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function cleanupAndSeedData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/housewife-services');
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    
    // Clear all collections
    console.log('\n🧹 Cleaning up database...');
    await db.collection('users').deleteMany({});
    await db.collection('services').deleteMany({});
    await db.collection('bookings').deleteMany({});
    await db.collection('reviews').deleteMany({});
    console.log('✅ Database cleaned');

    // Create test users with proper location data
    console.log('\n👥 Creating test users...');
    
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // Test customers
    const customers = [
      {
        name: 'John Doe',
        email: 'customer@example.com',
        password: hashedPassword,
        phone: '9876543210',
        role: 'customer',
        isActive: true,
        isVerified: true,
        address: {
          street: 'Connaught Place',
          city: 'Delhi',
          state: 'Delhi',
          pincode: '110001',
          coordinates: {
            latitude: 28.6315,
            longitude: 77.2167
          },
          location: {
            type: 'Point',
            coordinates: [77.2167, 28.6315]
          }
        }
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: hashedPassword,
        phone: '9876543211',
        role: 'customer',
        isActive: true,
        isVerified: true,
        address: {
          street: 'Karol Bagh',
          city: 'Delhi',
          state: 'Delhi',
          pincode: '110005',
          coordinates: {
            latitude: 28.6519,
            longitude: 77.1909
          },
          location: {
            type: 'Point',
            coordinates: [77.1909, 28.6519]
          }
        }
      }
    ];

    // Test service providers (housewives)
    const providers = [
      {
        name: 'Priya Sharma',
        email: 'priya@example.com',
        password: hashedPassword,
        phone: '9876543212',
        role: 'housewife',
        isActive: true,
        isVerified: true,
        bio: 'Experienced home cook specializing in North Indian cuisine. 10+ years of cooking experience.',
        experience: 10,
        rating: {
          average: 4.5,
          count: 25
        },
        address: {
          street: 'Lajpat Nagar',
          city: 'Delhi',
          state: 'Delhi',
          pincode: '110024',
          coordinates: {
            latitude: 28.5665,
            longitude: 77.2431
          },
          location: {
            type: 'Point',
            coordinates: [77.2431, 28.5665]
          }
        }
      },
      {
        name: 'Sunita Devi',
        email: 'sunita@example.com',
        password: hashedPassword,
        phone: '9876543213',
        role: 'housewife',
        isActive: true,
        isVerified: true,
        bio: 'Professional house cleaning and organizing services. Reliable and thorough.',
        experience: 8,
        rating: {
          average: 4.8,
          count: 40
        },
        address: {
          street: 'Rohini Sector 15',
          city: 'Delhi',
          state: 'Delhi',
          pincode: '110085',
          coordinates: {
            latitude: 28.7041,
            longitude: 77.1025
          },
          location: {
            type: 'Point',
            coordinates: [77.1025, 28.7041]
          }
        }
      },
      {
        name: 'Meera Gupta',
        email: 'meera@example.com',
        password: hashedPassword,
        phone: '9876543214',
        role: 'housewife',
        isActive: true,
        isVerified: true,
        bio: 'Expert tailor for ladies clothing. Specializes in alterations and custom stitching.',
        experience: 15,
        rating: {
          average: 4.7,
          count: 60
        },
        address: {
          street: 'Dwarka Sector 12',
          city: 'Delhi',
          state: 'Delhi',
          pincode: '110078',
          coordinates: {
            latitude: 28.6080,
            longitude: 77.0348
          },
          location: {
            type: 'Point',
            coordinates: [77.0348, 28.6080]
          }
        }
      },
      {
        name: 'Kavita Singh',
        email: 'kavita@example.com',
        password: hashedPassword,
        phone: '9876543215',
        role: 'housewife',
        isActive: true,
        isVerified: true,
        bio: 'Home tutor for primary school children. Math and Science specialist.',
        experience: 12,
        rating: {
          average: 4.9,
          count: 35
        },
        address: {
          street: 'Vasant Kunj',
          city: 'Delhi',
          state: 'Delhi',
          pincode: '110070',
          coordinates: {
            latitude: 28.5244,
            longitude: 77.1588
          },
          location: {
            type: 'Point',
            coordinates: [77.1588, 28.5244]
          }
        }
      }
    ];

    // Insert users
    await db.collection('users').insertMany([...customers, ...providers]);
    console.log(`✅ Created ${customers.length} customers and ${providers.length} providers`);

    // Create test services
    console.log('\n🛠️ Creating test services...');
    
    const providerUsers = await db.collection('users').find({ role: 'housewife' }).toArray();
    
    const services = [
      {
        title: 'Home Cooking Service',
        description: 'Fresh, healthy home-cooked meals prepared in your kitchen',
        category: 'cooking',
        subcategory: 'home cooking',
        provider: providerUsers[0]._id,
        pricing: {
          type: 'per_hour',
          amount: 300,
          currency: 'INR'
        },
        duration: {
          estimated: 120,
          unit: 'minutes'
        },
        location: {
          type: 'customer_location',
          serviceArea: {
            type: 'Point',
            coordinates: [77.2431, 28.5665]
          },
          radius: 10
        },
        availability: {
          days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
          timeSlots: [
            { start: '09:00', end: '12:00' },
            { start: '15:00', end: '18:00' }
          ],
          isAvailable: true
        },
        rating: {
          average: 4.5,
          count: 25
        },
        totalBookings: 25,
        isActive: true,
        isApproved: true,
        featured: true
      },
      {
        title: 'House Cleaning Service',
        description: 'Professional house cleaning and organizing services',
        category: 'cleaning',
        subcategory: 'house cleaning',
        provider: providerUsers[1]._id,
        pricing: {
          type: 'per_hour',
          amount: 250,
          currency: 'INR'
        },
        duration: {
          estimated: 180,
          unit: 'minutes'
        },
        location: {
          type: 'customer_location',
          serviceArea: {
            type: 'Point',
            coordinates: [77.1025, 28.7041]
          },
          radius: 15
        },
        availability: {
          days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
          timeSlots: [
            { start: '08:00', end: '11:00' },
            { start: '14:00', end: '17:00' }
          ],
          isAvailable: true
        },
        rating: {
          average: 4.8,
          count: 40
        },
        totalBookings: 40,
        isActive: true,
        isApproved: true,
        featured: true
      },
      {
        title: 'Tailoring & Alterations',
        description: 'Expert tailoring services for ladies clothing and alterations',
        category: 'tailoring',
        subcategory: 'alterations',
        provider: providerUsers[2]._id,
        pricing: {
          type: 'per_item',
          amount: 150,
          currency: 'INR'
        },
        duration: {
          estimated: 60,
          unit: 'minutes'
        },
        location: {
          type: 'provider_location',
          serviceArea: {
            type: 'Point',
            coordinates: [77.0348, 28.6080]
          },
          radius: 20
        },
        availability: {
          days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
          timeSlots: [
            { start: '10:00', end: '13:00' },
            { start: '15:00', end: '18:00' }
          ],
          isAvailable: true
        },
        rating: {
          average: 4.7,
          count: 60
        },
        totalBookings: 60,
        isActive: true,
        isApproved: true,
        featured: true
      },
      {
        title: 'Home Tutoring',
        description: 'Primary school tutoring for Math and Science subjects',
        category: 'tutoring',
        subcategory: 'primary education',
        provider: providerUsers[3]._id,
        pricing: {
          type: 'per_hour',
          amount: 400,
          currency: 'INR'
        },
        duration: {
          estimated: 90,
          unit: 'minutes'
        },
        location: {
          type: 'customer_location',
          serviceArea: {
            type: 'Point',
            coordinates: [77.1588, 28.5244]
          },
          radius: 12
        },
        availability: {
          days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
          timeSlots: [
            { start: '16:00', end: '18:00' },
            { start: '19:00', end: '21:00' }
          ],
          isAvailable: true
        },
        rating: {
          average: 4.9,
          count: 35
        },
        totalBookings: 35,
        isActive: true,
        isApproved: true,
        featured: true
      }
    ];

    await db.collection('services').insertMany(services);
    console.log(`✅ Created ${services.length} services`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`👥 Users: ${customers.length + providers.length}`);
    console.log(`🛠️ Services: ${services.length}`);
    console.log(`🗺️ All providers have location data for map functionality`);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

cleanupAndSeedData();
