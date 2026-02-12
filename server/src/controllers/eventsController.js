/**
 * Events Controller - Handles Meta Pixel and Conversion API tracking
 * POST /api/events/track - Track browser + server events
 * GET /api/events/status - Check event tracking status
 * POST /api/events/batch - Batch event tracking
 */

import MetaCAPITracker from '../lib/metaCAPITracker.js';
import logger from '../config/logger.js';

// Initialize CAPI tracker with credentials from environment
const metaCAPITracker = new MetaCAPITracker(
  process.env.META_ACCESS_TOKEN || '',
  process.env.META_PIXEL_ID || ''
);

/**
 * POST /api/events/track
 * Track individual event via browser or server
 * Auto-deduplicates using eventID
 */
export const trackEvent = async (req, res) => {
  try {
    const { eventName, eventData, eventId, timestamp } = req.body;

    // Validate required fields
    if (!eventName || !eventId) {
      return res.status(400).json({
        success: false,
        error: 'eventName and eventId are required',
      });
    }

    // Validate Meta access token
    if (!process.env.META_ACCESS_TOKEN || !process.env.META_PIXEL_ID) {
      logger.warn('Meta credentials not configured');
      return res.status(503).json({
        success: false,
        error: 'Meta tracking not configured',
      });
    }

    // Enrich event data with request context
    const enrichedEventData = {
      ...eventData,
      fbp: req.cookies?._fbp, // Facebook Pixel cookie
      fbclid: req.query?.fbclid, // Click ID from ads
    };

    // Track event via CAPI
    const result = await metaCAPITracker.trackEvent(
      eventName,
      enrichedEventData,
      eventId,
      req
    );

    // Log for analytics
    logger.info('Event tracked', {
      eventName,
      eventId,
      userId: req.user?.id || 'anonymous',
      timestamp,
      success: result.success,
    });

    res.json(result);
  } catch (error) {
    logger.error('Event tracking error', {
      error: error.message,
      body: req.body,
    });

    res.status(500).json({
      success: false,
      error: 'Failed to track event',
    });
  }
};

/**
 * POST /api/events/purchase
 * Special handler for purchase events (conversion)
 * Includes additional validation and logging
 */
export const trackPurchase = async (req, res) => {
  try {
    const { orderId, items, value, currency, eventId } = req.body;

    // Validate purchase data
    if (!orderId || !items?.length || !value || !eventId) {
      return res.status(400).json({
        success: false,
        error: 'orderId, items, value, and eventId are required',
      });
    }

    const purchaseData = {
      order_id: orderId,
      items: items.map(item => ({
        product_id: item.id,
        product_name: item.title,
        price: parseFloat(item.price),
        quantity: item.quantity || 1,
      })),
      total_value: parseFloat(value),
      currency: currency || 'USD',
      userId: req.user?.id,
      email: req.user?.email,
      timestamp: new Date().toISOString(),
    };

    // Track via CAPI
    const result = await metaCAPITracker.trackEvent(
      'Purchase',
      purchaseData,
      eventId,
      req
    );

    // Log conversion for analytics
    logger.info('Purchase event tracked', {
      orderId,
      userId: req.user?.id,
      amount: value,
      currency,
      eventId,
      success: result.success,
    });

    res.json(result);
  } catch (error) {
    logger.error('Purchase tracking error', {
      error: error.message,
      orderId: req.body?.orderId,
    });

    res.status(500).json({
      success: false,
      error: 'Failed to track purchase',
    });
  }
};

/**
 * POST /api/events/batch
 * Batch track multiple events (for bulk operations)
 */
export const trackBatchEvents = async (req, res) => {
  try {
    const { events } = req.body;

    if (!Array.isArray(events) || events.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'events array is required',
      });
    }

    if (events.length > 100) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 100 events per batch',
      });
    }

    // Track each event
    const results = await Promise.all(
      events.map(event =>
        metaCAPITracker.trackEvent(
          event.eventName,
          event.eventData,
          event.eventId,
          req
        )
      )
    );

    const successCount = results.filter(r => r.success).length;

    logger.info('Batch events tracked', {
      total: events.length,
      successful: successCount,
      failed: events.length - successCount,
    });

    res.json({
      success: true,
      total: events.length,
      successful: successCount,
      failed: events.length - successCount,
      results,
    });
  } catch (error) {
    logger.error('Batch tracking error', { error: error.message });

    res.status(500).json({
      success: false,
      error: 'Failed to track batch events',
    });
  }
};

/**
 * GET /api/events/status
 * Check tracking service status
 */
export const getTrackingStatus = async (req, res) => {
  try {
    const queuedCount = metaCAPITracker.getQueuedEvents().length;

    res.json({
      success: true,
      tracking: {
        pixelConfigured: !!process.env.META_PIXEL_ID,
        capiConfigured: !!process.env.META_ACCESS_TOKEN,
        queuedEvents: queuedCount,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error('Status check error', { error: error.message });

    res.status(500).json({
      success: false,
      error: 'Failed to get tracking status',
    });
  }
};

/**
 * POST /api/events/retry-queue
 * Manually retry queued events (admin function)
 * Protected - requires admin role
 */
export const retryQueuedEvents = async (req, res) => {
  try {
    // Check authorization (implement based on your auth system)
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required',
      });
    }

    const beforeCount = metaCAPITracker.getQueuedEvents().length;

    // Retry queued events
    await metaCAPITracker.retryQueuedEvents();

    const afterCount = metaCAPITracker.getQueuedEvents().length;

    logger.info('Queue retry completed', {
      before: beforeCount,
      processed: beforeCount - afterCount,
      remaining: afterCount,
    });

    res.json({
      success: true,
      processed: beforeCount - afterCount,
      remaining: afterCount,
    });
  } catch (error) {
    logger.error('Queue retry error', { error: error.message });

    res.status(500).json({
      success: false,
      error: 'Failed to retry queued events',
    });
  }
};

export default {
  trackEvent,
  trackPurchase,
  trackBatchEvents,
  getTrackingStatus,
  retryQueuedEvents,
};
