const mongoose = require("mongoose");

let isConnecting = false;
let keepAliveTimer = null;

// Periodic Keep-Alive Ping: Prevents MongoDB Atlas from auto-pausing due to inactivity
const startKeepAlive = () => {
  if (keepAliveTimer) clearInterval(keepAliveTimer);

  // Ping every 6 hours (MongoDB Atlas pauses clusters after days of complete inactivity)
  keepAliveTimer = setInterval(async () => {
    try {
      if (mongoose.connection.readyState === 1) {
        await mongoose.connection.db.admin().ping();
        console.log("💓 MongoDB Atlas Keep-Alive Ping sent successfully (Cluster active)");
      }
    } catch (err) {
      console.warn("⚠️ Keep-alive ping failed:", err.message);
    }
  }, 6 * 60 * 60 * 1000); // 6 hours
};

const connectDB = async () => {
  if (isConnecting || mongoose.connection.readyState === 1) return;

  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error("❌ MONGODB_URI is missing in your .env file.");
    return;
  }

  isConnecting = true;

  try {
    const connection = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // 5s timeout instead of hanging
      socketTimeoutMS: 45000
    });

    console.log(`✅ MongoDB Connected Successfully: ${connection.connection.host}`);
    startKeepAlive();
    isConnecting = false;
  } catch (error) {
    isConnecting = false;
    console.error("❌ MongoDB Connection Failed:", error.message);

    if (error.message.includes("bad auth") || error.message.includes("Authentication failed")) {
      console.error(
        "👉 TIP: Check your MongoDB username and password in .env."
      );
    } else if (
      error.name === "MongooseServerSelectionError" ||
      error.message.includes("querySrv") ||
      error.message.includes("ETIMEDOUT") ||
      error.message.includes("ECONNREFUSED")
    ) {
      console.error("\n========================================================");
      console.error("⚠️  CLUSTER PAUSED OR IP BLOCKED BY MONGODB ATLAS");
      console.error("   1. Open: https://cloud.mongodb.com/");
      console.error("   2. If your cluster is PAUSED, click 'Resume' or 'Unpause'.");
      console.error("   3. Check 'Network Access' -> Add IP Address -> 'Allow Access from Anywhere (0.0.0.0/0)'.");
      console.error("   🔄 The backend will automatically retry connecting every 10 seconds...");
      console.error("========================================================\n");
    }

    // Auto-retry connection every 10 seconds in the background without crashing the server!
    setTimeout(() => {
      if (mongoose.connection.readyState !== 1) {
        console.log("🔄 Retrying MongoDB connection in background...");
        connectDB();
      }
    }, 10000);
  }
};

// Monitor connection events
mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ MongoDB Disconnected. Scheduling auto-reconnect...");
  setTimeout(() => connectDB(), 5000);
});

mongoose.connection.on("reconnected", () => {
  console.log("✅ MongoDB Reconnected successfully!");
  startKeepAlive();
});

module.exports = connectDB;