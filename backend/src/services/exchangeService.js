import prisma from '../lib/prisma.js';

/**
 * Generate a unique reference code: EXCH-YYYY-XXXX
 */
const generateReferenceCode = () => {
  const year = new Date().getFullYear();
  const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `EXCH-${year}-${randomChars}`;
};

export const createOrder = async (userId, orderData) => {
  const { fromCurrency, toCurrency, amount, exchangeRate } = orderData;
  const expectedReceiveAmount = amount * exchangeRate;
  const referenceCode = generateReferenceCode();

  return prisma.exchangeOrder.create({
    data: {
      userId,
      fromCurrency,
      toCurrency,
      amount,
      exchangeRate,
      expectedReceiveAmount,
      referenceCode,
      status: 'pending'
    }
  });
};

export const getOrders = async (filters = {}) => {
  const { userId, status, skip = 0, take = 20 } = filters;
  
  return prisma.exchangeOrder.findMany({
    where: {
      ...(userId && { userId }),
      ...(status && { status })
    },
    include: {
      user: {
        select: { email: true }
      },
      proof: true
    },
    orderBy: { createdAt: 'desc' },
    skip: parseInt(skip),
    take: parseInt(take)
  });
};

export const getOrderById = async (id) => {
  return prisma.exchangeOrder.findUnique({
    where: { id },
    include: {
      user: {
        select: { email: true }
      },
      proof: true,
      logs: true
    }
  });
};

export const uploadPaymentProof = async (orderId, proofData) => {
  const { imageUrl, senderName, amountSent, referenceUsed } = proofData;

  const order = await prisma.exchangeOrder.findUnique({
    where: { id: orderId }
  });

  if (!order) throw new Error('Order not found');
  if (order.status !== 'pending') throw new Error('Order already has proof or is processed');

  // Basic Validation (Level 2)
  const isAmountMatch = parseFloat(amountSent) === order.amount;
  const isReferenceMatch = referenceUsed.trim() === order.referenceCode.trim();
  const result = (isAmountMatch && isReferenceMatch) ? 'matched' : 'mismatch';

  return prisma.$transaction(async (tx) => {
    // 1. Create Proof
    await tx.paymentProof.create({
      data: {
        orderId,
        imageUrl,
        status: 'pending'
      }
    });

    // 2. Create Verification Log
    await tx.verificationLog.create({
      data: {
        orderId,
        checkedAmount: parseFloat(amountSent),
        checkedSenderName: senderName || 'Unknown',
        checkedReference: referenceUsed,
        result
      }
    });

    // 3. Update Order Status
    const nextStatus = result === 'matched' ? 'ready_for_confirmation' : 'under_review';
    
    return tx.exchangeOrder.update({
      where: { id: orderId },
      data: {
        status: nextStatus,
        senderName
      }
    });
  });
};

export const confirmPayment = async (orderId) => {
  return prisma.$transaction(async (tx) => {
    const order = await tx.exchangeOrder.update({
      where: { id: orderId },
      data: { status: 'confirmed' }
    });

    await tx.paymentProof.update({
      where: { orderId },
      data: { status: 'verified' }
    });

    return order;
  });
};

export const rejectPayment = async (orderId) => {
  return prisma.$transaction(async (tx) => {
    const order = await tx.exchangeOrder.update({
      where: { id: orderId },
      data: { status: 'rejected' }
    });

    await tx.paymentProof.update({
      where: { orderId },
      data: { status: 'rejected' }
    });

    return order;
  });
};

export const completeOrder = async (orderId) => {
  return prisma.exchangeOrder.update({
    where: { id: orderId },
    data: { status: 'completed' }
  });
};
