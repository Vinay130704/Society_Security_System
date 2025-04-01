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

// Routes with access comments
router.post("/create", authMiddleware, createDeliveryRequest); // Restricted to residents only
router.post("/scan", authMiddleware, scanQrCode); // Restricted to security guards only
router.put("/edit/:deliveryId", authMiddleware, editDeliveryDetails); // Restricted to residents only
router.delete("/delete/:deliveryId", authMiddleware, deleteDeliveryRequest); // Restricted to residents only
router.get("/all", authMiddleware, getAllDeliveryRequests); // Accessible to authenticated users (role-based logic handled in controller)

module.exports = router;