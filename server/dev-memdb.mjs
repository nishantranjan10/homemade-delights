// Dev convenience: run the API against a throwaway in-memory MongoDB.
// Useful when a local mongod isn't installed. Data resets on each restart.
// Real usage should point MONGO_URI at a persistent MongoDB / Atlas instead.
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { seedData } from './src/seed.js';

const mongo = await MongoMemoryServer.create();
process.env.MONGO_URI = mongo.getUri('rupalis_delights');
process.env.JWT_SECRET ||= 'dev-only-insecure-secret';

console.log('🧪 In-memory MongoDB started');

// Connect once here so we can seed before the API starts serving.
await mongoose.connect(process.env.MONGO_URI);
await seedData({ force: true });
await mongoose.disconnect();
console.log('🌱 Database seeded');

// Boot the real Express app (it will connect using the same MONGO_URI).
await import('./src/index.js');

const shutdown = async () => {
  await mongo.stop();
  process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
