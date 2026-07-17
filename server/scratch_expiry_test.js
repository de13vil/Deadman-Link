require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');

const URL = 'http://localhost:5050';

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const Link = require('./models/Link');

  // 1. Scheduled Link
  const scheduledSlug = 'test-scheduled-' + Date.now();
  await Link.create({
    slug: scheduledSlug,
    targetUrl: 'https://example.com',
    scheduleStart: new Date(Date.now() + 3600 * 1000), // 1 hr future
  });

  // 2. Expired Link
  const expiredSlug = 'test-expired-' + Date.now();
  await Link.create({
    slug: expiredSlug,
    targetUrl: 'https://example.com',
    expiresAt: new Date(Date.now() - 3600 * 1000), // 1 hr past
  });

  // 3. One-Time Link
  const oneTimeSlug = 'test-onetime-' + Date.now();
  await Link.create({
    slug: oneTimeSlug,
    targetUrl: 'https://example.com',
    isOneTime: true,
  });

  console.log('--- Testing Scheduled Link ---');
  try {
    await axios.get(`${URL}/${scheduledSlug}`);
  } catch (err) {
    console.log('Scheduled response:', err.response.status, err.response.data);
  }

  console.log('--- Testing Expired Link ---');
  try {
    await axios.get(`${URL}/${expiredSlug}`);
  } catch (err) {
    console.log('Expired response:', err.response.status, err.response.data);
  }

  console.log('--- Testing One-Time Link ---');
  try {
    const res1 = await axios.get(`${URL}/${oneTimeSlug}`, { maxRedirects: 0, validateStatus: () => true });
    console.log('One-Time Click 1 Status:', res1.status);
    
    const res2 = await axios.get(`${URL}/${oneTimeSlug}`, { maxRedirects: 0, validateStatus: () => true });
    console.log('One-Time Click 2 Status:', res2.status, res2.data);
  } catch (err) {
    console.log('OneTime error:', err.message);
  }

  // Cleanup
  await Link.deleteMany({ slug: { $in: [scheduledSlug, expiredSlug, oneTimeSlug] } });
  
  mongoose.disconnect();
}).catch(e => console.log('error', e));
