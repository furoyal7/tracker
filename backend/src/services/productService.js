import prisma from '../lib/prisma.js';
import ApiError from '../utils/ApiError.js';

export const createProduct = async (userId, productData) => {
  if (!productData.name) throw new ApiError(400, 'Product name is required');
  if (productData.price < 0) throw new ApiError(400, 'Price cannot be negative');
  if (productData.quantity < 0) throw new ApiError(400, 'Quantity cannot be negative');

  return prisma.product.create({
    data: {
      ...productData,
      userId,
      price: parseFloat(productData.price) || 0,
      quantity: parseInt(productData.quantity) || 0,
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
  if (!id) throw new ApiError(400, 'Product ID is required');
  
  const product = await prisma.product.findFirst({
    where: { id, userId },
  });

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  return product;
};

export const updateProduct = async (userId, id, updateData) => {
  const product = await getProductById(userId, id);

  if (updateData.price !== undefined && updateData.price < 0) {
    throw new ApiError(400, 'Price cannot be negative');
  }
  if (updateData.quantity !== undefined && updateData.quantity < 0) {
    throw new ApiError(400, 'Quantity cannot be negative');
  }

  return prisma.product.update({
    where: { id: product.id },
    data: {
      ...updateData,
      ...(updateData.price !== undefined && { price: parseFloat(updateData.price) }),
      ...(updateData.quantity !== undefined && { quantity: parseInt(updateData.quantity) }),
    },
  });
};

export const deleteProduct = async (userId, id) => {
  const product = await getProductById(userId, id);

  return prisma.product.delete({
    where: { id: product.id },
  });
};

export const adjustStock = async (productId, quantityToDeduct, tx = prisma) => {
  if (quantityToDeduct <= 0) return; // Nothing to do

  const product = await tx.product.findUnique({
    where: { id: productId },
  });

  if (!product) throw new ApiError(404, `Product ${productId} not found`);
  
  if (product.quantity < quantityToDeduct) {
    throw new ApiError(400, `Insufficient stock for ${product.name}. Available: ${product.quantity}, Requested: ${quantityToDeduct}`);
  }

  return tx.product.update({
    where: { id: productId },
    data: {
      quantity: {
        decrement: quantityToDeduct,
      },
    },
  });
};
