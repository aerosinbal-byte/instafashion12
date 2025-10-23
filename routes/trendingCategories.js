const express = require('express');
const router = express.Router();
const TrendingCategory = require('../models/TrendingCategory');
const { auth, admin } = require('../middleware/auth');

// @route   GET api/trending-categories
// @desc    Get all trending categories
router.get('/', async (req, res) => {
  try {
    const categories = await TrendingCategory.find().populate('products');
    res.json(categories);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/trending-categories
// @desc    Create a new trending category
router.post('/', [auth, admin], async (req, res) => {
  const { name, productIds } = req.body;

  try {
    const newCategory = new TrendingCategory({
      name,
      products: productIds,
    });

    const category = await newCategory.save();
    res.json(category);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/trending-categories/:id
// @desc    Update a trending category
router.put('/:id', [auth, admin], async (req, res) => {
  const { name, productIds } = req.body;

  try {
    let category = await TrendingCategory.findById(req.params.id);

    if (!category) return res.status(404).json({ msg: 'Category not found' });

    category.name = name;
    category.products = productIds;

    await category.save();
    res.json(category);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/trending-categories/:id
// @desc    Delete a trending category
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    const category = await TrendingCategory.findById(req.params.id);

    if (!category) return res.status(404).json({ msg: 'Category not found' });

    await category.remove();

    res.json({ msg: 'Category removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
