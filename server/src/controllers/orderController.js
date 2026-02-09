import Order from '../models/Order.js';
import Product from '../models/Product.js';

// In-memory cache for stats (5 minutes)
let statsCache = null;
let statsCacheTime = null;
const STATS_CACHE_DURATION = 5 * 60 * 1000;

/** POST /api/orders  (user) */
export const createOrder = async (req, res, next) => {
  try {
    const order = await Order.create({ ...req.body, userId: req.user._id });

    // Bulk update stock - much faster than loop
    const bulkOps = order.items.map(item => (
      {
        updateOne: {
          filter: { _id: item.productId },
          update: { $inc: { stock: -item.qty } },
        },
      }
    ));
    if (bulkOps.length > 0) {
      await Product.bulkWrite(bulkOps);
    }

    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
};

/** GET /api/orders/my  (user) */
export const getMyOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    
    const [orders, total] = await Promise.all([
      Order.find({ userId: req.user._id })
        .sort('-createdAt')
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Order.countDocuments({ userId: req.user._id }),
    ]);
    
    res.set('Cache-Control', 'private, max-age=60');
    res.json({
      orders,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      total,
    });
  } catch (err) {
    next(err);
  }
};

/** GET /api/orders  (admin) */
export const getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort('-createdAt')
        .skip(skip)
        .limit(Number(limit))
        .populate('userId', 'name email')
        .lean(),
      Order.countDocuments(filter),
    ]);

    res.set('Cache-Control', 'private, max-age=30');
    res.json({ orders, page: Number(page), totalPages: Math.ceil(total / Number(limit)), total });
  } catch (err) {
    next(err);
  }
};

/** PUT /api/orders/:id/status  (admin) */
export const updateOrderStatus = async (req, res, next) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    next(err);
  }
};

/** GET /api/orders/stats  (admin) — simple analytics */
export const getStats = async (req, res, next) => {
  try {
    // Return cached stats if fresh
    if (statsCache && statsCacheTime && Date.now() - statsCacheTime < STATS_CACHE_DURATION) {
      res.set('Cache-Control', 'private, max-age=300');
      return res.json(statsCache);
    }

    const [totalOrders, revenue, bestSellers, totalProducts] = await Promise.all([
      Order.countDocuments(),
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Order.aggregate([
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.productId',
            title: { $first: '$items.title' },
            totalSold: { $sum: '$items.qty' },
          },
        },
        { $sort: { totalSold: -1 } },
        { $limit: 5 },
      ]),
      Product.countDocuments(),
    ]);

    statsCache = {
      totalOrders,
      totalRevenue: revenue[0]?.total || 0,
      totalProducts,
      bestSellers,
    };
    statsCacheTime = Date.now();

    res.set('Cache-Control', 'private, max-age=300');
    res.json(statsCache);
  } catch (err) {
    next(err);
  }
};
