const Assignment = require("../models/Assignment");

exports.getAll = async (req, res) => {
  try {
    const assignments = await Assignment.find().sort("-date");
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const assignment = await Assignment.create({
      ...req.body,
      createdBy: req.user._id,
    });
    res.status(201).json(assignment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
