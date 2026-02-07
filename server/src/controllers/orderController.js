import Order from '../models/Order.js';
import Product from '../models/Product.js';

/** POST /api/orders  (user) */
export const createOrder = async (req, res, next) => {
  try {
    const order = await Order.create({ ...req.body, userId: req.user._id });

    // Decrement stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.qty },
      });
    }

    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
};

/** GET /api/orders/my  (user) */
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort('-createdAt');
    res.json(orders);
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
      Order.find(filter).sort('-createdAt').skip(skip).limit(Number(limit)).populate('userId', 'name email'),
      Order.countDocuments(filter),
    ]);

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
    const totalOrders = await Order.countDocuments();
    const revenue = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);
    const bestSellers = await Order.aggregate([
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
    ]);

    const totalProducts = await Product.countDocuments();

    res.json({
      totalOrders,
      totalRevenue: revenue[0]?.total || 0,
      totalProducts,
      bestSellers,
    });
  } catch (err) {
    next(err);
  }
};
