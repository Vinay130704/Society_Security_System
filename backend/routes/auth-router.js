const express = require("express");
const validate = require("../middleware/validateMiddleware"); // Middleware for validation
const { registerSchema, loginSchema } = require("../validators/auth-validate"); // Import only needed schemas
const authControllers = require("../controllers/Auth-Controller"); // Ensure correct filename

const router = express.Router();

// Use the correct validation schema
router.post("/register", validate(registerSchema), authControllers.register);
router.post("/login", validate(loginSchema), authControllers.login);
router.post("/request-otp", authControllers.requestOTP);
router.post("/change-password", authControllers.changePassword);

module.exports = router;
