import * as reportsService from './reports.service.js';

export const getDaily = async (req, res) => {
  try {
    const data = await reportsService.getDailyTransactions(req.user.id, req.query.date);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message, code: 'REPORTS_ERROR' });
  }
};

export const getMonthly = async (req, res) => {
  try {
    const data = await reportsService.getMonthlyTransactions(req.user.id, req.query.month);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message, code: 'REPORTS_ERROR' });
  }
};

export const exportPdf = async (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=financial-report.pdf');
    await reportsService.generatePdfReport(req.user.id, res);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message, code: 'REPORTS_EXPORT_ERROR' });
  }
};

export const exportExcel = async (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=financial-report.xlsx');
    await reportsService.generateExcelReport(req.user.id, res);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message, code: 'REPORTS_EXPORT_ERROR' });
  }
};
