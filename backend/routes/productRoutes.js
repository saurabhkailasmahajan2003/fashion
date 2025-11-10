import express from 'express'
import { getProducts, getProductById, createProduct, deleteProduct } from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/:id', getProductById);

// Admin actions
router.post('/', protect, admin, createProduct);
router.delete('/:id', protect, admin, deleteProduct);

export default router;


