import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import config from './config/index.js';
import User from './models/User.js';
import Product from './models/Product.js';

const demoProducts = [
  {
    title: 'Royal Chronograph Gold',
    brand: 'Sa3ati Heritage',
    price: 4500,
    discountPrice: 3999,
    description:
      'An exquisite gold chronograph that embodies timeless elegance. Swiss-made automatic movement with 42-hour power reserve. The 18K gold case catches light magnificently.',
    specifications: {
      caseSize: '42mm',
      caseMaterial: '18K Gold',
      strapMaterial: 'Leather',
      strapColor: 'Brown',
      movement: 'Automatic',
      waterResistance: '50m',
      dialColor: 'Champagne Gold',
      gender: 'men',
    },
    images: [
      'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800',
      'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=800',
    ],
    stock: 15,
    tags: ['luxury', 'gold', 'chronograph', 'automatic'],
    featured: true,
  },
  {
    title: 'Midnight Diver Pro',
    brand: 'Sa3ati Sport',
    price: 2800,
    description:
      'Built for adventure, designed for elegance. 300m water resistance, unidirectional rotating bezel, and luminous markers for peak underwater visibility.',
    specifications: {
      caseSize: '44mm',
      caseMaterial: 'Stainless Steel',
      strapMaterial: 'Stainless Steel',
      strapColor: 'Silver',
      movement: 'Automatic',
      waterResistance: '300m',
      dialColor: 'Black',
      gender: 'men',
    },
    images: [
      'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800',
    ],
    stock: 25,
    tags: ['sport', 'diver', 'steel', 'automatic'],
    featured: true,
  },
  {
    title: 'Éternelle Rose',
    brand: 'Sa3ati Femme',
    price: 3200,
    description:
      'A celebration of feminine grace. Rose gold case adorned with 12 brilliant-cut diamonds on the bezel. Mother-of-pearl dial shimmers with every movement.',
    specifications: {
      caseSize: '34mm',
      caseMaterial: 'Rose Gold',
      strapMaterial: 'Leather',
      strapColor: 'Blush Pink',
      movement: 'Quartz',
      waterResistance: '30m',
      dialColor: 'Mother of Pearl',
      gender: 'women',
    },
    images: [
      'https://images.unsplash.com/photo-1549972574-8e3e1e6e6592?w=800',
    ],
    stock: 18,
    tags: ['luxury', 'rose gold', 'diamonds', 'women'],
    featured: true,
  },
  {
    title: 'Skeleton Masterpiece',
    brand: 'Sa3ati Heritage',
    price: 6800,
    description:
      'Witness the art of horology through the meticulously hand-finished skeleton movement. Each gear and spring is visible through the sapphire crystal case back.',
    specifications: {
      caseSize: '40mm',
      caseMaterial: 'Titanium',
      strapMaterial: 'Leather',
      strapColor: 'Black',
      movement: 'Manual Winding',
      waterResistance: '50m',
      dialColor: 'Skeleton',
      gender: 'men',
    },
    images: [
      'https://images.unsplash.com/photo-1508057198894-247b23fe5ade?w=800',
    ],
    stock: 8,
    tags: ['skeleton', 'luxury', 'titanium', 'manual'],
    featured: true,
  },
  {
    title: 'Classic Minimalist',
    brand: 'Sa3ati Essential',
    price: 950,
    description:
      'Less is more. Ultra-thin 7mm case with a clean dial, domed sapphire crystal, and Italian leather strap. The perfect everyday luxury companion.',
    specifications: {
      caseSize: '38mm',
      caseMaterial: 'Stainless Steel',
      strapMaterial: 'Leather',
      strapColor: 'Tan',
      movement: 'Quartz',
      waterResistance: '30m',
      dialColor: 'White',
      gender: 'unisex',
    },
    images: [
      'https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=800',
    ],
    stock: 40,
    tags: ['minimalist', 'classic', 'everyday', 'quartz'],
    featured: false,
  },
  {
    title: 'Tourbillon Imperial',
    brand: 'Sa3ati Heritage',
    price: 12500,
    description:
      'The pinnacle of watchmaking excellence. Hand-assembled tourbillon mechanism visible at 6 o\'clock. Limited edition of 100 pieces worldwide.',
    specifications: {
      caseSize: '43mm',
      caseMaterial: 'Platinum',
      strapMaterial: 'Alligator Leather',
      strapColor: 'Navy',
      movement: 'Tourbillon',
      waterResistance: '30m',
      dialColor: 'Blue',
      gender: 'men',
    },
    images: [
      'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800',
    ],
    stock: 5,
    tags: ['tourbillon', 'platinum', 'limited edition', 'luxury'],
    featured: true,
  },
  {
    title: 'Lunar Phase Elegance',
    brand: 'Sa3ati Femme',
    price: 2100,
    description:
      'Track the mystery of the moon on your wrist. The moon phase complication adds celestial beauty to this already stunning timepiece.',
    specifications: {
      caseSize: '36mm',
      caseMaterial: 'Stainless Steel',
      strapMaterial: 'Mesh',
      strapColor: 'Gold',
      movement: 'Quartz',
      waterResistance: '50m',
      dialColor: 'Navy Blue',
      gender: 'women',
    },
    images: [
      'https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?w=800',
    ],
    stock: 22,
    tags: ['moon phase', 'elegant', 'women', 'mesh'],
    featured: false,
  },
  {
    title: 'Carbon Racer GMT',
    brand: 'Sa3ati Sport',
    price: 3600,
    description:
      'Inspired by motorsport. Carbon fiber dial with GMT complication for the global traveler. Forged carbon case is incredibly light yet virtually indestructible.',
    specifications: {
      caseSize: '45mm',
      caseMaterial: 'Carbon Fiber',
      strapMaterial: 'Rubber',
      strapColor: 'Black',
      movement: 'Automatic',
      waterResistance: '100m',
      dialColor: 'Carbon Black',
      gender: 'men',
    },
    images: [
      'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=800',
    ],
    stock: 12,
    tags: ['sport', 'carbon', 'gmt', 'racing'],
    featured: false,
  },
  {
    title: 'Diamond Constellation',
    brand: 'Sa3ati Femme',
    price: 5400,
    description:
      'A sky full of stars on your wrist. The dial features hand-placed diamond hour markers resembling a starry night. Full pavé diamond bezel.',
    specifications: {
      caseSize: '32mm',
      caseMaterial: '18K White Gold',
      strapMaterial: 'Satin',
      strapColor: 'Midnight Blue',
      movement: 'Quartz',
      waterResistance: '30m',
      dialColor: 'Diamond Blue',
      gender: 'women',
    },
    images: [
      'https://images.unsplash.com/photo-1518131672697-613becd4fab5?w=800',
    ],
    stock: 10,
    tags: ['diamonds', 'luxury', 'white gold', 'women'],
    featured: true,
  },
  {
    title: 'Pilot Navigator',
    brand: 'Sa3ati Essential',
    price: 1800,
    description:
      'Designed for the skies. Large crown for easy manipulation with gloves, anti-reflective sapphire crystal, and bold Arabic numerals for perfect legibility.',
    specifications: {
      caseSize: '41mm',
      caseMaterial: 'Stainless Steel',
      strapMaterial: 'Leather',
      strapColor: 'Dark Brown',
      movement: 'Automatic',
      waterResistance: '100m',
      dialColor: 'Matte Black',
      gender: 'men',
    },
    images: [
      'https://images.unsplash.com/photo-1455930950CASCADE-c8ee925541d2?w=800',
    ],
    stock: 30,
    tags: ['pilot', 'aviation', 'automatic', 'classic'],
    featured: false,
  },
  {
    title: 'Sapphire Infinity',
    brand: 'Sa3ati Heritage',
    price: 8900,
    description:
      'A masterwork of transparency. Full sapphire crystal case reveals the beautifully decorated movement from every angle. A true collector\'s piece.',
    specifications: {
      caseSize: '39mm',
      caseMaterial: 'Sapphire Crystal',
      strapMaterial: 'Alligator Leather',
      strapColor: 'Black',
      movement: 'Automatic',
      waterResistance: '30m',
      dialColor: 'Transparent',
      gender: 'unisex',
    },
    images: [
      'https://images.unsplash.com/photo-1585123334904-845d60e97427?w=800',
    ],
    stock: 6,
    tags: ['sapphire', 'collector', 'transparent', 'luxury'],
    featured: true,
  },
  {
    title: 'Chrono Velocity',
    brand: 'Sa3ati Sport',
    price: 2200,
    description:
      'Precision timing for the modern athlete. Tachymeter bezel, chronograph function, and super-luminova indices for any condition.',
    specifications: {
      caseSize: '43mm',
      caseMaterial: 'Stainless Steel',
      strapMaterial: 'Rubber',
      strapColor: 'Red/Black',
      movement: 'Quartz Chronograph',
      waterResistance: '200m',
      dialColor: 'Black/Red',
      gender: 'men',
    },
    images: [
      'https://images.unsplash.com/photo-1539874754764-5a96559165b0?w=800',
    ],
    stock: 35,
    tags: ['chronograph', 'sport', 'racing', 'quartz'],
    featured: false,
  },
];

async function seed() {
  try {
    await mongoose.connect(config.mongodbUri);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const passwordHash = await bcrypt.hash(config.admin.password, 12);
    await User.create({
      name: 'Admin',
      email: config.admin.email,
      passwordHash,
      role: 'admin',
    });
    console.log(`Admin created: ${config.admin.email}`);

    // Create demo user
    const demoHash = await bcrypt.hash('User@12345', 12);
    await User.create({
      name: 'John Doe',
      email: 'user@sa3ati.com',
      passwordHash: demoHash,
      role: 'user',
    });
    console.log('Demo user created: user@sa3ati.com');

    // Seed products
    await Product.insertMany(demoProducts);
    console.log(`${demoProducts.length} products seeded`);

    console.log('\n✅ Seed complete!');
    console.log('Admin login: admin@sa3ati.com / Admin@12345');
    console.log('User login:  user@sa3ati.com / User@12345\n');

    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
