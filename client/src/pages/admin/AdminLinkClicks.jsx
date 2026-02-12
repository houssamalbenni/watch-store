/**
 * Admin Link Clicks Tracking Page
 * View all link clicks with statistics, filtering, and reset option
 */

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import {
  HiOutlineTrash2,
  HiOutlineEye,
  HiX,
  HiCheckCircle,
} from 'react-icons/hi';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export const AdminLinkClicks = () => {
  const { user } = useSelector((s) => s.auth);
  
  // State
  const [clicks, setClicks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
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
      setClicks(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error('Failed to load link clicks');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/link-clicks/stats`);
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
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
      setStats(null);
      setFilters({ linkType: '', page: 1, limit: 50 });
      fetchClicks();
      fetchStats();
    } catch (error) {
      toast.error('Failed to reset link clicks');
      console.error(error);
    } finally {
      setResetting(false);
    }
  };

  // Handle delete single record
  const handleDeleteClick = async (id) => {
    if (!window.confirm('Are you sure?')) return;

    try {
      await axios.delete(`${API_URL}/link-clicks/${id}`);
      toast.success('Link click record deleted');
      setClicks(clicks.filter(c => c._id !== id));
      fetchStats();
    } catch (error) {
      toast.error('Failed to delete record');
      console.error(error);
    }
  };

  const getTypeIcon = (type) => {
    const icons = {
      whatsapp: '💬',
      email: '✉️',
      phone: '☎️',
      inquiry_form: '📝',
      other: '🔗',
    };
    return icons[type] || '🔗';
  };

  const getTypeLabel = (type) => {
    return type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-luxury-white">Link Click Tracking</h1>
          <p className="text-luxury-gray text-sm mt-1">
            Monitor all link clicks and lead generation activity
          </p>
        </div>
        <button
          onClick={() => setShowResetModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          <HiOutlineTrash2 className="w-5 h-5" />
          Reset All
        </button>
      </div>

      {/* Statistics Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Total Clicks */}
          <div className="bg-luxury-card border border-luxury-gray-dark/30 rounded-lg p-6">
            <p className="text-luxury-gray text-sm">Total Clicks</p>
            <p className="text-3xl font-bold text-luxury-gold mt-2">{stats.total}</p>
          </div>

          {/* By Type */}
          <div className="bg-luxury-card border border-luxury-gray-dark/30 rounded-lg p-6">
            <p className="text-luxury-gray text-sm mb-3">By Type</p>
            <div className="space-y-1 text-sm">
              {stats.byType?.map(type => (
                <div key={type._id} className="flex justify-between text-luxury-gray">
                  <span>
                    {getTypeIcon(type._id)} {getTypeLabel(type._id)}
                  </span>
                  <span className="font-bold text-luxury-white">{type.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-luxury-card border border-luxury-gray-dark/30 rounded-lg p-6">
            <p className="text-luxury-gray text-sm mb-3">Top 3 Products</p>
            <div className="space-y-1 text-sm">
              {stats.topProducts?.slice(0, 3).map((product, idx) => (
                <div key={product._id} className="flex justify-between text-luxury-gray">
                  <span className="truncate">
                    {idx + 1}. {product.productName || 'Unknown'}
                  </span>
                  <span className="font-bold text-luxury-white ml-2 flex-shrink-0">{product.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Today's Clicks */}
          <div className="bg-luxury-card border border-luxury-gray-dark/30 rounded-lg p-6">
            <p className="text-luxury-gray text-sm mb-3">Today</p>
            <p className="text-2xl font-bold text-luxury-gold">
              {stats.byDate?.[stats.byDate.length - 1]?.count || 0}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-luxury-card border border-luxury-gray-dark/30 rounded-lg p-4 flex justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <label className="text-sm text-luxury-gray">
            Link Type:
            <select
              value={filters.linkType}
              onChange={(e) => setFilters({ ...filters, linkType: e.target.value, page: 1 })}
              className="ml-2 px-3 py-1 bg-luxury-dark border border-luxury-gray-dark/50 rounded text-luxury-white text-sm"
            >
              <option value="">All Types</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="email">Email</option>
              <option value="phone">Phone</option>
              <option value="inquiry_form">Inquiry Form</option>
              <option value="other">Other</option>
            </select>
          </label>
        </div>

        <p className="text-sm text-luxury-gray">
          Showing {clicks.length} of {pagination?.total || 0} records
        </p>
      </div>

      {/* Table */}
      <div className="bg-luxury-card border border-luxury-gray-dark/30 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-luxury-dark border-b border-luxury-gray-dark/30">
              <tr>
                <th className="px-6 py-4 text-left text-luxury-gray font-semibold">Type</th>
                <th className="px-6 py-4 text-left text-luxury-gray font-semibold">Product</th>
                <th className="px-6 py-4 text-left text-luxury-gray font-semibold">Destination</th>
                <th className="px-6 py-4 text-left text-luxury-gray font-semibold">Source Page</th>
                <th className="px-6 py-4 text-left text-luxury-gray font-semibold">User</th>
                <th className="px-6 py-4 text-left text-luxury-gray font-semibold">Date/Time</th>
                <th className="px-6 py-4 text-center text-luxury-gray font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-luxury-gray-dark/30">
              {clicks.length > 0 ? (
                clicks.map((click) => (
                  <tr key={click._id} className="hover:bg-luxury-dark/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-2">
                        {getTypeIcon(click.linkType)}
                        <span className="text-luxury-gold font-medium">
                          {getTypeLabel(click.linkType)}
                        </span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-luxury-gray truncate max-w-xs">
                      {click.productName || click.productId || '—'}
                    </td>
                    <td className="px-6 py-4 text-luxury-gray truncate max-w-xs">
                      {click.destination || '—'}
                    </td>
                    <td className="px-6 py-4 text-luxury-gray truncate max-w-xs">
                      {click.source?.page || '—'}
                    </td>
                    <td className="px-6 py-4 text-luxury-gray">
                      {click.userId ? (
                        <div className="text-sm">
                          <p className="font-medium text-luxury-white">{click.userId.name}</p>
                          <p className="text-luxury-gray text-xs">{click.userId.email}</p>
                        </div>
                      ) : (
                        <span className="text-luxury-gray/60 italic">Anonymous</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-luxury-gray text-sm">
                      <div>
                        {new Date(click.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-luxury-gray/60 text-xs">
                        {new Date(click.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDeleteClick(click._id)}
                        className="flex justify-center text-red-400 hover:text-red-300 transition-colors"
                      >
                        <HiOutlineTrash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-luxury-gray">
                    No link clicks recorded yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="bg-luxury-dark border-t border-luxury-gray-dark/30 px-6 py-4 flex justify-between items-center">
            <div className="text-sm text-luxury-gray">
              Page {pagination.page} of {pagination.pages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilters({ ...filters, page: Math.max(1, filters.page - 1) })}
                disabled={filters.page === 1}
                className="px-3 py-1 bg-luxury-card border border-luxury-gray-dark/30 rounded text-luxury-gray hover:text-luxury-white disabled:opacity-50 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setFilters({ ...filters, page: Math.min(pagination.pages, filters.page + 1) })}
                disabled={filters.page === pagination.pages}
                className="px-3 py-1 bg-luxury-card border border-luxury-gray-dark/30 rounded text-luxury-gray hover:text-luxury-white disabled:opacity-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-luxury-gold border-t-transparent"></div>
        </div>
      )}

      {/* Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-luxury-card border border-luxury-gray-dark/50 rounded-xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-luxury-gray-dark/30">
              <div className="flex items-center gap-3">
                <HiX className="w-6 h-6 text-red-400" />
                <h2 className="text-xl font-bold text-luxury-white">Reset All Link Clicks?</h2>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-luxury-gray">
                This will permanently delete all {stats?.total || 0} link click records. This action cannot be undone.
              </p>
              <p className="text-sm text-red-400">
                ⚠️ Are you absolutely sure?
              </p>
            </div>

            <div className="p-6 border-t border-luxury-gray-dark/30 flex gap-3 justify-end">
              <button
                onClick={() => setShowResetModal(false)}
                disabled={resetting}
                className="px-4 py-2 bg-luxury-dark border border-luxury-gray-dark/30 rounded-lg text-luxury-gray hover:text-luxury-white transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                disabled={resetting}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {resetting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Resetting...
                  </>
                ) : (
                  <>
                    <HiOutlineTrash2 className="w-4 h-4" />
                    Delete All
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLinkClicks;
