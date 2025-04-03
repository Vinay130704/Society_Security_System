const express = require('express');
const router = express.Router();
const authController = require('../controllers/Auth-Controller');
// const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-otp', authController.verifyOTP);
router.post('/reset-password', authController.resetPassword);
router.post('/change-password',  authController.changePassword);

module.exports = router;