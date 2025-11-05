const mongoose = require("mongoose");

const purchaseSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  base: String,
  equipment: String,
  quantity: Number,
  supplier: String,
  cost: Number,
  createdBy: String,
});

module.exports = mongoose.model("Purchase", purchaseSchema);
