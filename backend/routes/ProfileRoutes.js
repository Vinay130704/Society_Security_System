const express = require("express");
const router = express.Router();
const {authMiddleware} = require("../middleware/authMiddleware");
const { getProfile, updateProfile, updateProfilePicture, updateFamilyMember, removeFamilyMember, recordEntryExit, getResidentLogs } = require("../controllers/profileController");

// Profile routes
router.get("/", authMiddleware, getProfile);
router.put("/", authMiddleware, updateProfile);
router.post("/picture", authMiddleware, updateProfilePicture);

// Family member routes
router.post("/family", authMiddleware, updateFamilyMember);
router.delete("/family/:memberId", authMiddleware, removeFamilyMember);

// Entry/Exit log routes
router.post("/logs", authMiddleware, recordEntryExit);
router.get("/logs/:permanentId", authMiddleware, getResidentLogs);

module.exports = router;