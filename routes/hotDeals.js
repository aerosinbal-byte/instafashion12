const express = require('express');
const router = express.Router();
const HotDeal = require('../models/HotDeal');
const { auth, admin } = require('../middleware/auth');

// @route   GET api/hot-deals
// @desc    Get the current hot deal
router.get('/', async (req, res) => {
  try {
    const hotDeal = await HotDeal.findOne().populate('products');
    res.json(hotDeal);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/hot-deals
// @desc    Create or update a hot deal
router.post('/', [auth, admin], async (req, res) => {
  const { productIds, title, dealEndTime } = req.body;

  try {
    let hotDeal = await HotDeal.findOne();

    if (hotDeal) {
      // Update existing hot deal
      hotDeal.products = productIds;
      hotDeal.title = title;
      hotDeal.dealEndTime = dealEndTime;
      await hotDeal.save();
    } else {
      // Create a new hot deal
      hotDeal = new HotDeal({
        products: productIds,
        title,
        dealEndTime,
      });
      await hotDeal.save();
    }

    res.json(hotDeal);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
