import bcrypt from 'bcryptjs';
import { User } from '../models/User';

export async function seedAdmin(): Promise<void> {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email || !password) {
    console.warn('SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD not set; skipping admin seed');
    return;
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    if (existing.role !== 'ADMIN') {
      existing.role = 'ADMIN';
      await existing.save();
      console.log(`Updated existing user to ADMIN: ${email}`);
    } else {
      console.log(`Seed admin already exists: ${email}`);
    }
    return;
  }

  const hashed = await bcrypt.hash(password, 10);
  await User.create({
    email: email.toLowerCase(),
    password: hashed,
    role: 'ADMIN',
  });

  console.log(`Seed admin created: ${email}`);
}
