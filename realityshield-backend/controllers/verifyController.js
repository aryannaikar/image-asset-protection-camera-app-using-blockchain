const fs = require("fs");
const axios = require("axios");
const path = require("path");
const hashService = require("../services/hashService");
const dbService = require("../services/dbService");
const blockchainService = require("../services/blockchainService");
const compare = require("../utils/compareHash");

exports.verifyImage = async (req, res) => {
  let filePath = req.file?.path;
  const imageUrl = req.body.url;

  try {
    // If Base64 is provided (e.g. from WhatsApp/Instagram blobs)
    if (!filePath && !imageUrl && req.body.base64) {
      filePath = path.join("uploads", `temp-b64-${Date.now()}.jpg`);
      const base64Data = req.body.base64.replace(/^data:image\/\w+;base64,/, "");
      fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
    }

    // If URL is provided, download the image
    if (!filePath && imageUrl) {
      filePath = path.join("uploads", `temp-${Date.now()}.jpg`);
      const response = await axios({
        url: imageUrl,
        responseType: "stream",
      });
      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);
      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });
    }

    if (!filePath) {
      return res.status(400).json({ error: "No image or URL provided" });
    }

    // 1. Generate Hashes for the current image
    const { sha, phash } = await hashService.generateHashes(filePath);

    // 2. Exact Match Check (Blockchain SHA-256)
    const isAuthentic = await blockchainService.checkHash(sha);
    if (isAuthentic) {
      // Find the metadata in DB for more info
      const original = await dbService.findSimilar(phash); // Hamming 0
      
      // Cleanup
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

      return res.json({
        status: "authentic",
        confidence: 100,
        reason: "exact match",
        original: original || { sha256: sha }
      });
    }

    // 3. Perceptual Similarity Check (DB pHash)
    console.log(`[Verify] Querying DB with pHash: ${phash}`);
    const match = await dbService.findSimilar(phash);

    if (match) {
      const distance = compare.hammingDistance(phash, match.phash);
      // 256 bit hash. Confidence is percentage of bits that match.
      const confidence = Math.round(((256 - distance) / 256) * 100);

      // Cleanup
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

      return res.json({
        status: "tampered",
        confidence,
        reason: distance === 0 ? "Exact visual match but different binary (likely re-encoded)" : "Similar image detected (likely cropped or edited)",
        original: {
          ...match,
          imageUrl: `https://gateway.pinata.cloud/ipfs/${match.cid}`
        }
      });
    }

    // 4. No Match
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    return res.json({
      status: "unknown",
      confidence: 0,
      reason: "No matching records found in database or blockchain"
    });

  } catch (error) {
    console.error("Verification Error:", error);
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.status(500).json({ error: error.message });
  }
};
