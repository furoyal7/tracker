import prisma from '../lib/prisma.js';

export const createProduct = async (userId, productData) => {
  return prisma.product.create({
    data: {
      ...productData,
      userId,
    },
  });
};

export const getProducts = async (userId) => {
  return prisma.product.findMany({
    where: { userId },
    orderBy: { name: 'asc' },
  });
};

export const getProductById = async (userId, id) => {
  const product = await prisma.product.findFirst({
    where: { id, userId },
  });

  if (!product) {
    throw new Error('Product not found');
  }

  return product;
};

export const updateProduct = async (userId, id, updateData) => {
  const product = await getProductById(userId, id);

  return prisma.product.update({
    where: { id: product.id },
    data: updateData,
  });
};

export const deleteProduct = async (userId, id) => {
  const product = await getProductById(userId, id);

  return prisma.product.delete({
    where: { id: product.id },
  });
};

export const adjustStock = async (productId, quantityToDeduct) => {
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) throw new Error('Product not found');
  if (product.quantity < quantityToDeduct) {
    throw new Error(`Insufficient stock for ${product.name}`);
  }

  return prisma.product.update({
    where: { id: productId },
    data: {
      quantity: {
        decrement: quantityToDeduct,
      },
    },
  });
};
