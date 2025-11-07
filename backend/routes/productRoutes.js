import express from 'express';
import { getProducts, getProductById, createProduct, deleteProduct, updateProduct, pruneDuplicateProductsByImageUrl } from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getProducts);
// Admin utility: place before dynamic :id to avoid routing conflicts
router.post('/prune-duplicates', protect, admin, pruneDuplicateProductsByImageUrl);
router.get('/:id', getProductById);

// Admin actions
router.post('/', protect, admin, createProduct);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

export default router;
