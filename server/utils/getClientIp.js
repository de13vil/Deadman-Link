// server/utils/getClientIp.js
const os = require('os');

/**
 * Get the real client IP address, with better formatting for audit logs
 * Checks multiple sources to ensure IP is captured correctly
 */
function getClientIp(req) {
  // Try multiple sources
  let ip = req.ip 
    || req.headers['x-forwarded-for']?.split(',')[0]?.trim()
    || req.headers['x-real-ip']
    || req.connection.remoteAddress
    || req.socket.remoteAddress
    || 'unknown';

  // Clean up IPv6-mapped IPv4 addresses
  if (ip.startsWith('::ffff:')) {
    ip = ip.substring(7);
  }

  // If localhost, show actual network IP for better visibility
  if (ip === '::1' || ip === '127.0.0.1' || ip === 'localhost') {
    const networkIp = getLocalNetworkIp();
    if (networkIp) {
      return `${ip} (${networkIp})`;
    }
  }

  return ip;
}

/**
 * Get the local network IP address of the server
 */
function getLocalNetworkIp() {
  const nets = os.networkInterfaces();
  
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip internal (loopback) and non-IPv4 addresses
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  
  return null;
}

module.exports = { getClientIp };
