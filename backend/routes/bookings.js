const express = require('express');
const router = express.Router();
const {
  getBookings, getBooking, createBooking, updateBooking,
  cancelBooking, deleteBooking, getAvailableSlots, getReports,
} = require('../controllers/bookingController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/slots', protect, getAvailableSlots);
router.get('/reports', protect, adminOnly, getReports);
router.get('/', protect, getBookings);
router.get('/:id', protect, getBooking);
router.post('/', protect, createBooking);
router.put('/:id', protect, updateBooking);
router.patch('/:id/cancel', protect, cancelBooking);
router.delete('/:id', protect, adminOnly, deleteBooking);

module.exports = router;
