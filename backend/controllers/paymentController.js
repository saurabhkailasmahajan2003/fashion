import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';

// CGPEY endpoints and helpers
const CGPEY_BASE = 'https://merchant.cgpey.com/api/v2';
const CGPEY_MAKE_PAYMENT_URL = `${CGPEY_BASE}/makepayment`;
const CGPEY_CHECK_STATUS_URL = `${CGPEY_BASE}/payment-check-status`;

const buildCgpeyHeaders = () => ({
  'Content-Type': 'application/json',
  'x-api-key': process.env.CGPEY_API_KEY || '',
  'x-secret-key': process.env.CGPEY_SECRET_KEY || '',
  'ip-address': process.env.CGPEY_WHITELISTED_IP || process.env.CGPEY_IP || '127.0.0.1'
});

// Initialize Razorpay only if keys are configured
// This prevents error when server starts without keys
const getRazorpayInstance = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  
  if (!keyId || !keySecret || keyId === '' || keySecret === '') {
    return null;
  }
  
  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret
  });
};

// Create Razorpay order and payment link
export const createRazorpayOrder = asyncHandler(async (req, res) => {
  // Repurposed to CGPEY makepayment to preserve existing route
  const { orderItems, shippingAddress } = req.body;

  if (!orderItems || orderItems.length === 0) {
    return res.status(400).json({ message: 'No order items' });
  }
  if (!shippingAddress || !shippingAddress.name || !shippingAddress.phone) {
    return res.status(400).json({ message: 'Shipping address with name and phone is required' });
  }

  const orderItemsWithDetails = orderItems.map(item => ({
    product: item.product,
    name: item.name || item.data?.name || 'Product',
    qty: item.qty,
    price: item.price || item.data?.price || 0,
    image: item.image || item.data?.images?.[0] || ''
  }));

  const itemsPrice = orderItems.reduce((sum, item) => sum + (item.price || item.data?.price || 0) * item.qty, 0);
  const shippingPrice = itemsPrice > 100 ? 0 : 5;
  const taxPrice = +(itemsPrice * 0.1).toFixed(2);
  const totalPrice = +(itemsPrice + shippingPrice + taxPrice).toFixed(2);

  const order = await Order.create({
    user: req.user._id,
    orderItems: orderItemsWithDetails,
    shippingAddress,
    paymentMethod: 'cgpey',
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    isPaid: false
  });

  const headers = buildCgpeyHeaders();
  if (!headers['x-api-key'] || !headers['x-secret-key']) {
    return res.status(400).json({
      orderId: order._id,
      message: 'CGPEY API keys not configured. Please set CGPEY_API_KEY and CGPEY_SECRET_KEY in backend/.env.'
    });
  }

  const payload = {
    name: shippingAddress.name,
    mobile_number: String(shippingAddress.phone).replace(/\D/g, '').slice(-10),
    transaction_id: order._id.toString(),
    Amount: Math.round(totalPrice)
  };

  try {
    const resp = await fetch(CGPEY_MAKE_PAYMENT_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok || data.status === false) {
      return res.status(502).json({ orderId: order._id, error: 'CGPEY makepayment failed', details: data });
    }

    order.paymentResult = {
      provider: 'cgpey',
      txnId: data?.data?.txnId,
      clientRefId: data?.data?.clientRefId,
      status: data?.data?.status || data?.data?.paymentState,
      intentData: data?.data?.intentData || null,
      qrData: data?.data?.qrData || null
    };
    await order.save();

    return res.json({
      orderId: order._id,
      amount: Math.round(totalPrice),
      currency: 'INR',
      cgpey: data?.data || {},
      message: data?.message || 'Payment intent created successfully.'
    });
  } catch (error) {
    return res.status(500).json({ orderId: order._id, error: 'CGPEY makepayment error', details: error?.message || error });
  }
});

// Verify Razorpay payment
export const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  // Repurposed to check CGPEY status
  const { orderId } = req.body;

  const headers = buildCgpeyHeaders();
  if (!headers['x-api-key'] || !headers['x-secret-key']) {
    return res.status(400).json({ message: 'CGPEY API keys not configured' });
  }
  try {
    const resp = await fetch(CGPEY_CHECK_STATUS_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({ transaction_id: orderId })
    });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) return res.status(502).json({ error: 'CGPEY check-status failed', details: data });

    if (String(data.status).toLowerCase() === 'success' || data.status === true) {
      const order = await Order.findById(orderId);
      if (order) {
        order.isPaid = true;
        order.paidAt = new Date();
        order.paymentResult = {
          provider: 'cgpey',
          status: 'SUCCESS',
          utr: data.utr,
          amount: data.amount
        };
        await order.save();
        await Cart.findOneAndDelete({ user: order.user });
      }
      return res.json({ message: 'Payment verified successfully', data });
    }
    return res.status(400).json({ message: 'Payment not successful yet', data });
  } catch (err) {
    return res.status(500).json({ error: 'CGPEY verify error', details: err?.message || err });
  }
});

// Update order payment status
export const updateOrderPayment = asyncHandler(async (req, res) => {
  const { orderId, paymentResult } = req.body;
  const order = await Order.findById(orderId);

  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  if (order.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  order.isPaid = true;
  order.paidAt = new Date();
  order.paymentResult = paymentResult;
  await order.save();

  // Clear cart
  await Cart.findOneAndDelete({ user: req.user._id });

  res.json(order);
});

// ========================= CGPEY INTEGRATION =========================

// Create CGPEY payment intent (Make Payment)
export const createCgpeyPayment = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress } = req.body;

  if (!orderItems || orderItems.length === 0) return res.status(400).json({ message: 'No order items' });
  if (!shippingAddress || !shippingAddress.name || !shippingAddress.phone) {
    return res.status(400).json({ message: 'Shipping address with name and phone is required' });
  }

  // Calculate totals
  const itemsPrice = orderItems.reduce((sum, item) => sum + (item.price || item.data?.price || 0) * item.qty, 0);
  const shippingPrice = itemsPrice > 100 ? 0 : 5;
  const taxPrice = +(itemsPrice * 0.1).toFixed(2);
  const totalPrice = +(itemsPrice + shippingPrice + taxPrice).toFixed(2);

  // Create order first
  const orderItemsWithDetails = orderItems.map(item => ({
    product: item.product,
    name: item.name || item.data?.name || 'Product',
    qty: item.qty,
    price: item.price || item.data?.price || 0,
    image: item.image || item.data?.images?.[0] || ''
  }));

  const order = await Order.create({
    user: req.user._id,
    orderItems: orderItemsWithDetails,
    shippingAddress,
    paymentMethod: 'cgpey',
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    isPaid: false
  });

  // Build CGPEY request
  const headers = buildCgpeyHeaders();
  if (!headers['x-api-key'] || !headers['x-secret-key']) {
    return res.status(400).json({
      orderId: order._id,
      message: 'CGPEY API keys not configured. Please set CGPEY_API_KEY and CGPEY_SECRET_KEY in backend/.env.'
    });
  }

  const payload = {
    name: shippingAddress.name,
    mobile_number: String(shippingAddress.phone).replace(/\D/g, '').slice(-10),
    transaction_id: order._id.toString(),
    Amount: Math.round(totalPrice) // CGPEY expects integer amount
  };

  try {
    const resp = await fetch(CGPEY_MAKE_PAYMENT_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    const data = await resp.json().catch(() => ({}));
    if (!resp.ok || data.status === false) {
      return res.status(502).json({
        orderId: order._id,
        error: 'CGPEY makepayment failed',
        details: data
      });
    }

    // Attach initial paymentResult for tracking
    order.paymentResult = {
      provider: 'cgpey',
      txnId: data?.data?.txnId,
      clientRefId: data?.data?.clientRefId,
      status: data?.data?.status || data?.data?.paymentState,
      intentData: data?.data?.intentData || null,
      qrData: data?.data?.qrData || null
    };
    await order.save();

    return res.json({
      orderId: order._id,
      amount: Math.round(totalPrice),
      currency: 'INR',
      cgpey: data?.data || {},
      message: data?.message || 'Payment intent created successfully.'
    });
  } catch (err) {
    return res.status(500).json({
      orderId: order._id,
      error: 'CGPEY makepayment error',
      details: err?.message || err
    });
  }
});

// Check CGPEY transaction status
export const checkCgpeyStatus = asyncHandler(async (req, res) => {
  const { transaction_id } = req.body;
  if (!transaction_id) return res.status(400).json({ message: 'transaction_id is required' });

  const headers = buildCgpeyHeaders();
  if (!headers['x-api-key'] || !headers['x-secret-key']) {
    return res.status(400).json({ message: 'CGPEY API keys not configured' });
  }

  try {
    const resp = await fetch(CGPEY_CHECK_STATUS_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({ transaction_id })
    });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      return res.status(502).json({ error: 'CGPEY check-status failed', details: data });
    }

    // If success, try to mark order as paid
    if (String(data.status).toLowerCase() === 'success' || data.status === true) {
      try {
        const order = await Order.findById(transaction_id);
        if (order) {
          order.isPaid = true;
          order.paidAt = new Date();
          order.paymentResult = {
            provider: 'cgpey',
            status: 'SUCCESS',
            utr: data.utr,
            amount: data.amount
          };
          await order.save();
          await Cart.findOneAndDelete({ user: order.user });
        }
      } catch (_) {}
    }

    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: 'CGPEY check-status error', details: err?.message || err });
  }
});

// CGPEY callback/webhook (public)
export const handleCgpeyCallback = asyncHandler(async (req, res) => {
  // Expected body example:
  // { status: 'SUCCESS', order_id: 'order_id', message: 'Transaction Successfully', utr: '...', amount: '11.00', date: '...' }
  const { status, order_id, utr, amount } = req.body || {};
  if (!order_id) return res.status(400).json({ message: 'order_id missing' });

  try {
    const order = await Order.findById(order_id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (String(status).toUpperCase() === 'SUCCESS') {
      order.isPaid = true;
      order.paidAt = new Date();
      order.paymentResult = {
        provider: 'cgpey',
        status: 'SUCCESS',
        utr,
        amount
      };
      await order.save();
      await Cart.findOneAndDelete({ user: order.user });
    }

    // Acknowledge receipt
    return res.json({ received: true });
  } catch (err) {
    return res.status(500).json({ message: 'Callback processing error', error: err?.message || err });
  }
});

