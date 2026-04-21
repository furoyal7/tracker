import * as productService from '../services/productService.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { z } from 'zod';

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  quantity: z.number().int().min(0, 'Quantity cannot be negative'),
  costPrice: z.number().min(0, 'Cost price cannot be negative'),
  sellingPrice: z.number().min(0, 'Selling price cannot be negative'),
});

export const createProduct = async (req, res) => {
  try {
    const validatedData = productSchema.parse(req.body);
    const product = await productService.createProduct(req.user.id, validatedData);
    return successResponse(res, product, 'Product added to inventory', 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(res, error.errors[0].message, 400);
    }
    return errorResponse(res, error.message, 400);
  }
};

export const getProducts = async (req, res) => {
  try {
    const products = await productService.getProducts(req.user.id);
    return successResponse(res, products, 'Inventory retrieved');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

export const updateProduct = async (req, res) => {
  try {
    const validatedData = productSchema.partial().parse(req.body);
    const product = await productService.updateProduct(req.user.id, req.params.id, validatedData);
    return successResponse(res, product, 'Product updated');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(res, error.errors[0].message, 400);
    }
    return errorResponse(res, error.message, 400);
  }
};

export const deleteProduct = async (req, res) => {
  try {
    await productService.deleteProduct(req.user.id, req.params.id);
    return successResponse(res, null, 'Product removed from inventory');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};
