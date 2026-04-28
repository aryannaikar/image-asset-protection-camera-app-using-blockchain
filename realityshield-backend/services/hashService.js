const crypto = require("crypto");
const fs = require("fs");
const imghash = require("imghash");

/**
 * Generates both SHA-256 and perceptual hash for an image.
 * @param {string} filePath - Path to the image file
 * @returns {Promise<{sha: string, phash: string}>}
 */
exports.generateHashes = async (filePath) => {
  // Generate SHA-256 (Exact Identity)
  const fileBuffer = fs.readFileSync(filePath);
  const sha = crypto.createHash("sha256").update(fileBuffer).digest("hex");

  // Generate pHash (Perceptual Similarity)
  // imghash returns a hex string by default
  try {
    const phash = await imghash.hash(filePath, 16);
    return { sha, phash };
  } catch (error) {
    console.error("[HashService] Error generating pHash:", error);
    // Return empty pHash or handle error as needed
    return { sha, phash: "0".repeat(64) };
  }
};
