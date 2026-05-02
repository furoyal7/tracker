import { errorResponse } from '../utils/response.js';
import { config } from '../config/env.js';
import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  let { statusCode, message } = err;

  if (!statusCode) statusCode = 500;

  if (config.nodeEnv === 'production' && !err.isOperational && statusCode === 500) {
    message = 'Internal Server Error';
  }

  res.locals.errorMessage = err.message;

  const response = {
    code: statusCode,
    message,
    ...(config.nodeEnv === 'development' && { stack: err.stack }),
  };

  // Log error using Winston
  if (statusCode >= 500) {
    logger.error(`${req.method} ${req.path} - ${err.message}`, { stack: err.stack });
  } else {
    logger.warn(`${req.method} ${req.path} - ${message}`);
  }

  return errorResponse(res, message, statusCode, response.stack);
};
