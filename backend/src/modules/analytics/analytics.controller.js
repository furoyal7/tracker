import * as analyticsService from './analytics.service.js';

export const getSummary = async (req, res) => {
  try {
    const data = await analyticsService.getSummary(req.user.id);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message, code: 'ANALYTICS_ERROR' });
  }
};

export const getMonthlyGrowth = async (req, res) => {
  try {
    const data = await analyticsService.getMonthlyGrowth(req.user.id);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message, code: 'ANALYTICS_ERROR' });
  }
};

export const getCategoryBreakdown = async (req, res) => {
  try {
    const data = await analyticsService.getCategoryBreakdown(req.user.id);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message, code: 'ANALYTICS_ERROR' });
  }
};

export const getProfitMargin = async (req, res) => {
  try {
    const data = await analyticsService.getProfitMargin(req.user.id);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message, code: 'ANALYTICS_ERROR' });
  }
};
