const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const rbac = require("../middleware/rbacMiddleware");
const AuditLog = require("../models/AuditLog");

// Get all logs (admin only)
router.get("/", auth, rbac(["admin"]), async (req, res) => {
  try {
    const { user, action, dateFrom, dateTo } = req.query;

    const filter = {};
    if (user) filter.user = new RegExp(user, "i");
    if (action) filter.action = new RegExp(action, "i");

    if (dateFrom || dateTo) {
      filter.timestamp = {};
      if (dateFrom) filter.timestamp.$gte = new Date(dateFrom);
      if (dateTo) filter.timestamp.$lte = new Date(dateTo);
    }

    const logs = await AuditLog.find(filter)
      .sort({ timestamp: -1 })
      .limit(1000);

    res.json(logs);
  } catch (err) {
    console.error("Fetch logs error:", err);
    res.status(500).json({ error: "Failed to fetch audit logs" });
  }
});

module.exports = router;
