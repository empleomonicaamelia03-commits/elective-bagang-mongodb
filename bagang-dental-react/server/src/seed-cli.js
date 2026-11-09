import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import { seedCatalog } from './seed.js';

try {
  await connectDB();
  await seedCatalog({ overwrite: true });
} catch (err) {
  console.error('Seed failed:', err.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
