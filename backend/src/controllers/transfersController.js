const Transfer = require("../models/Transfer");

exports.getAll = async (req, res) => {
  try {
    const transfers = await Transfer.find().sort("-date");
    res.json(transfers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const transfer = await Transfer.create({
      ...req.body,
      createdBy: req.user._id,
    });
    res.status(201).json(transfer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
