const express = require("express");
const router = express.Router();
const Assignment = require("../models/Assignment");
const EquipmentType = require("../models/EquipmentType");
const auth = require("../middleware/authMiddleware");
const rbac = require("../middleware/rbacMiddleware");
const audit = require("../middleware/auditMiddleware");

router.post(
  "/",
  auth,
  rbac(["admin", "logistics", "commander"]),
  audit("CREATE_ASSIGNMENT"),
  async (req, res) => {
    try {
      const { equipment } = req.body;

      const eq = await EquipmentType.findOne({ name: equipment, active: true });
      if (!eq) {
        return res.status(400).json({
          error: `Invalid equipment: "${equipment}". Please add it or activate it first.`,
        });
      }

      const assignment = await Assignment.create(req.body);
      res.status(201).json(assignment);
    } catch (err) {
      console.error("Create assignment error:", err);
      res.status(500).json({ error: "Failed to create assignment" });
    }
  }
);

// Fetch assignments with filters
router.get("/", auth, async (req, res) => {
  try {
    const { base, equipment, type, dateFrom, dateTo } = req.query;
    const query = {};

    if (req.user.role === "commander" && req.user.assignedBase?.name) {
      query.base = req.user.assignedBase.name;
    } else if (base) {
      query.base = base;
    }

    if (equipment) query.equipment = equipment;
    if (type) query.type = type;

    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) query.date.$gte = new Date(dateFrom);
      if (dateTo) query.date.$lte = new Date(dateTo);
    }

    const assignments = await Assignment.find(query).sort({ date: -1 });
    res.json(assignments);
  } catch (err) {
    console.error("Fetch assignments error:", err);
    res.status(500).json({ error: "Failed to fetch assignments" });
  }
});

module.exports = router;
