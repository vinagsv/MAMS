const express = require("express");
const router = express.Router();
const Transfer = require("../models/Transfer");
const EquipmentType = require("../models/EquipmentType");
const auth = require("../middleware/authMiddleware");
const rbac = require("../middleware/rbacMiddleware");
const audit = require("../middleware/auditMiddleware");

// Create transfer (Admin + Logistics)
router.post(
  "/",
  auth,
  rbac(["admin", "logistics"]),
  audit("CREATE_TRANSFER"),
  async (req, res) => {
    try {
      const { equipment } = req.body;

      // Validate equipment exists and is active
      const eq = await EquipmentType.findOne({ name: equipment, active: true });
      if (!eq) {
        return res.status(400).json({
          error: `Invalid equipment: "${equipment}". Please add it or activate it first.`,
        });
      }

      const transfer = await Transfer.create(req.body);
      res.status(201).json(transfer);
    } catch (err) {
      console.error("Create transfer error:", err);
      res.status(500).json({ error: "Failed to create transfer" });
    }
  }
);

// Fetch transfers with filters
router.get("/", auth, async (req, res) => {
  try {
    const { base, equipment, dateFrom, dateTo } = req.query;
    const query = {};

    if (equipment) query.equipment = equipment;

    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) query.date.$gte = new Date(dateFrom);
      if (dateTo) query.date.$lte = new Date(dateTo);
    }

    if (req.user.role === "commander" && req.user.assignedBase?.name) {
      const b = req.user.assignedBase.name;
      query.$or = [{ from: b }, { to: b }];
    } else if (base) {
      query.$or = [{ from: base }, { to: base }];
    }

    const transfers = await Transfer.find(query).sort({ date: -1 });
    res.json(transfers);
  } catch (err) {
    console.error("Fetch transfers error:", err);
    res.status(500).json({ error: "Failed to fetch transfers" });
  }
});

module.exports = router;
