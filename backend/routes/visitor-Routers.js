const express = require("express");
const multer = require("multer");
const {inviteVisitor, scanQRCode, exitVisitor, captureVisitor, approveVisitor, denyVisitor} = require("../controllers/Visitor-Controller");
const router = express.Router();

// File Upload Configuration for Visitor Images
const storage = multer.diskStorage({
  destination: "./uploads/visitor_images/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

router.post("/invite", inviteVisitor);
router.post("/scan", scanQRCode);
router.post("/exit/:id", exitVisitor);
router.post("/capture", upload.single("image"), captureVisitor);
router.get("/approve/:id", approveVisitor); 
router.get("/deny/:id", denyVisitor);

module.exports = router;
