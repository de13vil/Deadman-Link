// server/scripts/auditLogger.js
const AuditLog = require('../models/AuditLog');

function normalizeIp(ip) {
  if (!ip) return null;

  let value = Array.isArray(ip) ? ip[0] : String(ip);

  // If coming as "ip1, ip2, ..." from proxies -> take first
  value = value.split(',')[0].trim();

  // Strip IPv6-mapped IPv4 prefix
  if (value.startsWith('::ffff:')) {
    value = value.slice('::ffff:'.length);
  }

  // Just in case it's "::1" (localhost IPv6)
  if (value === '::1') {
    value = '127.0.0.1';
  }

  return value;
}

async function logAuditEvent({
  action,
  target,
  adminId = null,
  adminEmail = 'system@deadman.link',
  adminName = 'System',
  ipAddress = '127.0.0.1',
  metadata = {},
}) {
  try {
    const normalizedIp = normalizeIp(ipAddress);
    // Use a fallback adminId if not provided, or it will crash.
    // In production, endpoints should always provide req.user.sub.
    const fallbackId = adminId || new (require('mongoose').Types.ObjectId)();

    await AuditLog.create({
      action,
      target,
      adminId: fallbackId,
      adminName,
      adminEmail,
      ip: normalizedIp || '127.0.0.1',
      details: metadata,
    });
  } catch (err) {
    console.error('Failed to create audit log:', err.message);
  }
}

module.exports = { logAuditEvent };
