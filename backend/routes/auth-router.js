const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const validate = require("../middleware/validateMiddleware");
const { registerSchema, loginSchema } = require("../validators/auth-validate");
const authControllers = require("../controllers/Auth-Controller"); // Ensure correct filename

const router = express.Router();

// ✅ Auth routes
router.post("/register", validate(registerSchema), authControllers.register);
router.post("/login", validate(loginSchema), authControllers.login); // ✅ Fix: Use authControllers.login
router.put("/change-password", authMiddleware, authControllers.changePassword);

module.exports = router;
