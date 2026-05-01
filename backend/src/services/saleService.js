import prisma from '../lib/prisma.js';

export const createSale = async (userId, saleData) => {
  const { 
    items, 
    amountPaid, 
    totalAmount, 
    customerName, 
    customerPhone, 
    customerType,
    branchId,
    dueDate,
    paymentMethod,
    ...rest 
  } = saleData;

  const balance = totalAmount - amountPaid;
  const paymentStatus = balance <= 0 ? 'PAID' : (amountPaid > 0 ? 'PARTIAL' : 'UNPAID');

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
          amountPaid,
          totalAmount,
          balance,
          paymentMethod,
          paymentStatus,
          items: {
            create: items.map(item => ({
              productId: item.productId,
              productName: item.productName,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              discount: item.discount || 0,
              totalPrice: (item.quantity * item.unitPrice) - (item.discount || 0)
            }))
          }
        },
        include: { items: true }
      });

      // 2. Adjust Stock for each item
      for (const item of items) {
        if (item.productId) {
          const product = await tx.product.findUnique({ where: { id: item.productId } });
          if (!product) throw new Error(`Product ${item.productName} not found`);
          if (product.quantity < item.quantity) {
            throw new Error(`Insufficient stock for ${item.productName}`);
          }

          await tx.product.update({
            where: { id: item.productId },
            data: { quantity: { decrement: item.quantity } }
          });
        }
      }

      // 3. Register in General Transactions (for ledger/reports)
      await tx.transaction.create({
        data: {
          userId,
          amount: amountPaid,
          type: 'INCOME',
          category: 'Sale',
          note: `Sale #${sale.id.slice(0, 8)}${customerName ? ' - ' + customerName : ''}`,
          paymentMethod,
          reference: sale.reference,
          partyName: customerName
        }
      });

      // 4. If there's a balance, create a Debt (Receivable)
      if (balance > 0) {
        await tx.debt.create({
          data: {
            userId,
            name: customerName || 'Walk-in Customer',
            phone: customerPhone,
            totalAmount,
            remainingAmount: balance,
            type: 'RECEIVABLE',
            dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30 days
            status: 'UNPAID'
          }
        });
      }

      return sale;
    });
  } catch (error) {
    throw error;
  }
};

export const getSales = async (userId, filters = {}) => {
  const { skip = 0, take = 20 } = filters;
  
  return prisma.sale.findMany({
    where: { userId },
    include: { items: true },
    orderBy: { createdAt: 'desc' },
    skip: parseInt(skip),
    take: parseInt(take)
  });
};

export const getSaleById = async (userId, id) => {
  const sale = await prisma.sale.findFirst({
    where: { id, userId },
    include: { items: true }
  });

  if (!sale) throw new Error('Sale record not found');
  return sale;
};
