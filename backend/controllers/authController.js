const bcrypt =
  require("bcryptjs");

const jwt =
  require("jsonwebtoken");

const User =
  require("../models/User");

const generateToken = (user) => {

  return jwt.sign(
    {
      id: user._id,
      role: user.role
    },

    process.env.JWT_SECRET,

    {
      expiresIn: "7d"
    }
  );
};

const register = async (
  req,
  res
) => {

  try {

    const {
      name,
      email,
      password,
      phone,
      address
    } = req.body;

    if (
      !name ||
      !email ||
      !password
    ) {
      return res.status(400).json({
        message:
          "Name, email and password are required"
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    const existingUser =
      await User.findOne({
        email: { $regex: new RegExp(`^${cleanEmail.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}$`, "i") }
      });

    if (existingUser) {
      return res.status(409).json({
        message:
          "Email already registered"
      });
    }

    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );

    const user =
      await User.create({
        name: name.trim(),
        email: cleanEmail,
        password: hashedPassword,
        phone: phone ? phone.trim() : "",
        address: address ? address.trim() : "",
        role: "CITIZEN"
      });

    const token =
      generateToken(user);

    res.status(201).json({
      message:
        "Registration successful",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {

    res.status(500).json({
      message:
        "Registration failed",
      error: error.message
    });
  }
};

const login = async (
  req,
  res
) => {

  try {

    const {
      email,
      password
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    const user =
      await User.findOne({
        email: { $regex: new RegExp(`^${cleanEmail.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}$`, "i") }
      });

    if (!user) {
      return res.status(401).json({
        message:
          "Invalid email or password"
      });
    }

    let passwordMatch = false;

    if (
      user.password &&
      (user.password.startsWith("$2a$") ||
        user.password.startsWith("$2b$") ||
        user.password.startsWith("$2y$"))
    ) {
      passwordMatch = await bcrypt.compare(password, user.password);
    } else if (user.password === password) {
      // Legacy password from earlier test: auto-upgrade to bcrypt hash
      passwordMatch = true;
      user.password = await bcrypt.hash(password, 10);
      await user.save();
    }

    if (!passwordMatch) {
      return res.status(401).json({
        message:
          "Invalid email or password"
      });
    }

    const token =
      generateToken(user);

    res.json({

      message:
        "Login successful",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {

    res.status(500).json({
      message:
        "Login failed",
      error: error.message
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({
        message: "Email and new password are required"
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: { $regex: new RegExp(`^${cleanEmail.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}$`, "i") }
    });

    if (!user) {
      return res.status(404).json({
        message: "No account found with this email address"
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({
      message: "Password reset successfully. You can now login with your new password."
    });

  } catch (error) {
    res.status(500).json({
      message: "Password reset failed",
      error: error.message
    });
  }
};

module.exports = {
  register,
  login,
  resetPassword
};