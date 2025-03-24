const express = require("express");
const router = express.Router();
const workerController = require("../controllers/workerController");

router.post("/add-worker", workerController.registerWorker);
router.get("/workers", workerController.getAllWorkers);
router.get("/worker/:permanentId", workerController.getWorkerById);
router.patch("/block/:permanentId", workerController.blockWorker);
router.patch("/unblock/:permanentId", workerController.unblockWorker);
router.patch("/cancel/:permanentId", workerController.cancelWorker);

// ✅ Security Guard Routes
router.post("/entry/:permanentId", workerController.allowEntry);
router.post("/exit/:permanentId", workerController.allowExit);
router.get("/logs/:permanentId", workerController.getWorkerLogs);

module.exports = router;
