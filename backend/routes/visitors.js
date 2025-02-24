const express = require("express");
const router = express.Router();
const visitorController = require("../controllers/visitorController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/add", authMiddleware, visitorController.addVisitor);
router.get("/list", authMiddleware, visitorController.getVisitors);

module.exports = router;
