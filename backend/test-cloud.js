require("dotenv").config({ path: require("path").join(__dirname, ".env") });
const mongoose = require("mongoose");

async function testCloudConnection() {
  console.log("\n========================================================");
  console.log("☁️  TESTING MONGODB CLOUD ATLAS CONNECTION...");
  console.log("========================================================\n");

  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error("❌ Error: MONGODB_URI is not set in your .env file.");
    process.exit(1);
  }

  // Mask credentials for clean terminal output
  const maskedUri = uri.replace(/:([^@]+)@/, ":****@");
  console.log(`Connecting to: ${maskedUri}\n`);

  const startTime = Date.now();

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000
    });

    const latency = Date.now() - startTime;

    console.log(`✅ SUCCESS: Connected to MongoDB Cloud Atlas!`);
    console.log(`   Cluster Host: ${conn.connection.host}`);
    console.log(`   Database:     ${conn.connection.name}`);
    console.log(`   Latency:      ${latency}ms`);

    // Perform a lightweight write & read test to verify permissions
    const adminDb = conn.connection.db.admin();
    const pingResult = await adminDb.ping();
    console.log(`   Ping Result:  OK (${JSON.stringify(pingResult)})\n`);

    console.log("🎉 Your MongoDB Cloud database is online, active, and working perfectly!\n");
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(`❌ CLOUD CONNECTION FAILED: ${error.message}\n`);

    if (error.name === "MongooseServerSelectionError" || error.message.includes("ETIMEDOUT") || error.message.includes("querySrv")) {
      console.log("📌 REASON: Your MongoDB Atlas cluster is currently PAUSED or your IP is blocked.");
      console.log("\n👉 HOW TO FIX IN 60 SECONDS:");
      console.log("   1. Open: https://cloud.mongodb.com/ and log in.");
      console.log("   2. Find 'SmartCivicCluster'.");
      console.log("   3. If it says 'Cluster Paused', click the green 'Resume' button.");
      console.log("   4. Go to 'Network Access' -> Click 'Add IP Address' -> Select 'Allow Access from Anywhere (0.0.0.0/0)' -> Confirm.");
      console.log("   5. Wait ~1-2 minutes for the cluster to turn green, then run 'node test-cloud.js' again.\n");
    } else if (error.message.includes("bad auth") || error.message.includes("Authentication failed")) {
      console.log("📌 REASON: Invalid username or password in .env.");
      console.log("   Check MongoDB Atlas -> Database Access -> Ensure user 'Dedeepya' exists and password is correct.\n");
    }

    process.exit(1);
  }
}

testCloudConnection();
