const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");
require("dotenv").config();

/**
 * Uploads a file to IPFS using Pinata.
 * @param {string} filePath - Path to the file to upload
 * @returns {Promise<string>} - IPFS CID
 */
exports.uploadToIPFS = async (filePath) => {
  try {
    const data = new FormData();
    data.append("file", fs.createReadStream(filePath));

    const res = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      data,
      {
        maxBodyLength: "Infinity",
        headers: {
          ...data.getHeaders(),
          pinata_api_key: process.env.PINATA_API_KEY,
          pinata_secret_api_key: process.env.PINATA_SECRET_API_KEY,
        },
      }
    );

    return res.data.IpfsHash;
  } catch (error) {
    console.error("IPFS Upload Error:", error.response?.data || error.message);
    throw new Error("Failed to upload to IPFS via Pinata");
  }
};
