const User = require('../models/User');

const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    || 'admin@lcc.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin1234';

async function ensureAdmin() {
  const email = String(ADMIN_EMAIL).toLowerCase();
  const existing = await User.findOne({ email });
  if (existing) {
    if (existing.role !== 'admin') {
      existing.role = 'admin';
      await existing.save();
      console.log(`✓ Promoted existing user to admin: ${email}`);
    }
    return existing;
  }

  const admin = await new User({
    name: 'LCC Admin',
    email,
    password: ADMIN_PASSWORD,
    role: 'admin',
    phone: '+91 91961 09055',
    location: 'Lucknow'
  }).save();

  console.log(`✓ Admin user created: ${email}`);
  return admin;
}

module.exports = ensureAdmin;
