const mongoose = require('mongoose');

const HotDealSchema = new mongoose.Schema({
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  }],
  title: {
    type: String,
    required: true,
  },
  dealEndTime: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('HotDeal', HotDealSchema);