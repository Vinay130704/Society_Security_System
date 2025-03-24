const express = require("express");
const router = express.Router();
const {
  createDeliveryRequest,
  scanQrCode,
  editDeliveryDetails,
  deleteDeliveryRequest,
  getAllDeliveryRequests,
} = require("../controllers/DeliveryController"); 

const { authMiddleware } = require("../middleware/authMiddleware");

// Routes
router.post("/create", authMiddleware, createDeliveryRequest);
router.post("/scan", authMiddleware, scanQrCode);
router.put("/edit/:deliveryId", authMiddleware, editDeliveryDetails);
router.delete("/delete/:deliveryId", authMiddleware, deleteDeliveryRequest);
router.get("/all", authMiddleware, getAllDeliveryRequests);

module.exports = router;
