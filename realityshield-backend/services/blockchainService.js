const { ethers } = require("ethers");
require("dotenv").config();

// Connect to Hardhat or a testnet
const provider = new ethers.JsonRpcProvider(process.env.HARDHAT_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contractAddress = process.env.REALITYSHIELD_ADDRESS;

// Minimal ABI for the RealityShield contract
const abi = [
  "function storeProof(string memory sha) public",
  "function verifyProof(string memory sha) public view returns (bool exists, address owner, uint256 timestamp)"
];

const contract = new ethers.Contract(contractAddress, abi, wallet);

/**
 * Stores a SHA-256 hash on the blockchain.
 * @param {string} sha - The SHA-256 hash to store
 * @returns {Promise<string>} - Transaction hash
 */
exports.storeHash = async (sha) => {
  console.log(`[Blockchain] Storing hash on network: ${sha}`);
  const tx = await contract.storeProof(sha);
  await tx.wait();
  console.log(`[Blockchain] Tx Hash: ${tx.hash}`);
  return tx.hash;
};

/**
 * Checks if a SHA-256 hash exists on the blockchain.
 * @param {string} sha - The SHA-256 hash to check
 * @returns {Promise<boolean>}
 */
exports.checkHash = async (sha) => {
  console.log(`[Blockchain] Checking hash on network: ${sha}`);
  const [exists] = await contract.verifyProof(sha);
  return exists;
};
