const express = require("express");
const router = express.Router();
const {authMiddleware} = require("../middleware/authMiddleware");
const { getProfile, updateProfile, updateProfilePicture, updateFamilyMember, removeFamilyMember, recordEntryExit, getResidentLogs, addFamilyMember } = require("../controllers/profileController");

// Profile routes
router.get("/get-profile", authMiddleware, getProfile);
router.put("/update-profile", authMiddleware, updateProfile);
router.post("/picture", authMiddleware, updateProfilePicture);

// Family member routes
router.post('/add-familymember', authMiddleware, addFamilyMember);
router.post("/edit-family", authMiddleware, updateFamilyMember);
router.delete("/family/:memberId", authMiddleware, removeFamilyMember);

// Entry/Exit log routes
router.post("/entry-exit", authMiddleware, recordEntryExit);
router.get("/logs/:permanentId", authMiddleware, getResidentLogs);

module.exports = router;