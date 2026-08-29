require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const billRoutes = require("./routes/billRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// CORS setup — allow any origin cleanly while supporting preflights
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/api/bills", billRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "🌾 Agri Billing API is active!", timestamp: new Date() });
});

// Serve frontend static build if available (production unified deploy support)
const frontendDistPath = path.join(__dirname, "../frontend/dist");
app.use(express.static(frontendDistPath));

// Fallback: send index.html for React Router frontend routes (if static dist exists)
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return next();
  }
  const indexFile = path.join(frontendDistPath, "index.html");
  res.sendFile(indexFile, (err) => {
    if (err) {
      // If frontend dist is not built, show standard API landing
      res.json({ message: "🌾 Agri Billing API is running!", timestamp: new Date() });
    }
  });
});

// Global 404 handler for API routes
app.use("/api/*", (req, res) => {
  res.status(404).json({ message: "API route not found." });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal server error.", error: err.message });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
