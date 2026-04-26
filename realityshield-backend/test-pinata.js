const { uploadToIPFS } = require("./services/ipfsService");
const fs = require("fs");
const path = require("path");

async function testPinata() {
  console.log("Testing Pinata IPFS Upload...");
  
  const testFilePath = path.join(__dirname, "test-ipfs.txt");
  fs.writeFileSync(testFilePath, "RealityShield IPFS Test Content " + Date.now());

  try {
    const cid = await uploadToIPFS(testFilePath);
    console.log("SUCCESS! IPFS CID:", cid);
    console.log("View at: https://gateway.pinata.cloud/ipfs/" + cid);
  } catch (error) {
    console.error("Test Failed:", error.message);
  } finally {
    if (fs.existsSync(testFilePath)) fs.unlinkSync(testFilePath);
  }
}

testPinata();
