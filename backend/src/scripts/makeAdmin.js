// Usage: node src/scripts/makeAdmin.js user@example.com
// Promotes an already-registered user to the admin role. There is no
// public API for this on purpose — admins are created out-of-band.
require('dotenv').config();
require('reflect-metadata');
const { AppDataSource } = require('../config/data-source');
const User = require('../entities/User');

async function run() {
  const email = process.argv[2];
  if (!email) {
    console.error('Usage: node src/scripts/makeAdmin.js <email>');
    process.exit(1);
  }

  await AppDataSource.initialize();
  const userRepo = AppDataSource.getRepository(User);
  const user = await userRepo.findOne({ where: { email } });

  if (!user) {
    console.error(`No user found with email ${email}`);
    process.exit(1);
  }

  user.role = 'admin';
  await userRepo.save(user);
  console.log(`${email} is now an admin`);
  process.exit(0);
}

run();
