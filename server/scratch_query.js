require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const Link = require('./models/Link');
  const AnalyticsEvent = require('./models/AnalyticsEvent');
  
  const links = await Link.find({ ownerEmail: 'cooldivyanshmeena44@gmail.com' });
  for (let l of links) {
    const events = await AnalyticsEvent.countDocuments({ link: l._id });
    if (l.clicks > 0 || events > 0) {
      console.log(`Slug: ${l.slug} | Link Clicks: ${l.clicks} | Analytics Events: ${events} | Created: ${l.createdAt}`);
    }
  }
  mongoose.disconnect();
}).catch(e => console.log('error', e));
