const express = require("express");
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

const userRouter = express.Router();

userRouter.get("/profile", authMiddleware, userController.getUserProfile);
userRouter.put("/update", authMiddleware, userController.updateUserProfile);

module.exports = userRouter;
