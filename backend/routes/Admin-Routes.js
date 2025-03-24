const express = require("express");
const { approveUser, rejectUser, getUsers, updateUserProfile, removeResident } = require("../controllers/admin-controller");
const router = express.Router();


router.put("/approve/:userId", approveUser);
router.put("/reject/:userId", rejectUser);
router.get("/users", getUsers);  
router.put("/update/:id", updateUserProfile);
router.delete("/remove/:id", removeResident);

module.exports = router;
