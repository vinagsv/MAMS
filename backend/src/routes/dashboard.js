const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const rbac = require("../middleware/rbacMiddleware");
const Purchase = require("../models/Purchase");
const Transfer = require("../models/Transfer");
const Assignment = require("../models/Assignment");

const toDateRange = (dateFrom, dateTo) => {
  const range = {};
  if (dateFrom) range.$gte = new Date(dateFrom);
  if (dateTo) range.$lte = new Date(dateTo);
  return range;
};

const safeRegex = (value) => {
  if (!value) return undefined;
  return new RegExp(String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
};

const buildFilter = (req, inRange = true, extra = {}) => {
  const { base: qBase, equipment, dateFrom, dateTo } = req.query || {};
  let base = qBase;

  // Commander restriction
  if (req.user.role === "commander" && req.user.assignedBase?.name) {
    base = req.user.assignedBase.name;
  }

  const f = { ...extra }; // purchases/assignments
  const fIn = {};
  const fOut = {};

  // Base filter
  if (base) f.base = base;

  const eq = safeRegex(equipment);
  if (eq) {
    f.equipment = eq;
    fIn.equipment = eq;
    fOut.equipment = eq;
  }

  // Date handling
  if (inRange) {
    const range = toDateRange(dateFrom, dateTo);
    if (Object.keys(range).length) {
      f.date = range;
      fIn.date = range;
      fOut.date = range;
    }
  } else if (dateFrom) {
    // strictly "before dateFrom" for opening balance
    const before = { $lt: new Date(dateFrom) };
    f.date = before;
    fIn.date = before;
    fOut.date = before;
  }

  // Transfers need from/to
  if (base) {
    fIn.to = base;
    fOut.from = base;
  } else {
  }

  return {
    f,
    fIn,
    fOut,
    base,
    equipment: qBase ? equipment : req.query?.equipment,
  };
};

//  GET /api/dashboard/metrics
//  stock movement & balance

router.get(
  "/metrics",
  auth,
  rbac(["admin", "logistics", "commander"]),
  async (req, res) => {
    try {
      // Opening balance (everything before dateFrom)
      let openingBalance = 0;
      if (req.query.dateFrom) {
        const {
          f: pOpen,
          fIn: tInOpen,
          fOut: tOutOpen,
        } = buildFilter(req, false);

        const [openPurch, openTIn, openTOut, openAssigned, openExpended] =
          await Promise.all([
            Purchase.aggregate([
              { $match: pOpen },
              { $group: { _id: null, qty: { $sum: "$quantity" } } },
            ]),
            Transfer.aggregate([
              { $match: tInOpen },
              { $group: { _id: null, qty: { $sum: "$quantity" } } },
            ]),
            Transfer.aggregate([
              { $match: tOutOpen },
              { $group: { _id: null, qty: { $sum: "$quantity" } } },
            ]),
            Assignment.aggregate([
              { $match: { ...pOpen, type: "assigned" } },
              { $group: { _id: null, qty: { $sum: "$quantity" } } },
            ]),
            Assignment.aggregate([
              { $match: { ...pOpen, type: "expended" } },
              { $group: { _id: null, qty: { $sum: "$quantity" } } },
            ]),
          ]);

        const sum = (arr) => (arr && arr[0] ? arr[0].qty : 0);
        openingBalance =
          sum(openPurch) +
          sum(openTIn) -
          sum(openTOut) -
          sum(openAssigned) -
          sum(openExpended);
        if (openingBalance < 0) openingBalance = 0;
      }

      // In-range movement
      const { f: pIn, fIn: tIn, fOut: tOut } = buildFilter(req, true);

      const [inPurch, inTIn, inTOut, inAssigned, inExpended] =
        await Promise.all([
          Purchase.aggregate([
            { $match: pIn },
            { $group: { _id: null, qty: { $sum: "$quantity" } } },
          ]),
          Transfer.aggregate([
            { $match: tIn },
            { $group: { _id: null, qty: { $sum: "$quantity" } } },
          ]),
          Transfer.aggregate([
            { $match: tOut },
            { $group: { _id: null, qty: { $sum: "$quantity" } } },
          ]),
          Assignment.aggregate([
            { $match: { ...pIn, type: "assigned" } },
            { $group: { _id: null, qty: { $sum: "$quantity" } } },
          ]),
          Assignment.aggregate([
            { $match: { ...pIn, type: "expended" } },
            { $group: { _id: null, qty: { $sum: "$quantity" } } },
          ]),
        ]);

      const sum = (arr) => (arr && arr[0] ? arr[0].qty : 0);
      const totalPurchased = sum(inPurch);
      const transferIn = sum(inTIn);
      const transferOut = sum(inTOut);
      const totalAssigned = sum(inAssigned);
      const totalExpended = sum(inExpended);
      const netMovement = totalPurchased + transferIn - transferOut;
      const closingBalance = Math.max(
        0,
        openingBalance + netMovement - totalAssigned - totalExpended
      );

      res.json({
        openingBalance,
        closingBalance,
        netMovement,
        totalPurchased,
        transferIn,
        transferOut,
        totalAssigned,
        totalExpended,
      });
    } catch (err) {
      console.error("Dashboard metrics error:", err);
      res.status(500).json({ error: "Failed to compute dashboard metrics" });
    }
  }
);

router.get(
  "/details",
  auth,
  rbac(["admin", "logistics", "commander"]),
  async (req, res) => {
    try {
      const { f: pIn, fIn: tIn, fOut: tOut } = buildFilter(req, true);

      const [purchases, transfersIn, transfersOut, assigned, expended] =
        await Promise.all([
          Purchase.find(pIn).sort({ date: -1 }),
          Transfer.find(tIn).sort({ date: -1 }),
          Transfer.find(tOut).sort({ date: -1 }),
          Assignment.find({ ...pIn, type: "assigned" }).sort({ date: -1 }),
          Assignment.find({ ...pIn, type: "expended" }).sort({ date: -1 }),
        ]);

      // Section totals
      const sumQty = (rows) =>
        rows.reduce((s, r) => s + (Number(r.quantity) || 0), 0);

      res.json({
        purchases,
        transfersIn,
        transfersOut,
        assigned,
        expended,
        totals: {
          purchases: sumQty(purchases),
          transfersIn: sumQty(transfersIn),
          transfersOut: sumQty(transfersOut),
          assigned: sumQty(assigned),
          expended: sumQty(expended),
        },
      });
    } catch (err) {
      console.error("Dashboard details error:", err);
      res.status(500).json({ error: "Failed to fetch dashboard details" });
    }
  }
);

module.exports = router;
