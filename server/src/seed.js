import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import Admin from './models/Admin.js';
import WeeklyMenu from './models/WeeklyMenu.js';
import SpecialItem from './models/SpecialItem.js';

const WEEKLY = {
  Monday: {
    Lunch: ['Palak Toor Dal', 'Gobhi Matar', 'Steamed Rice', '2 Chapatis', 'Salad & Pickle'],
    Dinner: ['Methi Moong Dal', 'Bhindi Fry', 'Jeera Rice', '2 Chapatis', 'Salad & Pickle'],
  },
  Tuesday: {
    Lunch: ['Methi Toor Dal', 'Lauki Sabzi', 'Steamed Rice', '2 Rotis', 'Salad & Pickle'],
    Dinner: ['Palak Masoor Dal', 'Dum Aloo', 'Jeera Rice', '2 Rotis', 'Salad & Pickle'],
  },
  Wednesday: {
    Lunch: ['Methi Moong Dal', 'Mix Sprouts', 'Steamed Rice', '2 Chapatis', 'Salad & Pickle'],
    Dinner: ['Palak Masoor Dal', 'Broccoli Makhani', 'Jeera Rice', '4 Puris', 'Salad & Pickle'],
  },
  Thursday: {
    Lunch: ['Kali Dal', 'Cabbage with Peas', 'Jeera Rice', '2 Chapatis', 'Onion Raita'],
    Dinner: ['Plain Dal', 'Chole Curry', 'Plain Rice', '2 Chapatis', 'Salad & Pickle'],
  },
  Friday: {
    Lunch: ['Palak Moong Dal', 'Black Chickpeas', '2 Chapatis', 'Salad & Pickle'],
    Dinner: ['Methi Toor Dal', 'Soya Chunks', 'Peas Pulao', '2 Rotis', 'Salad & Pickle'],
  },
  Saturday: {
    Lunch: ['Lauki Masoor Dal', 'Matar Paneer', 'Jeera Rice', '4 Puris', 'Salad & Pickle'],
    Dinner: ['Palak Chana Dal', 'Baingan Aloo', 'Mixed Veg Pulao', '2 Rotis', 'Salad & Pickle'],
  },
  Sunday: {
    Lunch: ['Palak Moong Dal', 'Rajma Curry', 'Pulao', '2 Chapatis', 'Salad & Pickle'],
    Dinner: ['Methi Masoor Dal', 'Pumpkin Sabzi', 'Steamed Rice', '2 Chapatis', 'Salad & Pickle'],
  },
};

const SPECIALS = [
  { name: 'Veg Momos (8 pcs)', description: 'Steamed vegetable dumplings with spicy chutney', price: 15 },
  { name: 'White Sauce Pasta', description: 'Creamy white sauce pasta with veggies', price: 15 },
  { name: 'Litti Chokha (4 pcs)', description: 'Roasted wheat balls with mashed spiced veggies', price: 15 },
  { name: 'Veg Noodles', description: 'Stir-fried hakka-style vegetable noodles', price: 15 },
];

// Seeds admin + weekly menu + specials. Assumes a live mongoose connection.
// `force` re-creates the menu/specials even if data already exists.
export async function seedData({ force = true } = {}) {
  // --- Admin ---
  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  const email = process.env.ADMIN_EMAIL || '';
  const phone = process.env.ADMIN_PHONE || '';
  let admin = await Admin.findOne({ username });
  if (!admin) {
    admin = new Admin({ username, email, phone });
    await admin.setPassword(password);
    await admin.save();
    console.log(`👤 Created admin "${username}" (password: ${password})`);
  } else {
    console.log(`👤 Admin "${username}" already exists — left unchanged`);
  }

  // Skip re-seeding menu/specials if they already exist and not forcing.
  if (!force && (await WeeklyMenu.countDocuments()) > 0) {
    console.log('🍛 Menu already present — skipping menu/specials seed');
    return;
  }

  // --- Weekly menu ---
  await WeeklyMenu.deleteMany({});
  const docs = [];
  for (const [day, meals] of Object.entries(WEEKLY)) {
    for (const [mealType, items] of Object.entries(meals)) {
      docs.push({ day, mealType, items, available: true });
    }
  }
  await WeeklyMenu.insertMany(docs);
  console.log(`🍛 Seeded ${docs.length} weekly menu entries`);

  // --- Specials ---
  await SpecialItem.deleteMany({});
  await SpecialItem.insertMany(SPECIALS);
  console.log(`🌟 Seeded ${SPECIALS.length} special items`);
}

// CLI entry: `npm run seed` connects, seeds, and disconnects.
async function run() {
  await connectDB(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/rupalis_delights');
  await seedData({ force: true });
  await mongoose.disconnect();
  console.log('✅ Seed complete');
  process.exit(0);
}

// Only run automatically when invoked directly (not when imported).
if (import.meta.url === `file://${process.argv[1]}`) {
  run().catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
}
