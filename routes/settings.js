const express = require('express');
const router = express.Router();
const Setting = require('../models/Setting');

const { auth, admin } = require('../middleware/auth');


// @route   GET api/settings/homepage
// @desc    Get homepage settings (hot deals and trending categories)
router.get('/homepage', async (req, res) => {
  try {
    // Find the settings document for 'homepage'
    const settings = await Setting.findOne({ key: 'homepage' });

    if (settings) {
      res.json({
        hotDeals: settings.value.hotDeals,
        trendingCategories: settings.value.trendingCategories
      });
    } else {
      // If no settings are found, return a default empty structure
      res.json({
        hotDeals: { title: 'Flash Sale!', durationMinutes: 30, products: [] },
        trendingCategories: []
      });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/settings/homepage
// @desc    Update homepage settings
// @access  Private/Admin
router.post('/homepage', [auth, admin], async (req, res) => {
  const { hotDeals, trendingCategories } = req.body;

  try {
    // Use findOneAndUpdate with upsert: true to create the document if it doesn't exist
    const updatedSettings = await Setting.findOneAndUpdate(
      { key: 'homepage' }, // find a document with this filter
      { 
        key: 'homepage',
        'value.hotDeals': hotDeals,
        'value.trendingCategories': trendingCategories,
      }, // document to insert when `upsert: true`
      { 
        new: true, // return the new, updated document
        upsert: true, // create the document if it does not exist
        setDefaultsOnInsert: true
      }
    );
    res.json(updatedSettings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
