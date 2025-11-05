// backend/src/middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).populate("assignedBase");
    if (!user) return res.status(404).json({ error: "User not found" });

    req.user = {
      id: user._id.toString(),
      role: user.role,
      email: user.email,
      assignedBase: user.assignedBase,
      name: user.name,
    };
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};
