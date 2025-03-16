const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const authController = require("../controllers/Auth-Controller");
const validate = require("../middleware/validateMiddleware"); // ✅ Import validation middleware
const { registerSchema, loginSchema } = require("../validators/auth-validate");

const router = express.Router();

// ✅ Auth routes
router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.put("/change-password", authMiddleware, authController.changePassword);

module.exports = router;
