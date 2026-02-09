import User from '../models/User.js';

/** GET /api/users — list all users (admin only) */
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .select('-passwordHash -refreshToken')
      .sort('-createdAt')
      .lean();
    
    res.set('Cache-Control', 'private, max-age=120');
    res.json(users);
  } catch (err) {
    next(err);
  }
};

/** PATCH /api/users/:id/role — toggle user role (admin only) */
export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['admin', 'user'].includes(role)) {
      return res.status(400).json({ message: 'Role must be "admin" or "user"' });
    }

    // Prevent admin from demoting themselves
    if (req.params.id === req.user._id.toString() && role !== 'admin') {
      return res.status(400).json({ message: 'You cannot demote yourself' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-passwordHash -refreshToken');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
};

/** DELETE /api/users/:id — delete a user (admin only) */
export const deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot delete yourself' });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted' });
  } catch (err) {
    next(err);
  }
};
