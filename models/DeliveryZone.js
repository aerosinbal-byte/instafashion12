
const mongoose = require('mongoose');

const deliveryZoneSchema = new mongoose.Schema({
  zoneName: {
    type: String,
    required: true,
    trim: true
  },
  pincodes: [{
    type: String,
    required: true
  }],
  deliveryTime: {
    type: String, // e.g., "30 mins", "2 hours", "1-2 days"
    required: true
  }
});

const DeliveryZone = mongoose.model('DeliveryZone', deliveryZoneSchema);

module.exports = DeliveryZone;
