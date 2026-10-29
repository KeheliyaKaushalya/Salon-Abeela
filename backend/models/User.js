const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name:     { type: String, required: [true, 'Name is required'], trim: true },
    email:    { type: String, required: [true, 'Email is required'], unique: true, lowercase: true },
    password: { type: String, required: [true, 'Password is required'], minlength: 6, select: false },
    phone:    { type: String, default: '' },
    gender:   { type: String, enum: ['Female', 'Male', 'Other', ''], default: '' },
    role:     { type: String, enum: ['user', 'admin'], default: 'user' },
    isActive: { type: Boolean, default: true },
    notifications: {
      emailBooking: { type: Boolean, default: true },
      smsReminder:  { type: Boolean, default: true },
      promotions:   { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);
