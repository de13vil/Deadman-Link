require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');

const URL = 'http://localhost:5050';

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const Link = require('./models/Link');

  // Device Link
  const deviceSlug = 'test-device-' + Date.now();
  await Link.create({
    slug: deviceSlug,
    targetUrl: 'https://example.com/desktop',
    conditionalRedirect: {
      enabled: true,
      deviceRules: {
        mobileUrl: 'https://example.com/mobile'
      }
    }
  });

  console.log('--- Testing Device Link ---');
  try {
    const resMobile = await axios.get(`${URL}/${deviceSlug}`, { 
      maxRedirects: 0, 
      validateStatus: () => true,
      headers: { 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)' }
    });
    console.log('Mobile Redirect Location:', resMobile.headers.location);

    const resDesktop = await axios.get(`${URL}/${deviceSlug}`, { 
      maxRedirects: 0, 
      validateStatus: () => true,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    console.log('Desktop Redirect Location:', resDesktop.headers.location);
  } catch (err) {
    console.log('Device error:', err.message);
  }

  // Cleanup
  await Link.deleteMany({ slug: { $in: [deviceSlug] } });
  
  mongoose.disconnect();
}).catch(e => console.log('error', e));
