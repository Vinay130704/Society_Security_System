const express = require("express");
const router = express.Router();
const {
  registerStaff,
  getResidentStaff,
  blockStaff,
  unblockStaff,
  deleteStaff,
} = require("../controllers/staffController");

// Register a staff member
router.post("/register", registerStaff);

// Get all staff for a resident
router.get("/:residentId", getResidentStaff);

// Block staff
router.put("/block/:staffId", blockStaff);

// Unblock staff
router.put("/unblock/:staffId", unblockStaff);

// Delete staff
router.delete("/delete/:staffId", deleteStaff);

module.exports = router;
