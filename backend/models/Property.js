const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  rooms: {
    type: Number,
    required: true
  },
  pricePerNight: {
    type: Number,
    required: true
  },
  rating: {
    type: Number,
    default: 0
  },
  description: String,
  images: [String]
}, {
  timestamps: true
});

module.exports = mongoose.model('Property', propertySchema);
