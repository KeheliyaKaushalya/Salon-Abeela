const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    price:       { type: Number, required: true, min: 0 },
    duration:    { type: String, required: true },
    category:    { type: String, required: true },
    icon:        { type: String, default: '✦' },
    description: { type: String, default: '' },
    isActive:    { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Service', serviceSchema);
