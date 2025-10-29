const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Order = require('../models/Order');
const { auth } = require('../middleware/auth');

// @route   GET api/dashboard/stats
// @desc    Get dashboard stats
// @access  Private
router.get('/stats', auth, async (req, res) => {
    try {
        const totalProducts = await Product.countDocuments();
        const totalOrders = await Order.countDocuments();
        res.json({ totalProducts, totalOrders });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;