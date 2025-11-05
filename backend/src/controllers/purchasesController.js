const Purchase = require("../models/Purchase");

// Helper – builds the base-filter that RBAC enforces
const buildBaseFilter = (user) => {
  //  Admin  sees everything
  if (user.role === "admin") return {};

  // commander / logistics see only their own base
  if (
    ["commander", "logistics"].includes(user.role) &&
    user.assignedBase?.name
  ) {
    return { "base.name": user.assignedBase.name };
  }

  //Fallback – deny everything
  return { _id: null };
};

// GET/purchases -> list with auto filter

exports.getAll = async (req, res) => {
  try {
    const filter = buildBaseFilter(req.user);
    const purchases = await Purchase.find(filter).sort("-date");
    res.json(purchases);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /purchases -> create (still auto-populate base for non-admins)

exports.create = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      createdBy: req.user.name,
    };

    // auto-assign base for non-admin users
    if (req.user.role !== "admin" && req.user.assignedBase?.name) {
      payload.base = {
        name: req.user.assignedBase.name,
      };
    }

    const purchase = await Purchase.create(payload);
    res.status(201).json(purchase);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};
