const express = require("express");
const http = require("http");
const dotenv = require("dotenv");
const cors = require("cors");
const cron = require("node-cron");

// Load environment variables
dotenv.config();

// Database connection
const connectDB = require("./config/db");

// Utility functions
const deleteUnapprovedUsers = require("./utils/deleteUnapprovedUsers");

// Middleware
const errorHandler = require("./middleware/errorHandler");

// Socket.io setup
const { initializeSocket } = require("./socket");

// Route imports
const staffRoutes = require("./routes/Staff-Routes");
const authRoutes = require("./routes/Auth-Routes");
const visitorRoutes = require("./routes/Visitor-Routers");
const adminRoutes = require("./routes/Admin-Routes");
const vehicleRoutes = require("./routes/Vehicle-Routes");
const deliveryRoutes = require("./routes/Delivery-Routes");
const emergencyRoutes = require("./routes/EmergencyRoutes");
const workerRoutes = require("./routes/workerRoutes");
const eventRoutes = require("./routes/EventRoutes");
const profileRoutes = require("./routes/profileRoutes");

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize WebSocket
initializeSocket(server);

// Middleware setup
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

// Connect to MongoDB
connectDB();

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/visitor", visitorRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/vehicle", vehicleRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/delivery", deliveryRoutes);
app.use("/api/emergency", emergencyRoutes);
app.use("/api/worker", workerRoutes);
app.use("/api/event", eventRoutes);
app.use("/api/profile", profileRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

// Scheduled tasks
cron.schedule("0 * * * *", async () => {
  await deleteUnapprovedUsers();
});

// Server startup
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  server.close(() => process.exit(1));
});