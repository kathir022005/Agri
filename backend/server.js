require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const billRoutes = require("./routes/billRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// CORS setup — allow any origin cleanly while supporting preflights
app.use(
  cors({
    origin: true, // Mirrors the incoming request origin (works across Render, Vercel, localhost)
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/bills", billRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ message: "🌾 Agri Billing API is running!", timestamp: new Date() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found." });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal server error.", error: err.message });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
