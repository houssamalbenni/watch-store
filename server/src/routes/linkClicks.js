/**
 * Link Click Routes
 * POST   /api/link-clicks/track    - Track a link click
 * GET    /api/link-clicks          - Get all link clicks
 * GET    /api/link-clicks/stats    - Get link click statistics
 * DELETE /api/link-clicks          - Reset all link clicks (admin)
 * DELETE /api/link-clicks/:id      - Delete specific link click (admin)
 */

import express from 'express';
import {
  trackLinkClick,
  getLinkClicks,
  getLinkClickStats,
  resetLinkClicks,
  deleteLinkClick,
} from '../controllers/linkClickController.js';

const router = express.Router();

/**
 * Track a link click (public, can be called from frontend)
 */
router.post('/track', trackLinkClick);

/**
 * Get all link clicks with filters
 */
router.get('/', getLinkClicks);

/**
 * Get link click statistics
 */
router.get('/stats', getLinkClickStats);

/**
 * Reset all link clicks (admin only)
 */
router.delete('/', resetLinkClicks);

/**
 * Delete specific link click (admin only)
 */
router.delete('/:id', deleteLinkClick);

export default router;
