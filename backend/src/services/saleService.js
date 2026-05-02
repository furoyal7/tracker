import prisma from '../lib/prisma.js';
import * as productService from './productService.js';
import ApiError from '../utils/ApiError.js';

export const createSale = async (userId, saleData) => {
  const { 
    items, 
    amountPaid = 0, 
    totalAmount = 0, 
    customerName, 
    customerPhone, 
    customerType,
    branchId,
    dueDate,
    paymentMethod,
    ...rest 
  } = saleData;

  if (!items || items.length === 0) throw new ApiError(400, 'Sale must include at least one item');
  
  const parsedTotal = parseFloat(totalAmount);
  const parsedPaid = parseFloat(amountPaid);
  const balance = parseFloat((parsedTotal - parsedPaid).toFixed(2));
  const paymentStatus = balance <= 0 ? 'PAID' : (parsedPaid > 0 ? 'PARTIAL' : 'UNPAID');

  try {
    return await prisma.$transaction(async (tx) => {
      // 1. Create the Sale
      const sale = await tx.sale.create({
        data: {
          ...rest,
          userId,
          customerName,
          customerPhone,
          customerType,
          branchId,
          amountPaid: parsedPaid,
          totalAmount: parsedTotal,
          balance,
          paymentMethod,
          paymentStatus,
          items: {
            create: items.map(item => {
              const qty = parseInt(item.quantity) || 0;
              const price = parseFloat(item.unitPrice) || 0;
              const disc = parseFloat(item.discount) || 0;
              return {
                productId: item.productId,
                productName: item.productName,
                quantity: qty,
                unitPrice: price,
                discount: disc,
                totalPrice: parseFloat(((qty * price) - disc).toFixed(2))
              };
            })
          }
        },
        include: { items: true }
      });

      // 2. Adjust Stock for each item using the shared robust service
      for (const item of items) {
        if (item.productId) {
          await productService.adjustStock(item.productId, item.quantity, tx);
        }
      }

      // 3. Register in General Transactions
      await tx.transaction.create({
        data: {
          userId,
          amount: parsedPaid,
          type: 'INCOME',
          category: 'Sale',
          note: `Sale #${sale.id.slice(0, 8)}${customerName ? ' - ' + customerName : ''}`,
          paymentMethod,
          reference: sale.reference || `SALE-${Date.now()}`,
          partyName: customerName
        }
      });

      // 4. If there's a balance, create a Debt (Receivable)
      if (balance > 0.01) {
        await tx.debt.create({
          data: {
            userId,
            name: customerName || 'Walk-in Customer',
            phone: customerPhone,
            totalAmount: parsedTotal,
            remainingAmount: balance,
            type: 'RECEIVABLE',
            dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            status: 'UNPAID'
          }
        });
      }

      return sale;
    });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, `Sale creation failed: ${error.message}`);
  }
};

export const getSales = async (userId, filters = {}) => {
  const { skip = 0, take = 20 } = filters;
  
  return prisma.sale.findMany({
    where: { userId },
    include: { items: true },
    orderBy: { createdAt: 'desc' },
    skip: Math.max(0, parseInt(skip) || 0),
    take: Math.min(100, parseInt(take) || 20)
  });
};

export const getSaleById = async (userId, id) => {
  if (!id) throw new ApiError(400, 'Sale ID is required');

  const sale = await prisma.sale.findFirst({
    where: { id, userId },
    include: { items: true }
  });

  if (!sale) throw new ApiError(404, 'Sale record not found');
  return sale;
};
