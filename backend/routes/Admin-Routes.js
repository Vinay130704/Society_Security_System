const express = require("express");
const adminController = require("../controllers/Admin-Controller");
const { authMiddleware } = require("../middleware/authMiddleware"); // Corrected import

const router = express.Router();

router.put("/approve/:userId", authMiddleware, adminController.approveUser); 
router.put("/reject/:userId", authMiddleware, adminController.rejectUser);
router.get("/users", authMiddleware, adminController.getUsers);
router.put("/update/:id", authMiddleware, adminController.updateUser);
router.delete("/remove/:id", authMiddleware, adminController.removeResident);

module.exports = router;
