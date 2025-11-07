import express from 'express';
import { authUser, registerUser, getProfile, getUsers, forgotPassword, resetPassword } from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', authUser);
router.post('/register', registerUser);
router.get('/profile', protect, getProfile);
router.get('/', protect, admin, getUsers);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;


