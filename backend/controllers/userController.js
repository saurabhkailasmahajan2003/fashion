import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';
import crypto from 'crypto';

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) return res.status(400).json({ message: 'User already exists' });
  const user = await User.create({ name, email, password });
  return res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
    token: generateToken(user._id)
  });
});

export const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && (await user.matchPassword(password))) {
    return res.json({ _id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin, token: generateToken(user._id) });
  }
  return res.status(401).json({ message: 'Invalid email or password' });
});

export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  return res.json(user);
});

// Admin: list users
export const getUsers = asyncHandler(async (_req, res) => {
  const users = await User.find({}).select('_id name email isAdmin createdAt');
  return res.json(users);
});

// Forgot password: generate token and set expiry, log reset link (email integration can be added later)
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });
  const user = await User.findOne({ email });
  // Always respond with success to prevent email enumeration
  if (!user) return res.json({ message: 'If that email exists, a reset link has been sent' });

  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashed = crypto.createHash('sha256').update(rawToken).digest('hex');
  user.resetPasswordToken = hashed;
  user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save({ validateBeforeSave: false });

  const appUrl = process.env.APP_URL || 'http://localhost:5173';
  const resetLink = `${appUrl}/reset-password?token=${rawToken}&email=${encodeURIComponent(email)}`;
  // eslint-disable-next-line no-console
  console.log('Password reset link (dev):', resetLink);
  return res.json({ message: 'If that email exists, a reset link has been sent' });
});

// Reset password: verify token and expiry, then set new password
export const resetPassword = asyncHandler(async (req, res) => {
  const { email, token, password } = req.body;
  if (!email || !token || !password) return res.status(400).json({ message: 'Email, token and new password are required' });
  const hashed = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({ email, resetPasswordToken: hashed, resetPasswordExpires: { $gt: new Date() } });
  if (!user) return res.status(400).json({ message: 'Invalid or expired reset token' });

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  return res.json({ message: 'Password has been reset successfully' });
});


