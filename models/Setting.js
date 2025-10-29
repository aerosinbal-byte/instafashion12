const mongoose = require('mongoose');

const SettingSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  value: {
    hotDeals: {
      title: String,
      durationMinutes: Number,
      products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      }]
    },
    trendingCategories: [String]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Setting', SettingSchema);