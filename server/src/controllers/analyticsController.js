import PageView from '../models/PageView.js';
import logger from '../config/logger.js';

/**
 * Track a page view
 */
export const trackPageView = async (req, res) => {
  try {
    const { visitorId, sessionId, page, referrer } = req.body;

    if (!visitorId || !sessionId || !page) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: visitorId, sessionId, page',
      });
    }

    // Detect device type from user agent
    const userAgent = req.headers['user-agent'] || '';
    const device = detectDevice(userAgent);
    const browser = detectBrowser(userAgent);
    const os = detectOS(userAgent);

    // Get IP address
    const ipAddress = req.ip || req.connection.remoteAddress || '';

    // Create page view record
    const pageView = await PageView.create({
      visitorId,
      sessionId,
      page,
      referrer: referrer || '',
      userAgent,
      device,
      browser,
      os,
      ipAddress,
      userId: req.user?.id || null,
    });

    logger.info(`Page view tracked: ${page} by visitor ${visitorId}`);

    res.status(201).json({
      success: true,
      data: {
        id: pageView._id,
        timestamp: pageView.createdAt,
      },
    });
  } catch (error) {
    logger.error('Error tracking page view:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track page view',
    });
  }
};

/**
 * Get visitor statistics
 */
export const getVisitorStats = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Total page views
    const totalViews = await PageView.countDocuments({
      createdAt: { $gte: startDate },
    });

    // Unique visitors
    const uniqueVisitors = await PageView.distinct('visitorId', {
      createdAt: { $gte: startDate },
    });

    // Unique sessions
    const uniqueSessions = await PageView.distinct('sessionId', {
      createdAt: { $gte: startDate },
    });

    // Views by day
    const viewsByDay = await PageView.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
          uniqueVisitors: { $addToSet: '$visitorId' },
        },
      },
      {
        $project: {
          date: '$_id',
          views: '$count',
          visitors: { $size: '$uniqueVisitors' },
        },
      },
      { $sort: { date: 1 } },
    ]);

    // Top pages
    const topPages = await PageView.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: '$page',
          views: { $sum: 1 },
          uniqueVisitors: { $addToSet: '$visitorId' },
        },
      },
      {
        $project: {
          page: '$_id',
          views: 1,
          visitors: { $size: '$uniqueVisitors' },
        },
      },
      { $sort: { views: -1 } },
      { $limit: 10 },
    ]);

    // Device breakdown
    const deviceBreakdown = await PageView.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: '$device',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Browser breakdown
    const browserBreakdown = await PageView.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: '$browser',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    // Today's stats
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayViews = await PageView.countDocuments({
      createdAt: { $gte: todayStart },
    });

    const todayVisitors = await PageView.distinct('visitorId', {
      createdAt: { $gte: todayStart },
    });

    res.json({
      success: true,
      data: {
        summary: {
          totalViews,
          uniqueVisitors: uniqueVisitors.length,
          uniqueSessions: uniqueSessions.length,
          avgViewsPerVisitor: uniqueVisitors.length > 0 
            ? (totalViews / uniqueVisitors.length).toFixed(1)
            : 0,
        },
        today: {
          views: todayViews,
          visitors: todayVisitors.length,
        },
        viewsByDay,
        topPages,
        deviceBreakdown,
        browserBreakdown,
      },
    });
  } catch (error) {
    logger.error('Error getting visitor stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get visitor statistics',
    });
  }
};

/**
 * Get all page views (paginated)
 */
export const getPageViews = async (req, res) => {
  try {
    const { page = 1, limit = 50, device, days = 7 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const filter = {
      createdAt: { $gte: startDate },
    };

    if (device) {
      filter.device = device;
    }

    const total = await PageView.countDocuments(filter);
    const pageViews = await PageView.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('userId', 'name email')
      .lean();

    res.json({
      success: true,
      data: pageViews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    logger.error('Error getting page views:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get page views',
    });
  }
};

// Helper functions
function detectDevice(userAgent) {
  const ua = userAgent.toLowerCase();
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(userAgent)) {
    return 'tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(userAgent)) {
    return 'mobile';
  }
  return 'desktop';
}

function detectBrowser(userAgent) {
  const ua = userAgent.toLowerCase();
  if (ua.includes('edge') || ua.includes('edg')) return 'Edge';
  if (ua.includes('chrome')) return 'Chrome';
  if (ua.includes('safari') && !ua.includes('chrome')) return 'Safari';
  if (ua.includes('firefox')) return 'Firefox';
  if (ua.includes('opera') || ua.includes('opr')) return 'Opera';
  if (ua.includes('msie') || ua.includes('trident')) return 'IE';
  return 'Unknown';
}

function detectOS(userAgent) {
  const ua = userAgent.toLowerCase();
  if (ua.includes('windows')) return 'Windows';
  if (ua.includes('mac')) return 'macOS';
  if (ua.includes('android')) return 'Android';
  if (ua.includes('iphone') || ua.includes('ipad')) return 'iOS';
  if (ua.includes('linux')) return 'Linux';
  return 'Unknown';
}
