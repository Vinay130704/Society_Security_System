const express = require("express");
const http = require("http");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const cron = require("node-cron");

dotenv.config();
const connectDB = require("./config/db");
const deleteUnapprovedUsers = require("./utils/deleteUnapprovedUsers");
const errorHandler = require("./middleware/errorHandler");

// Routes
const staffRoutes = require("./routes/staffRoutes");
const authRoutes = require("./routes/Auth-Router");
const visitorRoutes = require("./routes/Visitor-Routers");
const incidentRoutes = require("./routes/incidents");
const adminRoutes = require("./routes/Admin-Routes");
const vehicleRoutes = require("./routes/Vehicle-Routes");

const app = express();

const corOptions = {
  origin: "http://localhost:5173",
  method: "GET, POST, PUT ,DELETE, PATCH, HEAD",
  credential: true,
};
app.use(cors(corOptions))

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static("uploads"));


// Connect to Database
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/visitor", visitorRoutes);
app.use("/api/incidents", incidentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/staff", staffRoutes);

// Error Handling Middleware
app.use(errorHandler);

// Schedule a Cron Job to delete unapproved users every hour
cron.schedule("0 * * * *", async () => {
  await deleteUnapprovedUsers();
});

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
