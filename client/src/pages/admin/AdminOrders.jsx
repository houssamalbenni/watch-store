import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../lib/api';

const STATUS_OPTIONS = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];
const statusColors = {
  pending: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  paid: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  shipped: 'text-purple-400 bg-purple-400/10 border-purple-400/30',
  delivered: 'text-green-400 bg-green-400/10 border-green-400/30',
  cancelled: 'text-red-400 bg-red-400/10 border-red-400/30',
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchOrders = async (pg = 1, status = '') => {
    setLoading(true);
    try {
      const params = { page: pg, limit: 15 };
      if (status) params.status = status;
      const { data } = await api.get('/orders', { params });
      setOrders(data.orders);
      setTotalPages(data.totalPages);
      setPage(data.page);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(1, statusFilter);
  }, [statusFilter]);

  const updateStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders(page, statusFilter);
    } catch {
      toast.error('Failed to update status');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-serif">Orders</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-luxury-gray">Filter:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-luxury text-sm w-40"
          >
            <option value="">All Status</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton h-24 rounded" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-luxury-gray">No orders found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, i) => (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card-luxury p-6"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Order Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <span className="text-sm font-mono text-luxury-gray">
                      #{order._id.slice(-8).toUpperCase()}
                    </span>
                    <span
                      className={`text-xs px-3 py-1 rounded-full border capitalize ${
                        statusColors[order.status] || ''
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-luxury-gray text-xs">Customer</p>
                      <p className="text-luxury-white">
                        {order.userId?.name || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-luxury-gray text-xs">Items</p>
                      <p className="text-luxury-white">{order.items.length} item(s)</p>
                    </div>
                    <div>
                      <p className="text-luxury-gray text-xs">Total</p>
                      <p className="text-luxury-gold font-semibold">${order.total.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-luxury-gray text-xs">Date</p>
                      <p className="text-luxury-white">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Items preview */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {order.items.map((item, j) => (
                      <span key={j} className="text-xs bg-luxury-dark px-2 py-1 text-luxury-gray">
                        {item.title} x{item.qty}
                      </span>
                    ))}
                  </div>

                  {/* Shipping Address */}
                  <div className="mt-2 text-xs text-luxury-gray">
                    Ship to: {order.shippingAddress?.fullName}, {order.shippingAddress?.city},{' '}
                    {order.shippingAddress?.country}
                  </div>
                </div>

                {/* Status Update */}
                <div className="flex-shrink-0">
                  <label className="text-xs text-luxury-gray block mb-1">Update Status</label>
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order._id, e.target.value)}
                    className="input-luxury text-sm w-40"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => fetchOrders(i + 1, statusFilter)}
                  className={`w-10 h-10 text-sm transition-colors ${
                    page === i + 1
                      ? 'bg-luxury-gold text-luxury-black'
                      : 'border border-luxury-gray-dark text-luxury-gray hover:border-luxury-gold'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
