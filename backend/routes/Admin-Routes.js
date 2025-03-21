const express = require("express");
const { 
  approveUser, 
  getAllUsers, 
  updateUserProfile,  // ✅ Fixed function name
  rejectUser, 
  removeResident 
} = require("../controllers/Admin-Controller");

const authMiddleware = require("../middleware/authMiddleware"); 

const router = express.Router();

router.put("/approve/:userId", approveUser);
router.put("/reject/:userId", rejectUser);
router.get("/users", authMiddleware, getAllUsers);
router.put("/update/:id", authMiddleware, updateUserProfile); // ✅ Fixed function name
router.delete("/remove/:id", removeResident);

module.exports = router;
