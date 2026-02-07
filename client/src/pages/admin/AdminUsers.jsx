import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineShieldCheck, HiOutlineTrash, HiOutlineUser } from 'react-icons/hi';
import toast from 'react-hot-toast';
import api from '../../lib/api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/users');
      setUsers(data);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      const { data } = await api.patch(`/users/${userId}/role`, { role: newRole });
      setUsers((prev) => prev.map((u) => (u._id === userId ? data : u)));
      toast.success(`Role updated to ${newRole}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update role');
    }
  };

  const deleteUser = async (userId, name) => {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      toast.success('User deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-luxury-card animate-pulse rounded" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 bg-luxury-card animate-pulse rounded" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-serif">Users</h1>
        <p className="text-luxury-gray mt-1">{users.length} registered users</p>
      </motion.div>

      <div className="space-y-3">
        {users.map((user, i) => (
          <motion.div
            key={user._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="card-luxury p-4 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4 min-w-0">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  user.role === 'admin'
                    ? 'bg-luxury-gold/20 text-luxury-gold'
                    : 'bg-luxury-card text-luxury-gray'
                }`}
              >
                {user.role === 'admin' ? (
                  <HiOutlineShieldCheck className="w-5 h-5" />
                ) : (
                  <HiOutlineUser className="w-5 h-5" />
                )}
              </div>
              <div className="min-w-0">
                <p className="font-medium truncate">{user.name}</p>
                <p className="text-sm text-luxury-gray truncate">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <span
                className={`text-xs px-3 py-1 rounded-full ${
                  user.role === 'admin'
                    ? 'bg-luxury-gold/20 text-luxury-gold'
                    : 'bg-luxury-card text-luxury-gray'
                }`}
              >
                {user.role}
              </span>

              <button
                onClick={() => toggleRole(user._id, user.role)}
                className={`text-xs px-3 py-1.5 border transition-colors ${
                  user.role === 'admin'
                    ? 'border-red-400/30 text-red-400 hover:bg-red-400/10'
                    : 'border-luxury-gold/30 text-luxury-gold hover:bg-luxury-gold/10'
                }`}
              >
                {user.role === 'admin' ? 'Demote' : 'Make Admin'}
              </button>

              <button
                onClick={() => deleteUser(user._id, user.name)}
                className="text-luxury-gray hover:text-red-400 transition-colors p-1.5"
              >
                <HiOutlineTrash className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AdminUsers;
