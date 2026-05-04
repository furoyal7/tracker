import * as insightService from '../services/insightService.js';

/**
 * Controller for Advanced Business Insights
 */
export const getInsights = async (req, res) => {
  try {
    const userId = req.user.id;
    const insights = await insightService.generateInsights(userId);
    
    res.json({
      status: 'success',
      data: insights
    });
  } catch (error) {
    console.error('[INSIGHTS_CONTROLLER_ERROR]', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate business insights'
    });
  }
};
