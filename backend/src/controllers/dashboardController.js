const Purchase = require("../models/Purchase");
const Transfer = require("../models/Transfer");
const Assignment = require("../models/Assignment");

exports.getMetrics = async (req, res) => {
  try {
    const { base, equipment, dateFrom, dateTo } = req.query;
    const filter = {};

    // Apply filters if provided
    if (base) filter.base = base;
    if (equipment) filter.equipment = equipment;

    // Date filter
    const dateFilter = {};
    if (dateFrom) dateFilter.$gte = new Date(dateFrom);
    if (dateTo) dateFilter.$lte = new Date(dateTo);
    if (Object.keys(dateFilter).length) filter.date = dateFilter;

    // Fetch relevant data
    const purchases = await Purchase.find(filter);
    const transfers = await Transfer.find(filter);
    const assignments = await Assignment.find(filter);

    // Compute aggregates
    const totalPurchased = purchases.reduce((sum, p) => sum + p.quantity, 0);
    const transferIn = transfers.reduce(
      (sum, t) => (t.to === base ? sum + t.quantity : sum),
      0
    );
    const transferOut = transfers.reduce(
      (sum, t) => (t.from === base ? sum + t.quantity : sum),
      0
    );

    const totalAssigned = assignments
      .filter((a) => a.type === "assigned")
      .reduce((sum, a) => sum + a.quantity, 0);
    const totalExpended = assignments
      .filter((a) => a.type === "expended")
      .reduce((sum, a) => sum + a.quantity, 0);

    const netMovement = totalPurchased + transferIn - transferOut;

    // For now, Opening Balance = Closing Balance - Net Movement
    const closingBalance =
      totalPurchased + transferIn - transferOut - totalExpended;
    const openingBalance = closingBalance - netMovement;

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
    res.status(500).json({ error: err.message });
  }
};
