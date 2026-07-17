const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const assert = require('assert');
require('dotenv').config();

const User = require('./models/User');

const BASE_URL = 'http://localhost:5050';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

async function runTests() {
  console.log('--- Starting Feature Tests ---');
  try {
    // 1. Connect to DB to create test user directly (bypassing OTP)
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/deadman_link');
    console.log('✅ Connected to MongoDB for setup.');

    // Drop legacy index if it exists to avoid dup key on null username
    await User.collection.dropIndex('username_1').catch(() => {});

    const testEmail = `testuser_${Date.now()}@example.com`;
    const user = await User.create({
      name: 'Test User',
      email: testEmail,
      password: 'hashedpassword',
      role: 'user'
    });
    
    // Generate valid JWT
    const token = jwt.sign({ sub: user._id.toString(), email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    console.log('✅ Test User created and Token generated.');

    // 2. Test Link Creation
    console.log('\nCreating a link with advanced features...');
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 10000); // Expires in 10 seconds

    const linkPayload = {
      targetUrl: 'https://example.com',
      slug: `test-slug-${Date.now()}`,
      title: 'Advanced Feature Test',
      isOneTime: true,
      maxClicks: 1,
      expiresAt: expiresAt.toISOString(),
      password: 'secretpassword',
      conditionalRedirect: {
        enabled: true,
        deviceRules: {
          mobileUrl: 'https://example.com/mobile',
          desktopUrl: 'https://example.com/desktop'
        }
      },
      visibility: 'public'
    };

    const linkRes = await fetch(`${BASE_URL}/api/links`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(linkPayload)
    });
    
    if (!linkRes.ok) {
        throw new Error(`Link creation failed: ${await linkRes.text()}`);
    }
    
    const link = await linkRes.json();
    assert.ok(link._id, 'Link created successfully');
    console.log('✅ Link created with slug:', link.slug);
    console.log(`✅ Automated AI Safety Score: ${link.safetyScore}, Verdict: ${link.safetyVerdict}, Flagged: ${link.isFlagged}`);
    
    // Check ownership assignment bug fix
    assert.equal(link.ownerEmail, testEmail, 'ownerEmail was not set correctly');
    console.log('✅ Link ownership correctly assigned from JWT.');

    // 2b. Test Data Leak Security
    console.log('\nTesting Data Leak Security on Preview Endpoint...');
    const previewRes = await fetch(`${BASE_URL}/api/links/${link.slug}`);
    const previewData = await previewRes.json();
    assert.equal(previewData.link.hasPassword, true, 'hasPassword flag missing');
    assert.equal(previewData.link.password, undefined, 'Password leaked in API response!');
    assert.equal(previewData.link.targetUrl, undefined, 'targetUrl leaked in API response!');
    console.log('✅ API payload is secure. No sensitive data leaked.');

    // 3. Test Redirect Endpoint Security (Conditional Redirects with Password)
    console.log('\nTesting Redirect Endpoint Security...');
    
    // 3a. Test bypass without password
    const bypassRes = await fetch(`${BASE_URL}/r/${link.slug}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0) Mobile/15E148 Safari/604.1' },
      redirect: 'manual' 
    });
    
    // Should intercept and redirect to frontend password prompt
    assert.equal(bypassRes.status, 302, `Expected 302, got ${bypassRes.status}`);
    assert.ok(bypassRes.headers.get('location').includes('localhost:5173'), 'Bypass attempt did not redirect to frontend');
    console.log('✅ Unauthorized backend bypass blocked successfully.');
    
    // 3b. Test legitimate access with password via query param
    const authRedirectRes = await fetch(`${BASE_URL}/r/${link.slug}?pwd=secretpassword`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0) Mobile/15E148 Safari/604.1' },
      redirect: 'manual' 
    });
    
    assert.equal(authRedirectRes.status, 302, `Expected 302, got ${authRedirectRes.status}`);
    assert.equal(authRedirectRes.headers.get('location'), 'https://example.com/mobile', 'Conditional device routing failed');
    console.log('✅ Authenticated conditional redirect successful.');

    // 4. Test One-Time / Max Clicks Limit (Second click should fail)
    console.log('\nTesting One-Time / Max Clicks Limit...');
    const redirectRes2 = await fetch(`${BASE_URL}/r/${link.slug}?pwd=secretpassword`, {
      redirect: 'manual'
    });
    
    assert.equal(redirectRes2.status, 410, `Expected 410 Gone, got ${redirectRes2.status}`);
    console.log('✅ Max Clicks / One-time limit correctly enforced.');

    // 5. Test Public Link Fetching
    const publicLinksRes = await fetch(`${BASE_URL}/api/links/public`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const publicLinks = await publicLinksRes.json();
    assert.ok(Array.isArray(publicLinks), 'Public links should return an array');
    console.log('✅ Public links fetch successful.');

    // 6. Cleanup (Delete the link and user)
    console.log('\nCleaning up test data...');
    const delRes = await fetch(`${BASE_URL}/api/links/${link._id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    assert.ok(delRes.ok, `Link deletion failed with status ${delRes.status}`);
    await User.findByIdAndDelete(user._id);
    console.log('✅ Cleanup successful.');

    console.log('\n--- All Core Features Verified Successfully ---');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
  } finally {
    mongoose.disconnect();
  }
}

runTests();
