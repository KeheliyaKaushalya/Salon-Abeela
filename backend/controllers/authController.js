const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

const genToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

const userPayload = (u) => ({
  id: u._id, name: u.name, email: u.email,
  role: u.role, phone: u.phone, gender: u.gender,
  notifications: u.notifications, createdAt: u.createdAt,
});

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ success: false, errors: errors.array() });
  try {
    const { name, email, password, phone, gender } = req.body;
    if (await User.findOne({ email }))
      return res.status(400).json({ success: false, message: 'Email already registered' });
    const user = await User.create({ name, email, password, phone, gender });
    res.status(201).json({ success: true, token: genToken(user._id), user: userPayload(user) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ success: false, errors: errors.array() });
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    if (!user.isActive)
      return res.status(401).json({ success: false, message: 'Account deactivated' });
    res.json({ success: true, token: genToken(user._id), user: userPayload(user) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMe = async (req, res) => {
  res.json({ success: true, user: userPayload(req.user) });
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, gender, notifications } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, gender, notifications },
      { new: true, runValidators: true }
    );
    res.json({ success: true, user: userPayload(user) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(currentPassword)))
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    if (newPassword.length < 6)
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
