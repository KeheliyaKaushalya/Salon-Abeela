const Service = require('../models/Service');

exports.getServices = async (req, res) => {
  try {
    const filter = req.query.all === 'true' ? {} : { isActive: true };
    const services = await Service.find(filter).sort({ category: 1, name: 1 });
    res.json({ success: true, count: services.length, services });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    res.json({ success: true, service });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createService = async (req, res) => {
  try {
    const { name, price, duration, category, icon, description } = req.body;
    if (!name || !price || !duration || !category)
      return res.status(400).json({ success: false, message: 'Name, price, duration and category are required' });
    const service = await Service.create({ name, price, duration, category, icon, description });
    res.status(201).json({ success: true, service });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateService = async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    res.json({ success: true, service });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteService = async (req, res) => {
  try {
    await Service.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Service deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
