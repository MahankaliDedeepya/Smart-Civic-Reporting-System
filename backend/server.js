
require("dotenv").config({
  path: require("path").join(__dirname, ".env")
});

const express = require("express");
const cors = require("cors");
const path = require("path");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const complaintRoutes = require("./routes/complaintRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const adminRoutes = require("./routes/adminRoutes");
const aiRoutes = require("./routes/aiRoutes");

const app = express();

/* =========================
   DATABASE
========================= */

connectDB();

/* =========================
   CORS CONFIGURATION
========================= */

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  process.env.CLIENT_URL
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests without an Origin header
      // and requests from approved frontend URLs.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.error("Blocked by CORS:", origin);

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true
  })
);

/* =========================
   BODY PARSING
========================= */

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true
  })
);

/* =========================
   STATIC FILES
========================= */

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

/* =========================
   TEST ROUTE
========================= */

app.get("/", (req, res) => {
  res.json({
    message: "Smart Civic Reporting API is running"
  });
});

/* =========================
   HEALTH CHECK
========================= */

app.get("/api/health", (req, res) => {
  const mongoose = require("mongoose");

  const states = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting"
  };

  const state = mongoose.connection.readyState;

  res.json({
    status: state === 1 ? "ok" : "database_offline",
    database: states[state] || "unknown",
    host: mongoose.connection.host || null,
    message:
      state === 1
        ? "Database is connected and ready."
        : "MongoDB Atlas cluster appears paused or unreachable. Auto-retry is active."
  });
});

/* =========================
   API ROUTES
========================= */

app.use("/api/auth", authRoutes);

app.use("/api/complaints", complaintRoutes);

app.use("/api/notifications", notificationRoutes);

app.use("/api/feedback", feedbackRoutes);

app.use("/api/admin", adminRoutes);

app.use("/api/ai", aiRoutes);

/* =========================
   ERROR HANDLER
========================= */

app.use((err, req, res, next) => {
  console.error("Server Error:", err);

  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      message: "This frontend origin is not allowed by CORS."
    });
  }

  res.status(500).json({
    message: "Internal server error"
  });
});

/* =========================
   START SERVER
========================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log("Allowed frontend origins:", allowedOrigins);
});
