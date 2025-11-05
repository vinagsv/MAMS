const mongoose = require("mongoose");

const transferSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  from: { type: String, required: true },
  to: { type: String, required: true },
  equipment: { type: String, required: true },
  quantity: { type: Number, required: true },
  status: {
    type: String,
    enum: ["In Transit", "Completed"],
    default: "In Transit",
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

module.exports = mongoose.model("Transfer", transferSchema);
