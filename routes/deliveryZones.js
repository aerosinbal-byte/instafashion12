const express = require('express');
const router = express.Router();
const DeliveryZone = require('../models/DeliveryZone');

// Seed data (for demonstration purposes)
const seedDeliveryZones = async () => {
  try {
    await DeliveryZone.deleteMany({});
    const zones = [
      { zoneName: 'Labhandih', pincodes: ['492001'], deliveryTime: '30 min delivery' },
      { zoneName: 'Raipur City', pincodes: ['492002', '492003', '492004', '492005', '492006', '492007', '492008', '492009', '492010'], deliveryTime: '2 hr delivery' },
      { zoneName: 'Other', pincodes: [], deliveryTime: '1-2 days delivery' } // Default
    ];
    await DeliveryZone.insertMany(zones);
    console.log('Delivery zones seeded');
  } catch (error) {
    console.error('Error seeding delivery zones:', error);
  }
};

// Seed the data when the server starts
seedDeliveryZones();

// @route   GET api/delivery-zones/time/:pincode
// @desc    Get delivery time for a given pincode
// @access  Public
router.get('/time/:pincode', async (req, res) => {
  try {
    const { pincode } = req.params;
    let zone = await DeliveryZone.findOne({ pincodes: pincode });

    if (!zone) {
      // If pincode not found in specific zones, find the default
      zone = await DeliveryZone.findOne({ zoneName: 'Other' });
    }

    if (!zone) {
        return res.status(404).json({ msg: 'Delivery information not available for this area.' });
    }

    res.json({ deliveryTime: zone.deliveryTime });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;