import * as syncService from './sync.service.js';

export const batchSync = async (req, res) => {
  try {
    const { actions } = req.body;
    
    if (!actions) {
      return res.status(400).json({ success: false, message: 'Missing actions payload', code: 'SYNC_ERROR' });
    }

    const { processed, failed } = await syncService.processBatchSync(req.user.id, actions);
    
    return res.status(200).json({ 
      success: true, 
      processed, 
      failed 
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: error.message, 
      code: 'SYNC_ERROR' 
    });
  }
};
