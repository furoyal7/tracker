import express from 'express';
import { authMiddleware } from '../middlewares/auth.js';
import * as productController from '../controllers/ProductController.js';

const router = express.Router();

router.use(authMiddleware);


router.post('/', productController.createProduct);
router.get('/', productController.getProducts);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

export default router;
