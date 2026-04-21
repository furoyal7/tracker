import { errorResponse } from '../utils/response.js';
import { config } from '../config/env.js';

export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  const errors = config.nodeEnv === 'development' ? err.stack : null;

  return errorResponse(res, message, status, errors);
};
