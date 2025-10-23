const express = require('express');
const router = express.Router();
const multer = require('multer');
const Product = require('../models/Product');
const { auth, admin } = require('../middleware/auth');

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage: storage });

// @route   GET api/products
// @desc    Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    const productsWithFullImageUrl = products.map(product => {
      if (product.imageUrl) {
        product.imageUrl = `${req.protocol}://${req.get('host')}${product.imageUrl}`;
      }
      return product;
    });
    res.json(productsWithFullImageUrl);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/products/:id
// @desc    Get a single product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }
    if (product.imageUrl) {
      product.imageUrl = `${req.protocol}://${req.get('host')}${product.imageUrl}`;
    }
    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/products
// @desc    Add a new product
// Admin-only route
router.post('/', [auth, admin, upload.single('image')], async (req, res) => {
  const { name, price, description, category, stock } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

  try {
    const newProduct = new Product({
      name,
      price,
      description,
      imageUrl,
      category,
      stock,
    });

    const product = await newProduct.save();

    if (product.imageUrl) {
      product.imageUrl = `${req.protocol}://${req.get('host')}${product.imageUrl}`;
    }

    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/products/:id
// @desc    Update a product
// Admin-only route
router.put('/:id', [auth, admin, upload.single('image')], async (req, res) => {
  const { name, price, description, category, stock } = req.body;

  // Build product object
  const productFields = {};
  if (name) productFields.name = name;
  if (price) productFields.price = price;
  if (description) productFields.description = description;
  if (category) productFields.category = category;
  if (stock) productFields.stock = stock;
  if (req.file) {
    productFields.imageUrl = `/uploads/${req.file.filename}`;
  }

  try {
    let product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ msg: 'Product not found' });

    product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: productFields },
      { new: true }
    );

    if (product.imageUrl) {
      product.imageUrl = `${req.protocol}://${req.get('host')}${product.imageUrl}`;
    }

    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/products/:id
// @desc    Delete a product
// Admin-only route
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ msg: 'Product not found' });

    await Product.findByIdAndRemove(req.params.id);

    res.json({ msg: 'Product removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
