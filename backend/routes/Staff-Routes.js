const express = require("express");
const router = express.Router();
const staffController = require("../controllers/Staff-Controller");

// ✅ Register Staff
router.post("/add-staff", staffController.registerStaff);

// ✅ Get All Staff Members of a Resident
router.get("/resident/:residentId", staffController.getResidentStaff);

// ✅ Block Staff Member
router.put("/block/:staffId", staffController.blockStaff);

// ✅ Unblock Staff Member
router.put("/unblock/:staffId", staffController.unblockStaff);

// ✅ Delete Staff Member (Cancel Permanent ID)
router.delete("/delete/:staffId", staffController.deleteStaff);


// ✅ Staff Entry Check (Security Guard)
router.post("/entry", staffController.staffEntry);

// ✅ Staff Exit Check (Security Guard)
router.post("/exit", staffController.staffExit);

// ✅ Get Staff Entry-Exit History
router.get("/history/:permanentId", staffController.getStaffHistory);

module.exports = router;
