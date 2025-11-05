const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const rbac = require("../middleware/rbacMiddleware");
const audit = require("../middleware/auditMiddleware");
const EquipmentType = require("../models/EquipmentType");

// List all (admin, logistics, commander can read)
router.get(
  "/",
  auth,
  rbac(["admin", "logistics", "commander"]),
  async (req, res) => {
    const list = await EquipmentType.find({ active: true }).sort("name");
    res.json(list);
  }
);

// Create (admin only)
router.post(
  "/",
  auth,
  rbac(["admin"]),
  audit("CREATE_EQUIPMENT_TYPE"),
  async (req, res) => {
    try {
      const eq = await EquipmentType.create(req.body);
      res.status(201).json(eq);
    } catch (err) {
      res.status(500).json({ error: "Failed to create equipment type" });
    }
  }
);

// Soft-toggle active (admin)
router.patch(
  "/:id/toggle",
  auth,
  rbac(["admin"]),
  audit("TOGGLE_EQUIPMENT_TYPE"),
  async (req, res) => {
    try {
      const eq = await EquipmentType.findById(req.params.id);
      if (!eq) return res.status(404).json({ error: "Not found" });
      eq.active = !eq.active;
      await eq.save();
      res.json(eq);
    } catch (err) {
      res.status(500).json({ error: "Failed to toggle equipment type" });
    }
  }
);

module.exports = router;
