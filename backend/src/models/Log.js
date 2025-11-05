const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  user: { type: String, required: true },
  role: { type: String, required: true },
  action: { type: String, required: true },
  details: { type: Object },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Log", logSchema);
