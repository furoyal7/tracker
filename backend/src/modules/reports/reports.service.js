import prisma from '../../lib/prisma.js';
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import { format } from 'date-fns';

export const getDailyTransactions = async (userId, dateStr) => {
  const date = dateStr ? new Date(dateStr) : new Date();
  const startOfDay = new Date(date.setHours(0, 0, 0, 0));
  const endOfDay = new Date(date.setHours(23, 59, 59, 999));
  
  const transactions = await prisma.transaction.findMany({
    where: { userId, date: { gte: startOfDay, lte: endOfDay } },
    orderBy: { date: 'desc' }
  });

  const totals = transactions.reduce((acc, tx) => {
    if (tx.type === 'INCOME') acc.income += tx.amount;
    if (tx.type === 'EXPENSE') acc.expense += tx.amount;
    return acc;
  }, { income: 0, expense: 0 });

  return { transactions, totals: { ...totals, net: totals.income - totals.expense } };
};

export const getMonthlyTransactions = async (userId, monthStr) => {
  const date = monthStr ? new Date(monthStr) : new Date();
  const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
  
  const transactions = await prisma.transaction.findMany({
    where: { userId, date: { gte: startOfMonth, lte: endOfMonth } },
    orderBy: { date: 'desc' }
  });

  const totals = transactions.reduce((acc, tx) => {
    if (tx.type === 'INCOME') acc.income += tx.amount;
    if (tx.type === 'EXPENSE') acc.expense += tx.amount;
    return acc;
  }, { income: 0, expense: 0 });

  return { transactions, totals: { ...totals, net: totals.income - totals.expense } };
};

export const generatePdfReport = async (userId, stream) => {
  const transactions = await prisma.transaction.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
    take: 500 // Limit for PDF safety
  });

  const doc = new PDFDocument({ margin: 50 });
  doc.pipe(stream);

  doc.fontSize(20).text('Financial Report', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Generated on: ${format(new Date(), 'PPpp')}`, { align: 'right' });
  doc.moveDown(2);

  doc.fontSize(12).font('Helvetica-Bold');
  doc.text('Date', 50, doc.y, { continued: true, width: 100 });
  doc.text('Type', 150, doc.y, { continued: true, width: 80 });
  doc.text('Category', 230, doc.y, { continued: true, width: 120 });
  doc.text('Amount', 350, doc.y, { continued: true, width: 80 });
  doc.text('Note', 430, doc.y);
  doc.moveDown(0.5);

  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown(0.5);

  doc.font('Helvetica');
  let totalIncome = 0;
  let totalExpense = 0;

  transactions.forEach(tx => {
    if (doc.y > 700) doc.addPage();
    if (tx.type === 'INCOME') totalIncome += tx.amount;
    if (tx.type === 'EXPENSE') totalExpense += tx.amount;

    doc.text(format(new Date(tx.date), 'MM/dd/yyyy'), 50, doc.y, { continued: true, width: 100 });
    doc.text(tx.type, 150, doc.y, { continued: true, width: 80 });
    doc.text(tx.category || '-', 230, doc.y, { continued: true, width: 120 });
    doc.text(`$${tx.amount.toFixed(2)}`, 350, doc.y, { continued: true, width: 80 });
    doc.text(tx.note?.substring(0, 20) || '-', 430, doc.y);
    doc.moveDown(0.5);
  });

  doc.moveDown();
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown();
  
  doc.font('Helvetica-Bold').text(`Total Income: $${totalIncome.toFixed(2)}`);
  doc.text(`Total Expense: $${totalExpense.toFixed(2)}`);
  doc.text(`Net: $${(totalIncome - totalExpense).toFixed(2)}`);

  doc.end();
};

export const generateExcelReport = async (userId, stream) => {
  const transactions = await prisma.transaction.findMany({
    where: { userId },
    orderBy: { date: 'desc' }
  });

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Transactions');

  sheet.columns = [
    { header: 'Date', key: 'date', width: 15 },
    { header: 'Type', key: 'type', width: 12 },
    { header: 'Category', key: 'category', width: 20 },
    { header: 'Amount', key: 'amount', width: 12 },
    { header: 'Note', key: 'note', width: 30 }
  ];

  sheet.getRow(1).font = { bold: true };

  transactions.forEach(tx => {
    sheet.addRow({
      date: format(new Date(tx.date), 'MM/dd/yyyy'),
      type: tx.type,
      category: tx.category || '-',
      amount: tx.amount,
      note: tx.note || '-'
    });
  });

  await workbook.xlsx.write(stream);
};
