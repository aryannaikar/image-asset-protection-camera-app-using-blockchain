const fs = require("fs");
const hashService = require("../services/hashService");
const ipfsService = require("../services/ipfsService");
const dbService = require("../services/dbService");
const blockchainService = require("../services/blockchainService");

exports.uploadImage = async (req, res) => {
  const filePath = req.file?.path;
  const owner = req.body.owner || "Anonymous";
  const password = req.body.password;
  const latitude = req.body.latitude ? parseFloat(req.body.latitude) : null;
  const longitude = req.body.longitude ? parseFloat(req.body.longitude) : null;

  if (!filePath) {
    return res.status(400).json({ error: "No image file provided" });
  }

  try {
    // 1. Generate Hashes (fast, do before responding)
    const { sha, phash } = await hashService.generateHashes(filePath);

    // 2. Store SHA on Blockchain (fast on localhost)
    let blockchainTx = null;
    try {
      blockchainTx = await blockchainService.storeHash(sha);
    } catch (blockchainErr) {
      console.warn("[Blockchain] Could not store hash (is Hardhat running?):", blockchainErr.message);
    }

    // 3. Respond immediately so the mobile client doesn't time out waiting for IPFS
    res.json({
      success: true,
      sha256: sha,
      phash,
      owner,
      blockchainTx,
      message: "Image received. Processing IPFS in background..."
    });

    // 4. Continue processing IPFS and DB in background (non-blocking, slow)
    setImmediate(async () => {
      try {
        const cid = await ipfsService.uploadToIPFS(filePath);
        await dbService.saveImage({ phash, cid, owner, password, latitude, longitude });
        console.log(`[Upload] Done: CID=${cid} SHA=${sha} pHash=${phash} Location=${latitude},${longitude}`);
      } catch (bgError) {
        console.error("[Upload Background Error]:", bgError.message);
      } finally {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }
    });

  } catch (error) {
    console.error("Upload Error:", error);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.status(500).json({ error: error.message });
  }
};

