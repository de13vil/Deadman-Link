const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const User = require('../models/User');

async function migrateRoles() {
  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      throw new Error('MONGO_URI is missing');
    }
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB Connected for Migration to ' + mongoURI.split('@')[1] || mongoURI);

    const allowedRoles = ['regular', 'premium', 'admin'];
    
    const result = await mongoose.connection.db.collection('users').updateMany(
      { role: { $nin: allowedRoles } },
      { $set: { role: 'regular' } }
    );
    
    console.log(`Migration complete. Modified ${result.modifiedCount} users to 'regular' role.`);
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
}

migrateRoles();
