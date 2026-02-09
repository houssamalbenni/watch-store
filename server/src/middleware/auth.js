import jwt from 'jsonwebtoken';
import config from '../config/index.js';

/** Verify access token from cookie or Authorization header */
const authenticate = async (req, res, next) => {
  try {
    let token = req.cookies?.accessToken;

    // Fallback to Authorization header
    if (!token) {
      const auth = req.headers.authorization;
      if (auth?.startsWith('Bearer ')) token = auth.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, config.jwt.accessSecret);
    // Attach decoded token data directly — no DB query needed
    req.user = { _id: decoded.id, role: decoded.role };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    return res.status(401).json({ message: 'Invalid token' });
  }
};

/** Require admin role */
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

export { authenticate, requireAdmin };
