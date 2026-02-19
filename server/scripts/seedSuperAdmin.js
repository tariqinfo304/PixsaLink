/**
 * Run once to create the first super_admin user.
 * Usage: node scripts/seedSuperAdmin.js
 * Set env FIRST_ADMIN_EMAIL and FIRST_ADMIN_PASSWORD (and optionally FIRST_ADMIN_NAME).
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';

const email = process.env.FIRST_ADMIN_EMAIL || 'admin@pixsalink.com';
const password = process.env.FIRST_ADMIN_PASSWORD || 'admin123';
const name = process.env.FIRST_ADMIN_NAME || 'Super Admin';

async function seed() {
  if (!process.env.MONGO_URI) {
    console.error('Set MONGO_URI in .env');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGO_URI);
  const existing = await User.findOne({ email });
  if (existing) {
    console.log('Super admin already exists:', email);
    process.exit(0);
  }
  // Let the User model's pre-save hook hash the password
  await User.create({ name, email, password, role: 'super_admin' });
  console.log('Super admin created:', email);
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
