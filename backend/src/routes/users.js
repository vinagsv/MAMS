const express = require("express");
const router = express.Router();
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");
const rbac = require("../middleware/rbacMiddleware");
const audit = require("../middleware/auditMiddleware");

// Get all users (Admin only)
router.get("/", auth, rbac(["admin"]), async (req, res) => {
  try {
    const users = await User.find().select("-password").sort("name");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Create user (Admin only)
router.post(
  "/",
  auth,
  rbac(["admin"]),
  audit("CREATE_USER"),
  async (req, res) => {
    try {
      const { name, email, password, role } = req.body;

      if (!name || !email || !password || !role)
        return res.status(400).json({ error: "All fields required" });

      const existing = await User.findOne({ email });
      if (existing)
        return res
          .status(400)
          .json({ error: "User with this email already exists" });

      const user = await User.create({ name, email, password, role });
      res.status(201).json(user);
    } catch (err) {
      console.error("Create user error:", err);
      res.status(500).json({ error: "Failed to create user" });
    }
  }
);

// Update user role (Admin only)
router.patch(
  "/:id",
  auth,
  rbac(["admin"]),
  audit("UPDATE_USER_ROLE"),
  async (req, res) => {
    try {
      const { role } = req.body;
      if (!role) return res.status(400).json({ error: "Role required" });

      const user = await User.findByIdAndUpdate(
        req.params.id,
        { role },
        { new: true }
      );
      if (!user) return res.status(404).json({ error: "User not found" });

      res.json(user);
    } catch (err) {
      res.status(500).json({ error: "Failed to update user" });
    }
  }
);

// Delete user (Admin only)
router.delete(
  "/:id",
  auth,
  rbac(["admin"]),
  audit("DELETE_USER"),
  async (req, res) => {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) return res.status(404).json({ error: "User not found" });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to delete user" });
    }
  }
);

module.exports = router;
