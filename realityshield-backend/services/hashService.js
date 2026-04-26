const crypto = require("crypto");
const fs = require("fs");
const { imageHash } = require("image-hash");

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
  // 16 bits = 64-bit hash (16x4)
  const phash = await new Promise((resolve, reject) => {
    imageHash(filePath, 16, true, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });

  return { sha, phash };
};
