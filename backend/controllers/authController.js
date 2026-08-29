const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Bill = require("../models/Bill");
const { JWT_SECRET } = require("../middleware/auth");

// Generate JWT token helper
const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: "30d" });
};

// Seed Admin account on startup
const seedAdmin = async () => {
  try {
    const adminUsername = "kathirusha";
    const existingAdmin = await User.findOne({ username: adminUsername });

    if (!existingAdmin) {
      const admin = new User({
        name: "Kathir Usha (Admin)",
        username: adminUsername,
        password: "Usha2005@@",
        address: "Agri Admin Office",
        role: "admin",
      });
      await admin.save();
      console.log("👑 Default Admin Account created (Username: kathirusha)");
    } else {
      // Ensure admin role and updated password if needed
      if (existingAdmin.role !== "admin") {
        existingAdmin.role = "admin";
        await existingAdmin.save();
      }
    }
  } catch (error) {
    console.error("❌ Admin Seeding Error:", error.message);
  }
};

// POST /api/auth/register — Register new farmer/user
const registerUser = async (req, res) => {
  try {
    const { name, username, password, address } = req.body;

    if (!name || !username || !password || !address) {
      return res.status(400).json({ message: "Name, username, password, and address are required." });
    }

    const cleanUsername = username.trim().toLowerCase();
    const userExists = await User.findOne({ username: cleanUsername });

    if (userExists) {
      return res.status(400).json({ message: "Username is already taken. Please choose another." });
    }

    const user = await User.create({
      name: name.trim(),
      username: cleanUsername,
      password,
      address: address.trim(),
      role: "user",
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      username: user.username,
      address: user.address,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Server error during registration.", error: error.message });
  }
};

// POST /api/auth/login — User & Admin Login
const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required." });
    }

    const cleanUsername = username.trim().toLowerCase();
    const user = await User.findOne({ username: cleanUsername });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        username: user.username,
        address: user.address,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid username or password." });
    }
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error during login.", error: error.message });
  }
};

// GET /api/auth/me — Current User Profile
const getMe = async (req, res) => {
  res.json({
    _id: req.user._id,
    name: req.user.name,
    username: req.user.username,
    address: req.user.address,
    role: req.user.role,
  });
};

// GET /api/auth/users — List All Registered Farmers (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "user" }).select("-password").sort({ createdAt: -1 });

    // Aggregate bill stats per user
    const usersWithStats = await Promise.all(
      users.map(async (u) => {
        const userBills = await Bill.find({ user: u._id });
        const totalAmount = userBills.reduce((sum, b) => sum + (b.grandTotal || 0), 0);
        return {
          _id: u._id,
          name: u.name,
          username: u.username,
          address: u.address,
          createdAt: u.createdAt,
          billsCount: userBills.length,
          totalAmount,
        };
      })
    );

    res.json(usersWithStats);
  } catch (error) {
    console.error("getAllUsers Error:", error);
    res.status(500).json({ message: "Server error fetching users.", error: error.message });
  }
};

module.exports = {
  seedAdmin,
  registerUser,
  loginUser,
  getMe,
  getAllUsers,
};
