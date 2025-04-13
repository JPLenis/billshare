const mongoose = require("mongoose");

const billSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  totalAmount: Number,
  splitBetween: Number,
  description: String,
  paid: { type: Boolean, default: false },
  dueDate: String,
  names: [String],
  paidStatus: [Boolean],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Bill", billSchema);
