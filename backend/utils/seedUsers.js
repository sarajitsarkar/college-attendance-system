// ============================================================
// Run with: npm run seed
// Updates all seeded users' passwords to a real bcrypt hash of
// "Password@123" so you can log in immediately after importing
// database/seed.sql
// ============================================================
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

async function run() {
  const plainPassword = 'Password@123';
  const hash = await bcrypt.hash(plainPassword, 10);

  const [result] = await pool.query('UPDATE users SET password = ?', [hash]);
  console.log(`✅ Updated ${result.affectedRows} user password(s) to hash of "${plainPassword}"`);
  console.log('   You can now log in as any seeded user with this password.');
  process.exit(0);
}

run().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
