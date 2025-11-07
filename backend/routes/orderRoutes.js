import express from 'express';
import { addOrderItems, getMyOrders } from '../controllers/orderController.js';
import { createRazorpayOrder, verifyRazorpayPayment, updateOrderPayment, createCgpeyPayment, checkCgpeyStatus, handleCgpeyCallback } from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { getOrders, updateOrderToDelivered } from '../controllers/orderController.js';
import { admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, addOrderItems);
router.get('/mine', protect, getMyOrders);

// Admin routes
router.get('/', protect, admin, getOrders);
router.put('/:id/deliver', protect, admin, updateOrderToDelivered);

// Payment routes
router.post('/create-razorpay-order', protect, createRazorpayOrder);
router.post('/verify-razorpay-payment', protect, verifyRazorpayPayment);
router.put('/:id/pay', protect, updateOrderPayment);

// CGPEY routes
router.post('/cgpey/make-payment', protect, createCgpeyPayment);
router.post('/cgpey/check-status', protect, checkCgpeyStatus);
// Callback from CGPEY should be publicly accessible
router.post('/cgpey/callback', handleCgpeyCallback);

export default router;


