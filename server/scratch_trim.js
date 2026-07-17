require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const AnalyticsEvent = require('./models/AnalyticsEvent');
  const eventsL = await AnalyticsEvent.find({ slug: 'lklndkoewn' }).sort({createdAt: 1});
  if (eventsL.length > 4) {
    const toDelete = eventsL.slice(4).map(e => e._id);
    await AnalyticsEvent.deleteMany({ _id: { $in: toDelete } });
    console.log('Deleted', toDelete.length, 'excess events');
  }
  mongoose.disconnect();
}).catch(e => console.log('error', e));
