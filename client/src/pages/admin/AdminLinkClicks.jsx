/**
 * Admin Link Clicks Tracking Page
 * View all link clicks with statistics, filtering, and reset option
 */

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const AdminLinkClicks = () => {
  const { user } = useSelector((s) => s.auth);
  
  // State
  const [clicks, setClicks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    linkType: '',
    page: 1,
    limit: 50,
  });
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [pagination, setPagination] = useState(null);

  // Fetch link clicks
  const fetchClicks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', filters.page);
      params.append('limit', filters.limit);
      if (filters.linkType) params.append('linkType', filters.linkType);

      const response = await axios.get(`${API_URL}/link-clicks?${params.toString()}`);
      setClicks(response.data.data || []);
      setPagination(response.data.pagination || {});
    } catch (error) {
      console.error('Failed to load link clicks:', error);
      toast.error('Failed to load link clicks');
      setClicks([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/link-clicks/stats`);
      
      const data = response.data;
      const formattedStats = {
        total: 0,
        byType: [],
        topProducts: [],
        todayCount: 0,
      };

      if (data.byType) {
        Object.entries(data.byType).forEach(([type, count]) => {
          formattedStats.total += count;
          formattedStats.byType.push({ _id: type, count });
        });
      }

      if (data.topProducts && Array.isArray(data.topProducts)) {
        formattedStats.topProducts = data.topProducts.slice(0, 5);
      }

      if (data.byDate && Array.isArray(data.byDate) && data.byDate.length > 0) {
        formattedStats.todayCount = data.byDate[data.byDate.length - 1].count || 0;
      }

      setStats(formattedStats);
    } catch (error) {
      console.error('Failed to load stats:', error);
      setStats({
        total: 0,
        byType: [],
        topProducts: [],
        todayCount: 0,
      });
    }
  };

  // Initial load and refetch on filter change
  useEffect(() => {
    fetchClicks();
    fetchStats();
  }, [filters.linkType, filters.page, filters.limit]);

  // Handle reset
  const handleReset = async () => {
    setResetting(true);
    try {
      await axios.delete(`${API_URL}/link-clicks`);
      toast.success('All link click records have been reset');
      setShowResetModal(false);
      setClicks([]);
      setStats({ total: 0, byType: [], topProducts: [], todayCount: 0 });
      setFilters({ linkType: '', page: 1, limit: 50 });
      await Promise.all([fetchClicks(), fetchStats()]);
    } catch (error) {
      toast.error('Failed to reset link clicks');
      console.error(error);
    } finally {
      setResetting(false);
    }
  };

  // Handle delete single record
  const handleDeleteClick = async (id) => {
    if (!window.confirm('Delete this record?')) return;

    try {
      await axios.delete(`${API_URL}/link-clicks/${id}`);
      toast.success('Record deleted');
      setClicks(clicks.filter(c => c._id !== id));
      await fetchStats();
    } catch (error) {
      toast.error('Failed to delete record');
      console.error(error);
    }
  };

  // Pagination handlers
  const handlePreviousPage = () => {
    if (filters.page > 1) {
      setFilters({ ...filters, page: filters.page - 1 });
    }
  };

  const handleNextPage = () => {
    if (pagination && filters.page < pagination.pages) {
      setFilters({ ...filters, page: filters.page + 1 });
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Link Click Tracking</h1>
          <p className="text-gray-400 text-sm mt-1">Monitor all link clicks and lead generation</p>
        </div>
        <button
          onClick={() => setShowResetModal(true)}
          disabled={resetting || !stats || stats.total === 0}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {resetting ? 'Resetting...' : 'Reset All'}
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-16 bg-gray-800 border border-gray-700 rounded-lg">
          <div className="inline-block w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 mt-4">Loading data...</p>
        </div>
      )}

      {/* Stats Grid */}
      {!loading && stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <p className="text-gray-400 text-sm mb-2">Total Clicks</p>
            <p className="text-4xl font-bold text-yellow-500">{stats.total}</p>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <p className="text-gray-400 text-sm mb-3">By Type</p>
            <div className="space-y-2">
              {stats.byType.map(type => (
                <div key={type._id} className="flex justify-between text-sm">
                  <span className="text-gray-300 capitalize">{type._id}</span>
                  <span className="font-bold text-yellow-400">{type.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <p className="text-gray-400 text-sm mb-3">Top Products</p>
            <div className="space-y-2">
              {stats.topProducts.slice(0, 3).map((p, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-gray-300 truncate text-xs">{p.productName || 'Unknown'}</span>
                  <span className="font-bold text-yellow-400">{p.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <p className="text-gray-400 text-sm mb-2">Today's Clicks</p>
            <p className="text-4xl font-bold text-yellow-500">{stats.todayCount}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      {!loading && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 flex items-center gap-4">
          <label htmlFor="type" className="text-sm text-gray-300 whitespace-nowrap">Filter by type:</label>
          <select
            id="type"
            value={filters.linkType}
            onChange={(e) => setFilters({ ...filters, linkType: e.target.value, page: 1 })}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-gray-100 text-sm focus:outline-none focus:border-yellow-500"
          >
            <option value="">All Types</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="email">Email</option>
            <option value="phone">Phone</option>
            <option value="inquiry_form">Inquiry Form</option>
            <option value="other">Other</option>
          </select>
          <div className="ml-auto text-sm text-gray-400">
            {clicks.length} of {pagination?.total || 0} records
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && clicks.length === 0 && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-12 text-center">
          <p className="text-gray-300 text-lg font-medium">No click records found</p>
          <p className="text-gray-500 text-sm mt-2">Data will appear here when users click tracked links</p>
        </div>
      )}

      {/* Data Table */}
      {!loading && clicks.length > 0 && (
        <>
          <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-900 border-b border-gray-700 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-300 font-semibold">Type</th>
                  <th className="px-4 py-3 text-left text-gray-300 font-semibold">Product</th>
                  <th className="px-4 py-3 text-left text-gray-300 font-semibold">Destination</th>
                  <th className="px-4 py-3 text-left text-gray-300 font-semibold">Source Page</th>
                  <th className="px-4 py-3 text-left text-gray-300 font-semibold">Date / Time</th>
                  <th className="px-4 py-3 text-center text-gray-300 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {clicks.map(click => (
                  <tr key={click._id} className="hover:bg-gray-700/50">
                    <td className="px-4 py-3 text-gray-300 capitalize font-medium">{click.linkType}</td>
                    <td className="px-4 py-3 text-gray-400 truncate max-w-xs">{click.productName || '—'}</td>
                    <td className="px-4 py-3 text-gray-400 truncate max-w-sm text-xs">{click.destination}</td>
                    <td className="px-4 py-3 text-gray-400 truncate max-w-xs text-xs">{click.source?.page}</td>
                    <td className="px-4 py-3 text-gray-300 whitespace-nowrap text-xs">
                      <div>{new Date(click.createdAt).toLocaleDateString()}</div>
                      <div className="text-gray-500">{new Date(click.createdAt).toLocaleTimeString()}</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleDeleteClick(click._id)}
                        className="px-2 py-1 text-xs bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex justify-between items-center gap-4">
              <button
                onClick={handlePreviousPage}
                disabled={filters.page === 1}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded disabled:opacity-50"
              >
                ← Previous
              </button>
              <span className="text-gray-400">Page {filters.page} of {pagination.pages}</span>
              <button
                onClick={handleNextPage}
                disabled={filters.page >= pagination.pages}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded disabled:opacity-50"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {/* Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-bold text-white mb-2">⚠️ Reset All Records?</h3>
            <p className="text-gray-400 mb-6">Delete all {stats?.total} link click records permanently.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetModal(false)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                disabled={resetting}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded disabled:opacity-50 font-medium"
              >
                {resetting ? 'Resetting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLinkClicks;
