import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  HiOutlineCurrencyDollar,
  HiOutlineClipboardList,
  HiOutlineCube,
  HiOutlineTrendingUp,
  HiOutlineEye,
  HiOutlineUsers,
} from 'react-icons/hi';
import api from '../../lib/api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [visitorStats, setVisitorStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [ordersData, analyticsData] = await Promise.all([
          api.get('/orders/stats'),
          api.get('/analytics/stats?days=7'),
        ]);
        setStats(ordersData.data);
        setVisitorStats(analyticsData.data.data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    {
      label: 'Total Revenue',
      value: stats ? `$${stats.totalRevenue.toLocaleString()}` : '...',
      icon: HiOutlineCurrencyDollar,
      color: 'text-green-400',
      bg: 'bg-green-400/10',
    },
    {
      label: 'Total Orders',
      value: stats?.totalOrders ?? '...',
      icon: HiOutlineClipboardList,
      color: 'text-blue-400',
      bg: 'bg-blue-400/10',
    },
    {
      label: 'Total Products',
      value: stats?.totalProducts ?? '...',
      icon: HiOutlineCube,
      color: 'text-purple-400',
      bg: 'bg-purple-400/10',
    },
    {
      label: 'Avg. Order Value',
      value: stats && stats.totalOrders > 0
        ? `$${Math.round(stats.totalRevenue / stats.totalOrders).toLocaleString()}`
        : '$0',
      icon: HiOutlineTrendingUp,
      color: 'text-luxury-gold',
      bg: 'bg-luxury-gold/10',
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-serif mb-8">Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card-luxury p-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-luxury-gray text-sm">{card.label}</p>
                <p className={`text-3xl font-semibold mt-2 ${card.color}`}>
                  {loading ? (
                    <span className="skeleton inline-block w-24 h-8 rounded" />
                  ) : (
                    card.value
                  )}
                </p>
              </div>
              <div className={`p-3 rounded ${card.bg}`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Visitor Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card-luxury p-6 border-2 border-yellow-500/30"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-luxury-gray text-sm">Unique Visitors (7d)</p>
              <p className="text-3xl font-semibold mt-2 text-yellow-400">
                {loading ? (
                  <span className="skeleton inline-block w-24 h-8 rounded" />
                ) : (
                  visitorStats?.summary?.uniqueVisitors || 0
                )}
              </p>
            </div>
            <div className="p-3 rounded bg-yellow-400/10">
              <HiOutlineUsers className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card-luxury p-6 border-2 border-blue-500/30"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-luxury-gray text-sm">Total Page Views (7d)</p>
              <p className="text-3xl font-semibold mt-2 text-blue-400">
                {loading ? (
                  <span className="skeleton inline-block w-24 h-8 rounded" />
                ) : (
                  visitorStats?.summary?.totalViews || 0
                )}
              </p>
            </div>
            <div className="p-3 rounded bg-blue-400/10">
              <HiOutlineEye className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card-luxury p-6"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-luxury-gray text-sm">Today's Visitors</p>
              <p className="text-3xl font-semibold mt-2 text-green-400">
                {loading ? (
                  <span className="skeleton inline-block w-24 h-8 rounded" />
                ) : (
                  visitorStats?.today?.visitors || 0
                )}
              </p>
            </div>
            <div className="p-3 rounded bg-green-400/10">
              <HiOutlineUsers className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="card-luxury p-6"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-luxury-gray text-sm">Avg. Views/Visitor</p>
              <p className="text-3xl font-semibold mt-2 text-purple-400">
                {loading ? (
                  <span className="skeleton inline-block w-24 h-8 rounded" />
                ) : (
                  visitorStats?.summary?.avgViewsPerVisitor || '0'
                )}
              </p>
            </div>
            <div className="p-3 rounded bg-purple-400/10">
              <HiOutlineTrendingUp className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Device Breakdown */}
      {!loading && visitorStats?.deviceBreakdown && visitorStats.deviceBreakdown.length > 0 && (
        <div className="card-luxury p-8 mb-12">
          <h2 className="text-xl font-serif mb-6">Visitors by Device (Last 7 Days)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {visitorStats.deviceBreakdown.map((device) => {
              const total = visitorStats.summary.totalViews;
              const percentage = total > 0 ? ((device.count / total) * 100).toFixed(1) : 0;
              const deviceLabels = {
                mobile: { label: 'Mobile', icon: '📱', color: 'text-blue-400' },
                desktop: { label: 'Desktop', icon: '💻', color: 'text-green-400' },
                tablet: { label: 'Tablet', icon: '📱', color: 'text-purple-400' },
                unknown: { label: 'Unknown', icon: '❓', color: 'text-gray-400' },
              };
              const info = deviceLabels[device._id] || deviceLabels.unknown;
              
              return (
                <div key={device._id} className="bg-luxury-dark p-6 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{info.icon}</span>
                      <span className="text-lg font-medium capitalize">{info.label}</span>
                    </div>
                    <span className={`text-2xl font-bold ${info.color}`}>{device.count}</span>
                  </div>
                  <div className="w-full bg-luxury-gray-dark/30 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${info.color.replace('text-', 'bg-')}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <p className="text-luxury-gray text-sm mt-2">{percentage}% of total views</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Best Sellers */}
      <div className="card-luxury p-8">
        <h2 className="text-xl font-serif mb-6">Best Sellers</h2>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="skeleton h-12 rounded" />
            ))}
          </div>
        ) : stats?.bestSellers?.length > 0 ? (
          <div className="space-y-3">
            {stats.bestSellers.map((item, i) => (
              <div
                key={item._id}
                className="flex items-center justify-between p-4 bg-luxury-dark rounded"
              >
                <div className="flex items-center gap-4">
                  <span className="text-luxury-gold font-semibold w-6">#{i + 1}</span>
                  <span className="text-sm">{item.title}</span>
                </div>
                <span className="text-luxury-gray text-sm">{item.totalSold} sold</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-luxury-gray">No sales data yet.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
