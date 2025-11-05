const express = require("express");
const router = express.Router();
const Purchase = require("../models/Purchase");
const EquipmentType = require("../models/EquipmentType");
const auth = require("../middleware/authMiddleware");
const rbac = require("../middleware/rbacMiddleware");
const audit = require("../middleware/auditMiddleware");

// Create purchase (Admin + Logistics)
router.post(
  "/",
  auth,
  rbac(["admin", "logistics"]),
  audit("CREATE_PURCHASE"),
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

      const purchase = await Purchase.create(req.body);
      res.status(201).json(purchase);
    } catch (err) {
      console.error("Create purchase error:", err);
      res.status(500).json({ error: "Failed to create purchase" });
    }
  }
);

// Fetch purchases with filters
router.get("/", auth, async (req, res) => {
  try {
    const { base, equipment, dateFrom, dateTo } = req.query;
    const query = {};

    if (req.user.role === "commander" && req.user.assignedBase?.name) {
      query.base = req.user.assignedBase.name;
    } else if (base) {
      query.base = base;
    }

    if (equipment) query.equipment = equipment;

    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) query.date.$gte = new Date(dateFrom);
      if (dateTo) query.date.$lte = new Date(dateTo);
    }

    const purchases = await Purchase.find(query).sort({ date: -1 });
    res.json(purchases);
  } catch (err) {
    console.error("Fetch purchases error:", err);
    res.status(500).json({ error: "Failed to fetch purchases" });
  }
});

module.exports = router;
