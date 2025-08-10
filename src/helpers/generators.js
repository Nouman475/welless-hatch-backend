const Transaction = require("../models/Transaction");

exports.generateUniqueCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate random 6-digit OTP
exports.generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
