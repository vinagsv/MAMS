const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  base: { type: String, required: true },
  personnel: { type: String, required: true },
  equipment: { type: String, required: true },
  quantity: { type: Number, required: true },
  type: { type: String, enum: ["assigned", "expended"], required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

module.exports = mongoose.model("Assignment", assignmentSchema);
