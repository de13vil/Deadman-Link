// server/routes/redirectRoutes.js
const express = require('express');
const router = express.Router();
const Link = require('../models/Link');
const AnalyticsEvent = require('../models/AnalyticsEvent');
const { getClientIp } = require('../utils/getClientIp');

router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const link = await Link.findOne({ slug });

    if (!link) {
      return res.status(404).send('Link not found');
    }

    // scheduled activation
    if (link.scheduleStart && link.scheduleStart > new Date()) {
      return res.status(404).send('Link not active yet');
    }

    // expiry
    if (link.expiresAt && link.expiresAt < new Date()) {
      return res.status(410).send('This link has expired');
    }

    // max clicks & one-time
    const currentClicks = link.clicks ?? link.clickCount ?? 0;
    const effectiveLimit = link.isOneTime ? 1 : link.maxClicks || 0;
    console.log(`[DEBUG] slug=${link.slug} currentClicks=${currentClicks} effectiveLimit=${effectiveLimit} isOneTime=${link.isOneTime}`);
    
    if (effectiveLimit > 0 && currentClicks >= effectiveLimit) {
      return res.status(410).send('This link has been destroyed');
    }

    if (link.password) {
      const pwd = req.query.pwd;
      if (pwd !== link.password) {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        return res.redirect(`${frontendUrl}/${link.slug}`);
      }
    }

    // bump click count
    link.clicks = currentClicks + 1;
    await link.save();

    // Track analytics so the admin overview chart can reflect user-side clicks
    try {
      const geoip = require('geoip-lite');
      const UAParser = require('ua-parser-js');
      
      const clientIp = getClientIp(req);
      let geo = geoip.lookup(clientIp);
      
      let country = geo ? geo.country : 'Unknown';

      const userAgent = req.headers['user-agent'] || '';
      const parser = new UAParser(userAgent);
      let deviceType = parser.getDevice().type || 'desktop';
      const isBot = /bot|googlebot|crawler|spider|robot|crawling/i.test(userAgent);
      if (isBot) {
        deviceType = 'bot';
      } else if (!['desktop', 'mobile', 'tablet'].includes(deviceType)) {
        deviceType = 'unknown';
      }

      await AnalyticsEvent.create({
        link: link._id,
        slug: link.slug,
        ip: clientIp,
        userAgent: userAgent,
        deviceType: deviceType,
        country: country,
      });
    } catch (analyticsErr) {
      console.error('Failed to create analytics event:', analyticsErr.message || analyticsErr);
    }

    let finalTargetUrl = link.targetUrl;
    let conditionalApplied = false;

    // Check Conditional Redirects
    if (link.conditionalRedirect && link.conditionalRedirect.enabled) {
      const cond = link.conditionalRedirect;
      const ua = req.headers['user-agent'] || '';
      
      // 1. Click rules
      if (!conditionalApplied && cond.clickRules && cond.clickRules.length > 0) {
        for (const rule of cond.clickRules) {
          if (currentClicks >= rule.minClicks && (rule.maxClicks === null || currentClicks <= rule.maxClicks)) {
            finalTargetUrl = rule.url;
            conditionalApplied = true;
            break;
          }
        }
      }

      // 2. Day rules (weekend vs weekday)
      if (!conditionalApplied && cond.dayTypeRules) {
        const day = new Date().getDay(); // 0 = Sunday, 6 = Saturday
        const isWeekend = day === 0 || day === 6;
        if (isWeekend && cond.dayTypeRules.weekendUrl) {
          finalTargetUrl = cond.dayTypeRules.weekendUrl;
          conditionalApplied = true;
        } else if (!isWeekend && cond.dayTypeRules.weekdayUrl) {
          finalTargetUrl = cond.dayTypeRules.weekdayUrl;
          conditionalApplied = true;
        }
      }

      // 3. Time of day rules
      if (!conditionalApplied && cond.timeOfDayRules && cond.timeOfDayRules.length > 0) {
        const currentHour = new Date().getUTCHours();
        for (const rule of cond.timeOfDayRules) {
          if (currentHour >= rule.startHour && currentHour <= rule.endHour) {
            finalTargetUrl = rule.url;
            conditionalApplied = true;
            break;
          }
        }
      }

      // 4. Device rules
      if (!conditionalApplied && cond.deviceRules) {
        const UAParser = require('ua-parser-js');
        const parser = new UAParser(ua);
        const deviceType = parser.getDevice().type || 'desktop';
        const isBot = /bot|googlebot|crawler|spider|robot|crawling/i.test(ua);

        if (isBot && cond.deviceRules.botUrl) {
          finalTargetUrl = cond.deviceRules.botUrl;
          conditionalApplied = true;
        } else if (deviceType === 'mobile' && cond.deviceRules.mobileUrl) {
          finalTargetUrl = cond.deviceRules.mobileUrl;
          conditionalApplied = true;
        } else if (deviceType === 'tablet' && cond.deviceRules.tabletUrl) {
          finalTargetUrl = cond.deviceRules.tabletUrl;
          conditionalApplied = true;
        } else if ((deviceType === 'desktop' || deviceType === 'console') && cond.deviceRules.desktopUrl) {
          finalTargetUrl = cond.deviceRules.desktopUrl;
          conditionalApplied = true;
        }
      }
    }

    // Check Webhooks
    const { dispatchWebhook } = require('../services/webhookService');
    
    // First click?
    if (currentClicks === 0) {
      dispatchWebhook(link, 'onFirstClick', { ip: getClientIp(req), userAgent: req.headers['user-agent'] });
    }

    // One-time complete?
    if (link.isOneTime) {
      // It's the first (and only) click, so it's complete
      dispatchWebhook(link, 'onOneTimeComplete');
    } else if (link.maxClicks != null && link.maxClicks !== 0 && (currentClicks + 1) >= link.maxClicks) {
      // Reached max clicks on this run
      dispatchWebhook(link, 'onOneTimeComplete');
    }

    // later: if showPreview is true, you could return JSON instead of redirect
    return res.redirect(finalTargetUrl);
  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong');
  }
});

module.exports = router;
