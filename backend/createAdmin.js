import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import User from './models/User.js';

dotenv.config();

const run = async () => {
  const name = process.env.ADMIN_NAME || 'Admin User';
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    // eslint-disable-next-line no-console
    console.error('Please set ADMIN_EMAIL and ADMIN_PASSWORD in your .env');
    process.exit(1);
  }

  try {
    await connectDB();

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ name, email, password, isAdmin: true });
      // eslint-disable-next-line no-console
      console.log('Admin user created:', email);
    } else {
      user.name = name;
      user.isAdmin = true;
      if (password) user.password = password;
      await user.save();
      // eslint-disable-next-line no-console
      console.log('Existing user promoted to admin:', email);
    }

    process.exit(0);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  }
};

run();

