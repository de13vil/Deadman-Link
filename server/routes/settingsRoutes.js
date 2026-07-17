// server/routes/settingsRoutes.js
const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Link = require('../models/Link');
const AnalyticsEvent = require('../models/AnalyticsEvent');

const router = express.Router();

// user is guaranteed to exist since route is authenticated

/**
 * GET /api/settings?email=...
 * Returns profile + all settings for a user.
 */
router.get('/', async (req, res) => {
  try {
    const email = req.user.email;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const notif = user.notificationSettings || {};
    const def = user.defaultSettings || {};
    const privacy = user.privacy || {};
    const sec = user.securitySettings || {};
    const auto = user.autoDestructRules || {};

    res.json({
      name: user.name,
      email: user.email,
      avatarColor: user.avatarColor,
      timezone: user.timezone,

      notifications: {
        emailOnDestruction: notif.emailOnDestruction ?? true,
        suspiciousActivity: notif.suspiciousActivity ?? true,
      },

      defaultSettings: {
        collection: def.collection ?? 'General',
        showPreview: def.showPreview ?? true,
        maxClicks: def.maxClicks ?? 0,
        isOneTime: def.isOneTime ?? false,
      },

      privacy: {
        showCreatorName: privacy.showCreatorName ?? true,
        enableReferrerTracking: privacy.enableReferrerTracking ?? true,
        // NEW
        allowLinkSuggestions: privacy.allowLinkSuggestions ?? true,
      },

      securitySettings: {
        notifyNewDevice: sec.notifyNewDevice ?? true,
        notifyFailedAttempt: sec.notifyFailedAttempt ?? true,
      },

      autoDestructRules: {
        expireAfterDays: auto.expireAfterDays ?? null,
        destroyOnFirstClick: auto.destroyOnFirstClick ?? false,
      },

      twoFactorEnabled: user.twoFactorEnabled ?? false,

      sessions: user.sessions || [],
    });
  } catch (err) {
    console.error('Error in GET /api/settings:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// (profile, notifications, password routes stay the same)

/**
 * PUT /api/settings/preferences
 * Body:
 * {
 *   email,
 *   avatarColor?,
 *   timezone?,
 *   defaultSettings: { collection, showPreview, maxClicks, isOneTime },
 *   privacy: { showCreatorName, enableReferrerTracking, allowLinkSuggestions },
 *   autoDestructRules: { expireAfterDays, destroyOnFirstClick }
 * }
 */
router.put('/preferences', async (req, res) => {
  try {
    const email = req.user.email;
    const { avatarColor, timezone, defaultSettings, privacy, autoDestructRules } = req.body || {};
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (avatarColor !== undefined) user.avatarColor = avatarColor;
    if (timezone !== undefined) user.timezone = timezone;

    if (defaultSettings) {
      const currentDefault = user.defaultSettings || {};
      user.defaultSettings = {
        collection:
          defaultSettings.collection ??
          currentDefault.collection ??
          'General',
        showPreview:
          defaultSettings.showPreview ??
          currentDefault.showPreview ??
          true,
        maxClicks:
          defaultSettings.maxClicks ?? currentDefault.maxClicks ?? 0,
        isOneTime:
          defaultSettings.isOneTime ??
          currentDefault.isOneTime ??
          false,
      };
    }

    if (privacy) {
      const currentPrivacy = user.privacy || {};
      user.privacy = {
        showCreatorName:
          privacy.showCreatorName ??
          currentPrivacy.showCreatorName ??
          true,
        enableReferrerTracking:
          privacy.enableReferrerTracking ??
          currentPrivacy.enableReferrerTracking ??
          true,
        // NEW: allow suggestions toggle
        allowLinkSuggestions:
          privacy.allowLinkSuggestions ??
          currentPrivacy.allowLinkSuggestions ??
          true,
      };
    }

    if (autoDestructRules) {
      const currentAuto = user.autoDestructRules || {};
      user.autoDestructRules = {
        expireAfterDays:
          autoDestructRules.expireAfterDays ??
          currentAuto.expireAfterDays ??
          null,
        destroyOnFirstClick:
          autoDestructRules.destroyOnFirstClick ??
          currentAuto.destroyOnFirstClick ??
          false,
      };
    }

    await user.save();

    res.json({
      message: 'Preferences updated',
    });
  } catch (err) {
    console.error('Error in PUT /api/settings/preferences:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * PUT /api/settings/profile
 * Body: { email, name, avatarColor?, timezone? }
 */
router.put('/profile', async (req, res) => {
  try {
    const email = req.user.email;
    const { name, avatarColor, timezone } = req.body || {};
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'name is required' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.name = name.trim();

    if (avatarColor !== undefined) user.avatarColor = avatarColor;
    if (timezone !== undefined) user.timezone = timezone;

    await user.save();

    res.json({
      message: 'Profile updated',
      user: {
        name: user.name,
        email: user.email,
        avatarColor: user.avatarColor,
        timezone: user.timezone,
      },
    });
  } catch (err) {
    console.error('Error in PUT /api/settings/profile:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * PUT /api/settings/notifications
 * Body: { email, notifications: { emailOnDestruction, suspiciousActivity } }
 */
router.put('/notifications', async (req, res) => {
  try {
    const email = req.user.email;
    const { notifications } = req.body || {};
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const current = user.notificationSettings || {};

    if (notifications) {
      user.notificationSettings = {
        emailOnDestruction:
          notifications.emailOnDestruction ??
          current.emailOnDestruction ??
          true,
        suspiciousActivity:
          notifications.suspiciousActivity ??
          current.suspiciousActivity ??
          true,
      };
    }

    await user.save();

    res.json({
      message: 'Notifications updated',
      notifications: user.notificationSettings,
    });
  } catch (err) {
    console.error('Error in PUT /api/settings/notifications:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * PUT /api/settings/password
 * Body: { email, currentPassword, newPassword }
 */
router.put('/password', async (req, res) => {
  try {
    const email = req.user.email;
    const { currentPassword, newPassword } = req.body || {};
    
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.passwordHash) {
      const currentOk = currentPassword
        ? await bcrypt.compare(currentPassword, user.passwordHash)
        : false;

      if (!currentOk) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.authProvider = user.authProvider || 'local';
    await user.save();

    res.json({ message: 'Password updated' });
  } catch (err) {
    console.error('Error in PUT /api/settings/password:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * PUT /api/settings/security-advanced
 * Body: { email, twoFactorEnabled, securitySettings: { notifyNewDevice, notifyFailedAttempt } }
 */
router.put('/security-advanced', async (req, res) => {
  try {
    const email = req.user.email;
    const { twoFactorEnabled, securitySettings } = req.body || {};
    
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (twoFactorEnabled !== undefined) {
      user.twoFactorEnabled = !!twoFactorEnabled;
    }

    if (securitySettings) {
      user.securitySettings = {
        notifyNewDevice:
          securitySettings.notifyNewDevice ??
          user.securitySettings.notifyNewDevice ??
          true,
        notifyFailedAttempt:
          securitySettings.notifyFailedAttempt ??
          user.securitySettings.notifyFailedAttempt ??
          true,
      };
    }

    await user.save();

    res.json({
      message: 'Security settings updated',
      twoFactorEnabled: user.twoFactorEnabled,
      securitySettings: user.securitySettings,
    });
  } catch (err) {
    console.error('Error in PUT /api/settings/security-advanced:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * GET /api/settings/export?email=...
 * Returns user + their links + analytics events
 */
router.get('/export', async (req, res) => {
  try {
    const email = req.user.email;
    const user = await User.findOne({ email });
    const links = await Link.find({ ownerEmail: email });
    const events = await AnalyticsEvent.find({
      slug: { $in: links.map((l) => l.slug) },
    });

    res.json({
      user,
      links,
      analyticsEvents: events,
    });
  } catch (err) {
    console.error('Error in GET /api/settings/export:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * POST /api/settings/reset-data
 * Body: { email }
 * Deletes all links (and analytics) for that user, but keeps account.
 */
router.post('/reset-data', async (req, res) => {
  try {
    const email = req.user.email;

    const links = await Link.find({ ownerEmail: email });
    const slugs = links.map((l) => l.slug);

    await Link.deleteMany({ ownerEmail: email });
    await AnalyticsEvent.deleteMany({ slug: { $in: slugs } });

    res.json({ message: 'All your links and analytics were deleted.' });
  } catch (err) {
    console.error('Error in POST /api/settings/reset-data:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * DELETE /api/settings/delete-account
 * Body: { email }
 * Deletes user + their links + analytics.
 */
router.delete('/delete-account', async (req, res) => {
  try {
    const email = req.user.email;

    const links = await Link.find({ ownerEmail: email });
    const slugs = links.map((l) => l.slug);

    await Link.deleteMany({ ownerEmail: email });
    await AnalyticsEvent.deleteMany({ slug: { $in: slugs } });
    await User.deleteOne({ email });

    res.json({ message: 'Account and all data deleted.' });
  } catch (err) {
    console.error('Error in DELETE /api/settings/delete-account:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
