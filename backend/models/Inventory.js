const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true },
    category: { type: String, required: true },
    stock:    { type: Number, required: true, min: 0 },
    minStock: { type: Number, required: true, min: 0 },
    price:    { type: Number, required: true, min: 0 },
    unit:     { type: String, default: 'unit' },
    supplier: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Inventory', inventorySchema);
