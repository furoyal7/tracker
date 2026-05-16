import * as reportService from '../services/reportService.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const getSummary = async (req, res) => {
  try {
    const summary = await reportService.getFinancialSummary(req.user.id);
    return successResponse(res, summary, 'Financial summary retrieved');
  } catch (error) {
    console.error(`[Report Controller Error] ${error.message}`, error);
    return errorResponse(res, error.message, error.statusCode || 500);
  }
};
