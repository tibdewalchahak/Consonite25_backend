const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  isVNIT: { type: Boolean, required: true },
  ticketCode: { type: String, default: null },
  paymentStatus: { type: String, default: 'pending' }, // "pending" or "success"
});

module.exports = mongoose.model('User', userSchema);
