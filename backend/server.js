const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const visitorRoutes = require("./routes/visitors");
const incidentRoutes = require("./routes/incidentRoutes");
const userRoutes = require("./routes/users");
const errorHandler = require("./middleware/errorHandler");
const incidentRouters= require("./routes/incidents")

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

// Database connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.log("DB connection error:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/visitors", visitorRoutes);
app.use("/api/incidents", incidentRoutes);
app.use("/api", incidentRouters);


// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// console.log("MongoDB URI:", process.env.MONGO_URI);
// console.log("JWT Secret:", process.env.JWT_SECRET);
console.log("Port:", process.env.PORT);