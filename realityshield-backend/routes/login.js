const express = require("express");
const dbService = require("../services/dbService");
const router = express.Router();

/**
 * POST /api/login
 * Verifies or creates a user with the given username and password.
 */
router.post("/", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  try {
    const user = await dbService.getOrCreateUser(username, password);
    res.json({ success: true, message: "Login successful", user });
  } catch (error) {
    console.error("Login Error:", error.message);
    res.status(401).json({ error: error.message });
  }
});

module.exports = router;
