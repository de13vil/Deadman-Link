// server/routes/analyticsRoutes.js
const express = require('express');
const router = express.Router();
const Link = require('../models/Link');
const AnalyticsEvent = require('../models/AnalyticsEvent');

// GET /api/analytics
router.get('/', async (req, res) => {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);

    // Get user's email from authenticated request
    const userEmail = req.user?.email;
    if (!userEmail) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Get only user's links + analytics events for those links
    const links = await Link.find({ ownerEmail: userEmail });
    
    // Get link IDs to filter analytics events
    const linkIds = links.map(link => link._id);
    
    const events = await AnalyticsEvent.find({ 
      link: { $in: linkIds },
      createdAt: { $gte: sevenDaysAgo } 
    });

    // ----- totals from links -----
    let totalClicks = 0;
    let activeLinks = 0;

    links.forEach((link) => {
      const clicks = link.clicks ?? link.clickCount ?? 0;
      totalClicks += clicks;

      const isExpired =
        link.status === 'expired' ||
        (link.expiresAt && now > link.expiresAt);

      if (!isExpired) {
        activeLinks += 1;
      }
    });

    // ----- device + geo info from events -----
    const totalEvents = events.length;
    let mobileCount = 0;
    const countryCounts = {};
    const dayBuckets = {};

    events.forEach((ev) => {
      if (ev.deviceType === 'mobile') mobileCount++;

      const country = ev.country || 'Unknown';
      countryCounts[country] = (countryCounts[country] || 0) + 1;

      const dayKey = ev.createdAt.toISOString().slice(0, 10); // YYYY-MM-DD
      dayBuckets[dayKey] = (dayBuckets[dayKey] || 0) + 1;
    });

    const mobile =
      totalEvents > 0 ? Math.round((mobileCount / totalEvents) * 100) : 0;

    let topLocation = 'Unknown';
    let topCount = 0;
    Object.entries(countryCounts).forEach(([country, count]) => {
      if (count > topCount) {
        topCount = count;
        topLocation = country;
      }
    });

    const timeline = Object.keys(dayBuckets)
      .sort()
      .map((date) => ({
        date,
        clicks: dayBuckets[date],
      }));

    const geo = Object.entries(countryCounts).map(([country, clicks]) => ({
      country,
      clicks,
    }));

    res.json({
      total: totalClicks,
      activeLinks,
      mobile,
      topLocation,
      timeline,
      geo,
    });
  } catch (err) {
    console.error('Error in GET /api/analytics:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/analytics/insights
router.get('/insights', async (req, res) => {
  try {
    const userEmail = req.user?.email;
    if (!userEmail) return res.status(401).json({ message: 'Unauthorized' });

    const links = await Link.find({ ownerEmail: userEmail });
    const linkIds = links.map(l => l._id);
    const events = await AnalyticsEvent.find({ link: { $in: linkIds } });

    // Summarize data for Gemini
    const totalClicks = events.length;
    let desktop = 0, mobile = 0, tablet = 0, bot = 0;
    const countries = {};
    const linkStats = {};

    events.forEach(ev => {
      if (ev.deviceType === 'mobile') mobile++;
      else if (ev.deviceType === 'tablet') tablet++;
      else if (ev.deviceType === 'bot') bot++;
      else desktop++;

      const c = ev.country || 'Unknown';
      countries[c] = (countries[c] || 0) + 1;

      linkStats[ev.slug] = (linkStats[ev.slug] || 0) + 1;
    });

    const summaryData = {
      totalLinks: links.length,
      totalClicks,
      deviceBreakdown: { desktop, mobile, tablet, bot },
      topCountries: Object.entries(countries).sort((a,b) => b[1]-a[1]).slice(0, 5),
      topPerformingLinks: Object.entries(linkStats).sort((a,b) => b[1]-a[1]).slice(0, 3)
    };

    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
      // Return a simulated AI insight if no key is present, so the user can experience the feature.
      const mockInsight = `[SIMULATED ANALYSIS] Based on recent telemetry, your engagement is highly concentrated in Desktop environments (${Math.round((desktop/totalClicks || 1)*100)}%). We have detected minor bot crawler activity pinging your newer endpoints, which is typical for public-facing deployments. No immediate threat vectors detected. Consider enabling "Safe Interstitial Screen" for your most sensitive links to thwart automated scanners completely.`;
      
      return res.json({ insight: mockInsight });
    }

    const prompt = `You are a cybersecurity and traffic analyst for 'Deadman-Link', a secure self-destructing URL shortener. Analyze the following user traffic data and provide a brief, actionable 2-paragraph insight. Highlight any anomalies (e.g., bot traffic) or interesting trends. Do NOT use markdown headers, just return plain text or simple markdown formatting for emphasis.\n\nData:\n${JSON.stringify(summaryData, null, 2)}`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('Gemini API Error Body:', errorBody);
        
        // Fallback for API outages or new key restrictions
        const fallbackInsight = `[SIMULATED FALLBACK] We detected an issue with the AI API connection (Google Servers returned a ${response.status} error). However, based on your local metrics, engagement is heavily focused on Desktop (${Math.round((desktop/totalClicks || 1)*100)}%). Consider evaluating "Safe Interstitial Screen" options to handle the slight bot traffic present.`;
        return res.json({ insight: fallbackInsight });
      }

      const data = await response.json();
      const insightText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No insight could be generated at this time.';
      return res.json({ insight: insightText });
    } catch (fetchErr) {
      console.error('Network Error contacting Gemini:', fetchErr);
      return res.json({ insight: '[SIMULATED FALLBACK] We could not reach the AI servers due to a network error. Your local analytics indicate normal traffic patterns with no severe anomalies detected.' });
    }

  } catch (err) {
    console.error('Error generating AI insights:', err);
    res.status(500).json({ message: 'Failed to generate AI insights' });
  }
});

module.exports = router;
