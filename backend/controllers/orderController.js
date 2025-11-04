import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js';

export const addOrderItems = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod, itemsPrice, taxPrice, shippingPrice, totalPrice } = req.body;
  if (!orderItems || orderItems.length === 0) return res.status(400).json({ message: 'No order items' });
  const order = await Order.create({
    user: req.user._id,
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice
  });
  return res.status(201).json(order);
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  return res.json(orders);
});

// Admin: get all orders
export const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).sort({ createdAt: -1 }).populate('user', 'name email');
  return res.json(orders);
});

// Admin: mark order as delivered
export const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  order.isDelivered = true;
  order.deliveredAt = new Date();
  await order.save();
  return res.json({ message: 'Order marked as delivered', order });
});


