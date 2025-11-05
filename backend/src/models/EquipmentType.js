const mongoose = require("mongoose");

const equipmentTypeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  category: { type: String }, // optional: Weapons, Vehicles, Ammo, etc.
  active: { type: Boolean, default: true },
});

module.exports = mongoose.model("EquipmentType", equipmentTypeSchema);
