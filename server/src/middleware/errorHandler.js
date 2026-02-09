import logger from '../config/logger.js';
import config from '../config/index.js';

const errorHandler = (err, req, res, _next) => {
  // Log full error details
  logger.error(`${err.message} | ${req.method} ${req.originalUrl}`);
  if (config.nodeEnv === 'development') {
    logger.error(err.stack);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      message: 'Validation error', 
      errors: err.errors 
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({ 
      message: `${field} already exists` 
    });
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({ 
      message: 'Invalid ID format' 
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ 
      message: 'Invalid token' 
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ 
      message: 'Token expired' 
    });
  }

  // CORS error
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ 
      message: 'CORS policy violation - Origin not allowed' 
    });
  }

  // Default error
  const status = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  // In development, send stack trace
  if (config.nodeEnv === 'development') {
    return res.status(status).json({
      message,
      stack: err.stack,
      error: err
    });
  }

  // In production, send clean error
  res.status(status).json({ message });
};

export default errorHandler;
