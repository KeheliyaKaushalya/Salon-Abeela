const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    service:   { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    stylist:   { type: String, required: true, enum: ['Any Available', 'Hemamali', 'Wageesha', 'Nishadi', 'Rasula'] },
    date:      { type: Date, required: true },
    timeSlot:  { type: String, required: true },
    notes:     { type: String, default: '' },
    price:     { type: Number, required: true },
    status:    { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
