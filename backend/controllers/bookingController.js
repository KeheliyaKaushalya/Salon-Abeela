const Booking = require('../models/Booking');
const Service = require('../models/Service');

const TIME_SLOTS = ['9:00 AM','10:00 AM','11:00 AM','12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM'];

exports.getBookings = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { user: req.user._id };
    const bookings = await Booking.find(filter)
      .populate('user', 'name email phone')
      .populate('service', 'name price duration category')
      .sort({ date: -1 });
    res.json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('service', 'name price duration category');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (req.user.role !== 'admin' && booking.user._id.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Not authorized' });
    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createBooking = async (req, res) => {
  try {
    const { serviceId, stylist, date, timeSlot, notes } = req.body;
    if (!serviceId || !stylist || !date || !timeSlot)
      return res.status(400).json({ success: false, message: 'All fields are required' });
    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });

    // Conflict check
    if (stylist !== 'Any Available') {
      const conflict = await Booking.findOne({
        stylist, date: new Date(date), timeSlot, status: { $ne: 'cancelled' },
      });
      if (conflict)
        return res.status(400).json({ success: false, message: 'This slot is already booked for that stylist' });
    }

    const booking = await Booking.create({
      user: req.user._id, service: serviceId, stylist,
      date: new Date(date), timeSlot, notes, price: service.price,
    });
    const populated = await booking.populate(['user', 'service']);
    res.status(201).json({ success: true, booking: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (req.user.role !== 'admin' && booking.user.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Not authorized' });

    const { stylist, date, timeSlot, notes, status } = req.body;
    if (stylist) booking.stylist = stylist;
    if (date) booking.date = new Date(date);
    if (timeSlot) booking.timeSlot = timeSlot;
    if (notes !== undefined) booking.notes = notes;
    if (status && req.user.role === 'admin') booking.status = status;
    await booking.save();
    const updated = await Booking.findById(booking._id).populate('user', 'name email').populate('service', 'name price');
    res.json({ success: true, booking: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (req.user.role !== 'admin' && booking.user.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Not authorized' });
    booking.status = 'cancelled';
    await booking.save();
    res.json({ success: true, message: 'Booking cancelled' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteBooking = async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Booking deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAvailableSlots = async (req, res) => {
  try {
    const { date, stylist } = req.query;
    const filter = { date: new Date(date), status: { $ne: 'cancelled' } };
    if (stylist && stylist !== 'Any Available') filter.stylist = stylist;
    const booked = await Booking.find(filter).select('timeSlot');
    const bookedSlots = booked.map((b) => b.timeSlot);
    const available = TIME_SLOTS.filter((s) => !bookedSlots.includes(s));
    res.json({ success: true, available, booked: bookedSlots });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getReports = async (req, res) => {
  try {
    const bookings = await Booking.find().populate('service', 'name category');
    const completed = bookings.filter((b) => b.status === 'completed');
    const totalRevenue = completed.reduce((s, b) => s + b.price, 0);
    const avgBookingValue = completed.length ? totalRevenue / completed.length : 0;

    // Revenue by service
    const revenueByService = {};
    completed.forEach((b) => {
      const name = b.service?.name || 'Unknown';
      revenueByService[name] = (revenueByService[name] || 0) + b.price;
    });

    // Bookings by day of week
    const byDay = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
    bookings.forEach((b) => {
      const day = new Date(b.date).toLocaleDateString('en-US', { weekday: 'short' });
      if (byDay[day] !== undefined) byDay[day]++;
    });

    // Stylist performance
    const stylistStats = {};
    ['Hemamali', 'Wageesha', 'Nishadi', 'Rasula'].forEach((s) => {
      const sCompleted = completed.filter((b) => b.stylist === s);
      stylistStats[s] = {
        bookings: bookings.filter((b) => b.stylist === s).length,
        completed: sCompleted.length,
        revenue: sCompleted.reduce((sum, b) => sum + b.price, 0),
      };
    });

    // Monthly revenue
    const monthlyRevenue = {};
    completed.forEach((b) => {
      const key = new Date(b.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      monthlyRevenue[key] = (monthlyRevenue[key] || 0) + b.price;
    });

    res.json({
      success: true,
      data: {
        totalRevenue, avgBookingValue,
        totalBookings: bookings.length,
        completionRate: bookings.length ? Math.round((completed.length / bookings.length) * 100) : 0,
        byStatus: {
          pending: bookings.filter((b) => b.status === 'pending').length,
          confirmed: bookings.filter((b) => b.status === 'confirmed').length,
          completed: completed.length,
          cancelled: bookings.filter((b) => b.status === 'cancelled').length,
        },
        revenueByService,
        byDay,
        stylistStats,
        monthlyRevenue,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
