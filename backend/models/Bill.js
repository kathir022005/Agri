const mongoose = require("mongoose");

const lineItemSchema = new mongoose.Schema({
  itemCode: { type: String, required: true },
  itemLabel: { type: String, required: true },
  capacity: { type: Number, required: true },
  amount: { type: Number, required: true },
  total: { type: Number, required: true }, // capacity * amount
});

const billSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  items: { type: [lineItemSchema], required: true },
  grandTotal: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Bill", billSchema);
