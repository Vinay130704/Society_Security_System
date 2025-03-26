const express = require("express");
const http = require("http");
const dotenv = require("dotenv");
const cors = require("cors");
const cron = require("node-cron");

dotenv.config();
const connectDB = require("./config/db");
const deleteUnapprovedUsers = require("./utils/deleteUnapprovedUsers");
const errorHandler = require("./middleware/errorHandler");
const { initializeSocket } = require("./socket"); // Import socket initializer

// Routes
const staffRoutes = require("./routes/Staff-Routes");
const authRoutes = require("./routes/Auth-Routes");
const visitorRoutes = require("./routes/Visitor-Routers");
const adminRoutes = require("./routes/Admin-Routes");
const vehicleRoutes = require("./routes/Vehicle-Routes");
const deliveryRoutes = require("./routes/Delivery-Routes");
const emergencyRoutes = require("./routes/EmergencyRoutes");
const workerRoutes = require("./routes/workerRoutes");

const app = express();
const server = http.createServer(app);

// Initialize WebSocket
const io = initializeSocket(server);

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173", 
    methods: ["GET", "POST", "PUT", "DELETE"], 
    allowedHeaders: ["Content-Type", "Authorization"], 
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

// Connect to Database
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/visitor", visitorRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/delivery", deliveryRoutes);
app.use("/api/emergency", emergencyRoutes);
app.use("/api/worker", workerRoutes);

// Error Handling Middleware
app.use(errorHandler);

// Schedule a Cron Job to delete unapproved users every hour
cron.schedule("0 * * * *", async () => {
  await deleteUnapprovedUsers();
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
