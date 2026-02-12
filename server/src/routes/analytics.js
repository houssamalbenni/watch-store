import express from 'express';
import { trackPageView, getVisitorStats, getPageViews } from '../controllers/analyticsController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   POST /api/analytics/track
 * @desc    Track a page view
 * @access  Public
 */
router.post('/track', trackPageView);

/**
 * @route   GET /api/analytics/stats
 * @desc    Get visitor statistics
 * @access  Private/Admin
 */
router.get('/stats', authenticate, requireAdmin, getVisitorStats);

/**
 * @route   GET /api/analytics/views
 * @desc    Get all page views (paginated)
 * @access  Private/Admin
 */
router.get('/views', authenticate, requireAdmin, getPageViews);

export default router;
