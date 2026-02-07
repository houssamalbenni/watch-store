import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { HiOutlineClipboardList, HiOutlineClock } from 'react-icons/hi';
import api from '../lib/api';

const statusColors = {
  pending: 'text-yellow-400 bg-yellow-400/10',
  paid: 'text-blue-400 bg-blue-400/10',
  shipped: 'text-purple-400 bg-purple-400/10',
  delivered: 'text-green-400 bg-green-400/10',
  cancelled: 'text-red-400 bg-red-400/10',
};

const Profile = () => {
  const { user } = useSelector((s) => s.auth);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders/my');
        setOrders(data);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="pt-8 pb-16 min-h-screen">
      <div className="max-w-5xl mx-auto px-6">
        {/* User info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-luxury p-8 mb-10"
        >
          <h1 className="text-3xl font-serif mb-2">My Profile</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 text-sm">
            <div>
              <p className="text-luxury-gray">Name</p>
              <p className="text-luxury-white mt-1">{user?.name}</p>
            </div>
            <div>
              <p className="text-luxury-gray">Email</p>
              <p className="text-luxury-white mt-1">{user?.email}</p>
            </div>
            <div>
              <p className="text-luxury-gray">Member Since</p>
              <p className="text-luxury-white mt-1">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Orders */}
        <h2 className="text-2xl font-serif mb-6">Order History</h2>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-32 rounded" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <HiOutlineClipboardList className="w-16 h-16 text-luxury-gray-dark mx-auto mb-4" />
            <p className="text-luxury-gray">You haven't placed any orders yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, i) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="card-luxury p-6"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div>
                    <p className="text-xs text-luxury-gray">
                      Order #{order._id.slice(-8).toUpperCase()}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-luxury-gray">
                      <HiOutlineClock className="w-3 h-3" />
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`text-xs px-3 py-1 rounded-full capitalize ${statusColors[order.status] || ''}`}
                    >
                      {order.status}
                    </span>
                    <span className="text-luxury-gold font-semibold">
                      ${order.total.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  {order.items.map((item, j) => (
                    <div key={j} className="flex items-center gap-3 bg-luxury-dark px-3 py-2">
                      <div className="w-10 h-10 overflow-hidden bg-luxury-card flex-shrink-0">
                        <img src={item.image} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-sm">{item.title}</p>
                        <p className="text-xs text-luxury-gray">
                          {item.qty} x ${item.price.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
