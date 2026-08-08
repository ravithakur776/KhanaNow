import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/user.model.js';
import { Restaurant } from '../models/restaurant.model.js';
import { Food } from '../models/food.model.js';
import { Category } from '../models/category.model.js';
import { Coupon } from '../models/coupon.model.js';
import { env } from '../config/env.js';

async function runSeed() {
  console.log('🌱 Starting KhanaNow Database Seeding...');
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log('📦 Connected to MongoDB:', env.MONGODB_URI);

    // Clear previous seed records
    await Promise.all([
      User.deleteMany({ email: { $in: ['customer@khananow.com', 'owner@khananow.com', 'admin@khananow.com'] } }),
      Restaurant.deleteMany({ slug: { $in: ['royal-biryani-house', 'pizza-roma-gourmet', 'punjab-grill-express'] } }),
      Category.deleteMany({ slug: { $in: ['biryani', 'pizza', 'north-indian', 'burgers', 'desserts'] } }),
      Coupon.deleteMany({ code: { $in: ['KHANA50', 'WELCOME100', 'BIRYANI150'] } }),
    ]);

    const passwordHash = await bcrypt.hash('Password123!', 10);

    // 1. Create Core Users
    const [customer, owner, admin] = await Promise.all([
      User.create({
        firstName: 'Rahul',
        lastName: 'Verma',
        email: 'customer@khananow.com',
        phone: '9876543210',
        passwordHash,
        role: 'customer',
        status: 'active',
        isVerified: true,
      }),
      User.create({
        firstName: 'Vikram',
        lastName: 'Singh',
        email: 'owner@khananow.com',
        phone: '9876543211',
        passwordHash,
        role: 'restaurant_owner',
        status: 'active',
        isVerified: true,
      }),
      User.create({
        firstName: 'Platform',
        lastName: 'Admin',
        email: 'admin@khananow.com',
        phone: '9876543212',
        passwordHash,
        role: 'admin',
        status: 'active',
        isVerified: true,
      }),
    ]);

    console.log('👤 Created Users: Customer, Restaurant Owner, Admin');

    // 2. Create Categories
    const categories = await Category.create([
      { name: 'Biryani', slug: 'biryani', icon: '🍲', sortOrder: 1, isActive: true },
      { name: 'Pizza & Pasta', slug: 'pizza', icon: '🍕', sortOrder: 2, isActive: true },
      { name: 'North Indian', slug: 'north-indian', icon: '🥘', sortOrder: 3, isActive: true },
      { name: 'Burgers & Fries', slug: 'burgers', icon: '🍔', sortOrder: 4, isActive: true },
      { name: 'Desserts & Sweets', slug: 'desserts', icon: '🍰', sortOrder: 5, isActive: true },
    ]);
    console.log(`📂 Created ${categories.length} Food Categories`);

    // 3. Create Sample Restaurants
    const restaurants = await Restaurant.create([
      {
        ownerId: owner._id,
        name: 'Royal Biryani House',
        slug: 'royal-biryani-house',
        description: 'Authentic Hyderabadi Dum Biryani slow-cooked in copper handis with saffron and secret spices.',
        bannerImageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=1200&auto=format&fit=crop&q=80',
        cuisines: ['Hyderabadi Biryani', 'Mughlai', 'North Indian'],
        avgRating: 4.8,
        totalRatings: 340,
        costForTwo: 450,
        deliveryTimeMinutes: { min: 20, max: 30 },
        isPureVeg: false,
        isOpen: true,
        status: 'active',
        offerBadge: '50% OFF up to ₹100 | Code KHANA50',
        fssaiLicenseNumber: '10019011000421',
        address: {
          street: 'Block M, Connaught Place',
          city: 'New Delhi',
          pincode: '110001',
          location: { type: 'Point', coordinates: [77.2167, 28.6315] },
        },
      },
      {
        ownerId: owner._id,
        name: 'Pizza Roma Gourmet',
        slug: 'pizza-roma-gourmet',
        description: 'Hand-tossed sourdough Neapolitan pizzas baked at 450°C with imported San Marzano tomato sauce.',
        bannerImageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&auto=format&fit=crop&q=80',
        cuisines: ['Italian', 'Woodfired Pizza', 'Garlic Bread'],
        avgRating: 4.6,
        totalRatings: 215,
        costForTwo: 550,
        deliveryTimeMinutes: { min: 25, max: 35 },
        isPureVeg: false,
        isOpen: true,
        status: 'active',
        offerBadge: 'Flat ₹100 OFF on orders above ₹600 | WELCOME100',
        fssaiLicenseNumber: '10019011000982',
        address: {
          street: 'Indiranagar 100ft Road',
          city: 'Bengaluru',
          pincode: '560038',
          location: { type: 'Point', coordinates: [77.6412, 12.9716] },
        },
      },
    ]);
    console.log(`🍳 Created ${restaurants.length} Active Kitchens`);

    // 4. Create Signature Food Items
    const foods = await Food.create([
      {
        restaurantId: restaurants[0]._id,
        categoryId: categories[0]._id,
        name: 'Hyderabadi Special Chicken Dum Biryani',
        description: 'Authentic long-grain Basmati rice layered with succulent marinated chicken and aromatic saffron spices.',
        price: 340,
        discountedPrice: 290,
        dietaryType: 'non_veg',
        imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&auto=format&fit=crop&q=80',
        isAvailable: true,
        isBestseller: true,
        isRecommended: true,
        spiceLevel: 'medium',
        preparationTimeMinutes: 20,
      },
      {
        restaurantId: restaurants[0]._id,
        categoryId: categories[2]._id,
        name: 'Paneer Butter Masala Handi',
        description: 'Cottage cheese simmered in a velvety tomato and cashew gravy enriched with butter and kasuri methi.',
        price: 280,
        discountedPrice: 240,
        dietaryType: 'veg',
        imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&auto=format&fit=crop&q=80',
        isAvailable: true,
        isBestseller: true,
        spiceLevel: 'mild',
        preparationTimeMinutes: 18,
      },
      {
        restaurantId: restaurants[1]._id,
        categoryId: categories[1]._id,
        name: 'Classic Margherita Woodfired Pizza',
        description: 'Fresh fior di latte mozzarella, San Marzano tomato puree, extra virgin olive oil, and sweet basil leaves.',
        price: 380,
        discountedPrice: 330,
        dietaryType: 'veg',
        imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&auto=format&fit=crop&q=80',
        isAvailable: true,
        isBestseller: true,
        isRecommended: true,
        spiceLevel: 'none',
        preparationTimeMinutes: 15,
      },
    ]);
    console.log(`🍛 Created ${foods.length} Signature Dishes`);

    // 5. Create Core Promo Coupons
    await Coupon.create([
      {
        code: 'KHANA50',
        description: '50% off up to ₹100 on your first food order',
        discountType: 'percentage',
        discountValue: 50,
        maxDiscount: 100,
        minOrderValue: 199,
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
      {
        code: 'WELCOME100',
        description: 'Flat ₹100 discount on feasts above ₹599',
        discountType: 'flat',
        discountValue: 100,
        minOrderValue: 599,
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
    ]);
    console.log('🏷️ Created Platform Coupons (KHANA50, WELCOME100)');

    console.log('\n🎉 KhanaNow Database Seeding Completed Successfully!');
    console.log('--------------------------------------------------');
    console.log('🔑 Test Credentials:');
    console.log('   Customer:         customer@khananow.com / Password123!');
    console.log('   Restaurant Owner: owner@khananow.com / Password123!');
    console.log('   Platform Admin:   admin@khananow.com / Password123!');
    console.log('--------------------------------------------------');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

runSeed();
