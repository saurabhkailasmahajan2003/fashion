import asyncHandler from 'express-async-handler';
import Cart from '../models/Cart.js';
import mongoose from 'mongoose';
import Product from '../models/Product.js';

export const getMyCart = asyncHandler(async (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Not authorized' });
  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
  return res.json(cart || { user: req.user._id, items: [] });
});

export const setCartItems = asyncHandler(async (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Not authorized' });
  const { items } = req.body; // [{ product, qty }]

  if (!Array.isArray(items)) {
    return res.status(400).json({ message: 'Items must be an array' });
  }

  // Basic validation: valid ObjectId and qty >= 1
  const invalid = [];
  const ids = [];
  for (const [idx, it] of items.entries()) {
    const hasValidId = it && it.product && mongoose.Types.ObjectId.isValid(it.product);
    const hasValidQty = it && Number.isFinite(it.qty) && it.qty >= 1;
    if (!hasValidId || !hasValidQty) invalid.push(idx);
    if (hasValidId) ids.push(it.product);
  }
  if (invalid.length) {
    return res.status(400).json({ message: 'Invalid cart items', invalidIndexes: invalid });
  }

  // Ensure referenced products exist (silently drop non-existing)
  const existing = new Set((await Product.find({ _id: { $in: ids } }).select('_id')).map(p => String(p._id)));
  const normalized = items
    .filter(it => existing.has(String(it.product)))
    .map(it => ({ product: it.product, qty: Math.max(1, Math.floor(it.qty)) }));

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = new Cart({ user: req.user._id, items: [] });
  cart.items = normalized;
  await cart.save();
  const populated = await cart.populate('items.product');
  return res.json(populated);
});


