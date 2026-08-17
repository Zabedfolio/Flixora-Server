require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/flixora";
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3000";

// Middlewares
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic Health Check Route (no APIs created, per request)
app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Flixora Server is running smoothly",
    timestamp: new Date().toISOString()
  });
});

// Database Connection and Server Startup
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log("🟢 Successfully connected to MongoDB database.");
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("🔴 MongoDB connection error:", error.message);
    console.log("⚠️ Server startup paused due to database connection error.");
  });

// Handle unhandled Promise rejections and uncaught exceptions
process.on("unhandledRejection", (reason, promise) => {
  console.error("🚨 Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("🚨 Uncaught Exception thrown:", err);
  process.exit(1);
});
