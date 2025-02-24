// Placeholder content for controllers/visitorController.js
const Visitor = require("../models/Visitor");

exports.addVisitor = async (req, res) => {
  try {
    const { name, phone, purpose } = req.body;
    const newVisitor = new Visitor({ name, phone, purpose, approvedBy: req.user.id });
    await newVisitor.save();
    res.json({ message: "Visitor added successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getVisitors = async (req, res) => {
  try {
    const visitors = await Visitor.find().populate("approvedBy", "name email");
    res.json(visitors);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
