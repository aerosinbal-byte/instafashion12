
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User'); // User model ka path check karein
require('dotenv').config(); // .env file se variables load karne ke liye

// --- IMPORTANT ---
// Change the credentials below to your desired admin credentials.
// Behtar suraksha ke liye in credentials ko .env file mein rakhein.
const adminUser = {
  name: process.env.ADMIN_NAME || 'Admin',
  email: process.env.ADMIN_EMAIL || 'iamvikaskurrey@gmail.com',
  password: process.env.ADMIN_PASSWORD || 'vikas80',
  location: process.env.ADMIN_LOCATION || 'Default Location',
  role: 'admin'
};
// --- IMPORTANT ---

const createAdmin = async () => {
  if (!adminUser.email || !adminUser.password) {
    console.error('Admin email and password are required. Please set them in your .env file or in createAdmin.js');
    return;
  }

  const dbURI = process.env.MONGO_URI || 'mongodb://localhost:27017/instafashion';

  try {
    await mongoose.connect(dbURI);
    console.log('MongoDB connected for admin creation...');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminUser.password, salt);

    const existingAdmin = await User.findOne({ email: adminUser.email });

    if (existingAdmin) {
      // User exists, update their role and password to ensure they are an admin
      existingAdmin.role = 'admin';
      existingAdmin.password = hashedPassword;
      await existingAdmin.save();
      console.log('Existing user updated to admin successfully:', existingAdmin);
    } else {
      // User does not exist, create a new admin user
      const newUser = new User({ ...adminUser, password: hashedPassword });
      await newUser.save();
      console.log('Admin user created successfully:', newUser);
    }

  } catch (error) {
    console.error('Error creating admin user:');
    console.error(error.message);
  } finally {
    mongoose.disconnect();
    console.log('MongoDB disconnected.');
  }
};

createAdmin();
