require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("./models/User");

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected");

    // Admin details
    const adminEmail = "admin@smartcivic.com";
    const adminPassword = "Admin@12345";

    // Check if admin already exists
    const existingAdmin = await User.findOne({
      email: adminEmail
    });

    if (existingAdmin) {
      console.log("Admin account already exists");
      await mongoose.connection.close();
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      adminPassword,
      10
    );

    // Create admin
    const admin = await User.create({
      name: "Municipal Administrator",
      email: adminEmail,
      password: hashedPassword,
      phone: "",
      address: "",
      role: "ADMIN"
    });

    console.log("Admin created successfully!");
    console.log("Email:", admin.email);
    console.log("Role:", admin.role);

    await mongoose.connection.close();

  } catch (error) {
    console.error(
      "Error creating admin:",
      error.message
    );

    process.exit(1);
  }
};

createAdmin();