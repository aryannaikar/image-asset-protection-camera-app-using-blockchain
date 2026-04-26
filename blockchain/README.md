# ⛓️ RealityShield Blockchain

This directory contains the smart contracts and deployment scripts for the RealityShield project.

## 📄 Smart Contract: `RealityShield.sol`
A Solidity contract that maintains a registry of image hashes.
- **Key Function**: `registerImage(string memory cid, string memory hash)`
- **Immutable Storage**: Once registered, the proof of authenticity cannot be altered.

## 🛠️ Commands
```bash
# Start local node
npx hardhat node

# Deploy to local node
npx hardhat run scripts/deploy.js --network localhost

# Run tests
npx hardhat test
```

## ⚙️ Configuration
The network configuration is stored in `hardhat.config.js` and uses the `PRIVATE_KEY` and `RPC_URL` from the `.env` file.
