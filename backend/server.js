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
const authRoutes = require("./routes/auth-router");
const userRoutes = require("./routes/users-router");
const visitorRoutes = require("./routes/visitor-Routers");
const incidentRoutes = require("./routes/incidents");
const adminRoutes = require("./routes/adminRoutes");

const app = express();
const server = http.createServer(app);


// Middleware
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));



// Connect to Database
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/visitor", visitorRoutes);
app.use("/api/incidents", incidentRoutes);
app.use("/api/admin", adminRoutes);

// Error Handling Middleware
app.use(errorHandler);

// Schedule a Cron Job to delete unapproved users every hour
cron.schedule("0 * * * *", async () => {
  await deleteUnapprovedUsers();
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
