const express = require("express");
const dbService = require("../services/dbService");
const router = express.Router();

/**
 * GET /api/history?owner=username
 * Fetches all image proofs registered by a specific user.
 */
router.get("/", async (req, res) => {
  const { owner } = req.query;

  if (!owner) {
    return res.status(400).json({ error: "Owner name is required" });
  }

  try {
    const { data, error } = await require("../services/dbService").getHistory(owner);
    
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    console.error("History Fetch Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
