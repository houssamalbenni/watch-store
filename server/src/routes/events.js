/**
 * Events Routes - Meta Pixel and Conversion API endpoints
 * 
 * Routes:
 * POST   /api/events/track         - Track single event
 * POST   /api/events/purchase      - Track purchase (conversion)
 * POST   /api/events/batch         - Batch track events
 * GET    /api/events/status        - Check tracking status
 * POST   /api/events/retry-queue   - Retry queued events (admin)
 */

import express from 'express';
import {
  trackEvent,
  trackPurchase,
  trackBatchEvents,
  getTrackingStatus,
  retryQueuedEvents,
} from '../controllers/eventsController.js';

const router = express.Router();

/**
 * Track single event
 * Body: { eventName, eventData, eventId, timestamp }
 */
router.post('/track', trackEvent);

/**
 * Track purchase event (conversion)
 * Body: { orderId, items, value, currency, eventId }
 */
router.post('/purchase', trackPurchase);

/**
 * Batch track events
 * Body: { events: [{ eventName, eventData, eventId }, ...] }
 */
router.post('/batch', trackBatchEvents);

/**
 * Get tracking service status
 */
router.get('/status', getTrackingStatus);

/**
 * Retry queued events (admin only)
 */
router.post('/retry-queue', retryQueuedEvents);

export default router;
