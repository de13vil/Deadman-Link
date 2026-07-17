// server/services/webhookService.js

/**
 * Dispatches a webhook securely
 * @param {Object} link - The link document
 * @param {String} trigger - The event trigger name (e.g., 'onFirstClick', 'onOneTimeComplete', 'onExpiry')
 * @param {Object} eventData - Additional data to send in the payload
 */
async function dispatchWebhook(link, trigger, eventData = {}) {
  try {
    const config = link.webhookConfig;
    if (!config || !config.enabled || !config.url) return;

    // Check if this specific trigger is enabled
    if (!config.triggers || !config.triggers[trigger]) return;

    const payload = {
      event: trigger,
      linkId: link._id,
      slug: link.slug,
      targetUrl: link.targetUrl,
      timestamp: new Date().toISOString(),
      ...eventData,
    };

    const headers = {
      'Content-Type': 'application/json',
      'User-Agent': 'Deadman-Link-Webhook-Agent',
    };

    if (config.secret) {
      headers['X-Deadman-Signature'] = config.secret;
    }

    // Fire and forget (don't block the request)
    fetch(config.url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    }).catch(err => {
      console.error(`[Webhook] Failed to dispatch ${trigger} for ${link.slug}:`, err.message);
    });

  } catch (err) {
    console.error(`[Webhook] Error preparing dispatch for ${link.slug}:`, err);
  }
}

module.exports = {
  dispatchWebhook
};
