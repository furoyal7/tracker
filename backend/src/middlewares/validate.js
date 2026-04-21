import { errorResponse } from '../utils/response.js';

export const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (error) {
    return errorResponse(res, 'Validation Error', 400, error.errors);
  }
};
