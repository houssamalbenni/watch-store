/**
 * Link Click Controller - Handle link click tracking and analytics
 */

import LinkClick from '../models/LinkClick.js';
import logger from '../config/logger.js';

/**
 * POST /api/link-clicks/track
 * Track a link click event
 */
export const trackLinkClick = async (req, res) => {
  try {
    const {
      linkType,
      productId,
      productName,
      destination,
      source,
    } = req.body;

    // Validate required fields
    if (!linkType || !['whatsapp', 'email', 'phone', 'inquiry_form', 'other'].includes(linkType)) {
      return res.status(400).json({
        success: false,
        error: 'Valid linkType is required',
      });
    }

    // Create click record
    const clickRecord = await LinkClick.create({
      userId: req.user?.id || null,
      linkType,
      productId: productId || null,
      productName: productName || null,
      destination: destination || null,
      source: {
        page: source?.page || req.headers.referer || 'unknown',
        referrer: source?.referrer || null,
      },
      userAgent: req.headers['user-agent'],
      ipAddress:
        req.headers['x-forwarded-for']?.split(',')[0].trim() ||
        req.socket.remoteAddress ||
        'unknown',
    });

    logger.info('Link click tracked', {
      linkType,
      productId,
      userId: req.user?.id || 'anonymous',
    });

    res.json({
      success: true,
      data: clickRecord,
    });
  } catch (error) {
    logger.error('Link click tracking error', {
      error: error.message,
      body: req.body,
    });

    res.status(500).json({
      success: false,
      error: 'Failed to track link click',
    });
  }
};

/**
 * GET /api/link-clicks
 * Get all link clicks with filters and pagination
 */
export const getLinkClicks = async (req, res) => {
  try {
    const {
      linkType,
      productId,
      startDate,
      endDate,
      page = 1,
      limit = 50,
    } = req.query;

    // Build filter
    const filter = {};

    if (linkType) {
      filter.linkType = linkType;
    }

    if (productId) {
      filter.productId = productId;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get clicks
    const clicks = await LinkClick.find(filter)
      .populate('productId', 'name')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await LinkClick.countDocuments(filter);

    res.json({
      success: true,
      data: clicks,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    logger.error('Get link clicks error', {
      error: error.message,
      query: req.query,
    });

    res.status(500).json({
      success: false,
      error: 'Failed to get link clicks',
    });
  }
};

/**
 * GET /api/link-clicks/stats
 * Get link click statistics
 */
export const getLinkClickStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const filter = {};

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    // Stats by link type
    const byType = await LinkClick.aggregate([
      { $match: filter },
      { $group: { _id: '$linkType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Total clicks
    const total = await LinkClick.countDocuments(filter);

    // Clicks by date (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const byDate = await LinkClick.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Top products
    const topProducts = await LinkClick.aggregate([
      { $match: filter },
      { $match: { productId: { $ne: null } } },
      {
        $group: {
          _id: '$productId',
          productName: { $first: '$productName' },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    res.json({
      success: true,
      data: {
        total,
        byType,
        byDate,
        topProducts,
      },
    });
  } catch (error) {
    logger.error('Get link click stats error', {
      error: error.message,
    });

    res.status(500).json({
      success: false,
      error: 'Failed to get statistics',
    });
  }
};

/**
 * DELETE /api/link-clicks
 * Reset (delete) all link clicks
 * Admin only
 */
export const resetLinkClicks = async (req, res) => {
  try {
    // Check admin permission
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required',
      });
    }

    const result = await LinkClick.deleteMany({});

    logger.info('Link clicks reset', {
      deletedCount: result.deletedCount,
      admin: req.user.email,
    });

    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} link click records`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    logger.error('Reset link clicks error', {
      error: error.message,
    });

    res.status(500).json({
      success: false,
      error: 'Failed to reset link clicks',
    });
  }
};

/**
 * DELETE /api/link-clicks/:id
 * Delete a specific link click record
 */
export const deleteLinkClick = async (req, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required',
      });
    }

    const { id } = req.params;

    const click = await LinkClick.findByIdAndDelete(id);

    if (!click) {
      return res.status(404).json({
        success: false,
        error: 'Link click record not found',
      });
    }

    logger.info('Link click deleted', { id, deletedBy: req.user.email });

    res.json({
      success: true,
      message: 'Link click record deleted',
    });
  } catch (error) {
    logger.error('Delete link click error', {
      error: error.message,
      id: req.params.id,
    });

    res.status(500).json({
      success: false,
      error: 'Failed to delete link click',
    });
  }
};

export default {
  trackLinkClick,
  getLinkClicks,
  getLinkClickStats,
  resetLinkClicks,
  deleteLinkClick,
};
