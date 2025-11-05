const express = require("express");
const router = express.Router();
const Base = require("../models/Base");
const auth = require("../middleware/authMiddleware");
const rbac = require("../middleware/rbacMiddleware");
const audit = require("../middleware/auditMiddleware");

// Get all bases (admins & logistics officers only)
router.get("/", auth, rbac(["admin", "logistics"]), async (req, res) => {
  try {
    const bases = await Base.find().sort("name");
    res.json(bases);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new base (admin only)
router.post(
  "/",
  auth,
  rbac(["admin"]),
  audit("CREATE_BASE"),
  async (req, res) => {
    try {
      const { name, location } = req.body;
      const base = await Base.create({ name, location });
      res.status(201).json(base);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

module.exports = router;
