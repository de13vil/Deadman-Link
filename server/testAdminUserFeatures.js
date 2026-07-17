require('dotenv').config();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Link = require('./models/Link');

const BASE_URL = 'http://localhost:5050';
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey_for_dev_only';

const testUserEmail = `testuser_${Date.now()}@example.com`;
const testAdminEmail = `admin_${Date.now()}@example.com`;

async function runTests() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/deadman-link');
    console.log('✅ Connected to MongoDB for setup.');

    // 1. Create a normal user and an admin user
    const user = await User.create({
      name: 'Test User',
      email: testUserEmail,
      username: `testuser_${Date.now()}`,
      password: 'password123',
      isVerified: true,
      role: 'user'
    });
    
    const admin = await User.create({
      name: 'Admin User',
      email: testAdminEmail,
      username: `admin_${Date.now()}`,
      password: 'password123',
      isVerified: true,
      role: 'admin'
    });

    const userToken = jwt.sign({ sub: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    const adminToken = jwt.sign({ sub: admin._id, email: admin.email, role: admin.role }, JWT_SECRET, { expiresIn: '1h' });

    console.log('✅ Users created and Tokens generated.');

    // ---------------------------------------------------------
    // USER SIDE FEATURES VERIFICATION
    // ---------------------------------------------------------
    console.log('\n--- Testing User Side Features ---');

    const linkRes = await fetch(`${BASE_URL}/api/links`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userToken}` },
      body: JSON.stringify({ targetUrl: 'https://user.example.com', title: 'User Link' })
    });
    const link = await linkRes.json();
    if (!linkRes.ok) throw new Error('Failed to create link');
    console.log('✅ User Link created:', link.slug);

    const listRes = await fetch(`${BASE_URL}/api/links`, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    const list = await listRes.json();
    if (list.length === 0 || list[0]._id !== link._id) throw new Error('Failed to list own links');
    console.log('✅ User can list own links.');

    const updateRes = await fetch(`${BASE_URL}/api/links/${link._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userToken}` },
      body: JSON.stringify({ title: 'Updated Title' })
    });
    const updatedLink = await updateRes.json();
    if (updatedLink.title !== 'Updated Title') throw new Error('Failed to update link title');
    console.log('✅ User can update own link.');

    // ---------------------------------------------------------
    // ADMIN SIDE FEATURES VERIFICATION
    // ---------------------------------------------------------
    console.log('\n--- Testing Admin Side Features ---');

    const usersRes = await fetch(`${BASE_URL}/api/admin/users`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    if (!usersRes.ok) throw new Error('Admin failed to fetch users');
    const allUsers = await usersRes.json();
    console.log(`✅ Admin can list all users (${allUsers.users ? allUsers.users.length : 0} found).`);

    const allLinksRes = await fetch(`${BASE_URL}/api/admin/links`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    if (!allLinksRes.ok) throw new Error('Admin failed to fetch all links');
    console.log('✅ Admin can list all links across system.');

    const auditRes = await fetch(`${BASE_URL}/api/admin/audit-logs`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    if (!auditRes.ok) throw new Error('Admin failed to fetch audit logs');
    const logs = await auditRes.json();
    console.log(`✅ Admin can fetch audit logs (${logs.logs ? logs.logs.length : 0} logs found).`);

    const adminDelRes = await fetch(`${BASE_URL}/api/admin/links/${link._id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    if (!adminDelRes.ok) throw new Error(`Admin failed to delete link: ${await adminDelRes.text()}`);
    console.log('✅ Admin can forcefully delete any link.');

    await User.findByIdAndDelete(user._id);
    await User.findByIdAndDelete(admin._id);
    console.log('\n✅ Cleanup successful.');

    console.log('\n🎉 ALL ADMIN & USER FEATURES VERIFIED SUCCESSFULLY 🎉');
    process.exit(0);

  } catch (err) {
    console.error('\n❌ Test failed:', err);
    process.exit(1);
  }
}

runTests();
