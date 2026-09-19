
const express = require("express");

const agentRoutes = require("./routes/agent.routes");

const app = express();

// Middleware
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "ZereQueue API is running",
  });
});

// Agent routes
app.use("/api/agent", agentRoutes);

// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("❌ Server error:", err.message);

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

module.exports = app;