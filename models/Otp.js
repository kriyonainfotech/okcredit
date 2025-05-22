const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  email: String,
  otp: String,
  otpVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now, expires: 600 }, // 10 min TTL
});

module.exports = mongoose.model("Otp", otpSchema);
