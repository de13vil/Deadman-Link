require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const Link = require('./models/Link');
  const AnalyticsEvent = require('./models/AnalyticsEvent');
  
  const links = await Link.find({});
  for (let l of links) {
    const count = await AnalyticsEvent.countDocuments({ link: l._id });
    if (l.clicks !== count) {
      await Link.updateOne({ _id: l._id }, { $set: { clicks: count } });
      console.log('Synced', l.slug, 'from', l.clicks, 'to', count);
    }
  }
  mongoose.disconnect();
}).catch(e => console.log('error', e));
