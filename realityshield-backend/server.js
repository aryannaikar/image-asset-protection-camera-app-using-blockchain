const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const uploadRoute = require("./routes/upload");
const verifyRoute = require("./routes/verify");
const historyRoute = require("./routes/history");
const loginRoute = require("./routes/login");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Ensure uploads directory exists
const fs = require("fs");
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Routes
app.use("/api/upload", uploadRoute);
app.use("/api/verify", verifyRoute);
app.use("/api/history", historyRoute);
app.use("/api/login", loginRoute);

// Root route
app.get("/", (req, res) => {
  res.json({ message: "RealityShield Backend API is running." });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`[RealityShield] Server running on port ${PORT}`);
});
server.timeout = 60000;
