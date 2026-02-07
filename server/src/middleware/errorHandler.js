import logger from '../config/logger.js';

const errorHandler = (err, req, res, _next) => {
  logger.error(`${err.message} | ${req.method} ${req.originalUrl}`);

  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: 'Validation error', errors: err.errors });
  }
  if (err.code === 11000) {
    return res.status(409).json({ message: 'Duplicate key error' });
  }

  const status = err.statusCode || 500;
  res.status(status).json({
    message: err.message || 'Internal server error',
  });
};

export default errorHandler;
