const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { auth, admin } = require('../middleware/auth'); // Middleware import karein
const Razorpay = require('razorpay');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @route   GET api/orders
// @desc    Get all orders
// Admin-only route
router.get('/', [auth, admin], async (req, res) => {
  try {
    const orders = await Order.find().populate('products.productId');
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/orders/create-razorpay-order
// @desc    Create a Razorpay order
router.post('/create-razorpay-order', async (req, res) => {
  try {
    const { amount } = req.body; // amount should be in paise
    const options = {
      amount: amount,
      currency: 'INR',
      receipt: `receipt_order_${new Date().getTime()}`,
    };

    const order = await razorpay.orders.create(options);

    if (!order) {
      return res.status(500).send('Error creating Razorpay order');
    }

    res.json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/orders/verify-payment
// @desc    Verify payment and create a new order in DB
router.post('/verify-payment', async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderData, // customerName, contact, address, etc.
  } = req.body;

  const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
  shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
  const digest = shasum.digest('hex');

  if (digest !== razorpay_signature) {
    return res.status(400).json({ msg: 'Transaction not legit!' });
  }

  // Payment is legit, now create order in your database
  const newOrder = new Order({
    ...orderData,
    paymentStatus: 'Paid',
    paymentDetails: {
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
    }
  });

  try {
    let savedOrder = await newOrder.save();
    // Populate product details before sending response
    savedOrder = await savedOrder.populate('products.productId');

    // Send order confirmation email
    try {
      const emailHtml = `
        <h1>Thank you for your order!</h1>
        <p>Hi ${savedOrder.customerName},</p>
        <p>Your order with ID <strong>${savedOrder._id}</strong> has been placed successfully.</p>
        <h3>Order Summary</h3>
        <ul>
          ${savedOrder.products.map(p => `<li>${p.productId.name} - Quantity: ${p.quantity}</li>`).join('')}
        </ul>
        <h4>Total: ₹${savedOrder.totalAmount.toFixed(2)}</h4>
        <p>We will notify you when your order is shipped.</p>
      `;

      await sendEmail({
        email: savedOrder.email,
        subject: `Your InstaFashion Order Confirmation [${savedOrder._id}]`,
        html: emailHtml,
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // We don't want to fail the whole request if email fails
    }

    res.status(201).json({ msg: 'Order placed successfully!', order: savedOrder });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/orders/:id
// @desc    Update order status
// Admin-only route
router.put('/:id', [auth, admin], async (req, res) => {
  const { orderStatus, paymentStatus } = req.body;

  const orderFields = {};
  if (orderStatus) orderFields.orderStatus = orderStatus;
  if (paymentStatus) orderFields.paymentStatus = paymentStatus;

  try {
    let order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ msg: 'Order not found' });

    order = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: orderFields },
      { new: true }
    );

    res.json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
