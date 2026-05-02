import * as productService from '../services/productService.js';
import { successResponse } from '../utils/response.js';
import { z } from 'zod';
import ApiError from '../utils/ApiError.js';

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  quantity: z.number().int().min(0, 'Quantity cannot be negative'),
  costPrice: z.number().min(0, 'Cost price cannot be negative'),
  sellingPrice: z.number().min(0, 'Selling price cannot be negative'),
});

export const createProduct = async (req, res, next) => {
  try {
    const validatedData = productSchema.parse(req.body);
    const product = await productService.createProduct(req.user.id, {
      name: validatedData.name,
      quantity: validatedData.quantity,
      price: validatedData.sellingPrice, // Mapping sellingPrice to price in DB if needed
      costPrice: validatedData.costPrice,
    });
    return successResponse(res, product, 'Product added to inventory', 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new ApiError(400, error.errors[0].message));
    }
    next(error);
  }
};

export const getProducts = async (req, res, next) => {
  try {
    const products = await productService.getProducts(req.user.id);
    return successResponse(res, products, 'Inventory retrieved');
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const validatedData = productSchema.partial().parse(req.body);
    const product = await productService.updateProduct(req.user.id, req.params.id, validatedData);
    return successResponse(res, product, 'Product updated');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new ApiError(400, error.errors[0].message));
    }
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    await productService.deleteProduct(req.user.id, req.params.id);
    return successResponse(res, null, 'Product removed from inventory');
  } catch (error) {
    next(error);
  }
};
