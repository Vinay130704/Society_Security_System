const express = require("express");
const multer = require("multer");
const { inviteVisitor, scanQRCode, captureVisitor, exitVisitor, approveVisitor } = require("../controllers/visitorController");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/invite", inviteVisitor);
router.post("/scan", scanQRCode);
router.post("/exit/:id", exitVisitor);
router.post("/capture", upload.single("image"), captureVisitor);
router.post("/approve/:id", approveVisitor);

module.exports = router;
