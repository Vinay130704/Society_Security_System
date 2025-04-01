const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware");
const staffController = require("../controllers/Staff-Controller");

// Resident-only routes
router.post("/add-staff", authMiddleware,  staffController.registerStaff);
router.get("/resident/:residentId", authMiddleware,  staffController.getResidentStaff);

// Admin-only routes
router.put("/block/:staffId", authMiddleware,  staffController.blockStaff);
router.put("/unblock/:staffId", authMiddleware,  staffController.unblockStaff);
router.delete("/delete/:staffId", authMiddleware,  staffController.deleteStaff);

// Security-only routes
router.post("/entry", authMiddleware,  staffController.staffEntry);
router.post("/exit", authMiddleware,  staffController.staffExit);

// Shared routes (accessible by multiple roles)
router.get("/history/:permanentId", authMiddleware, staffController.getStaffHistory);

module.exports = router;