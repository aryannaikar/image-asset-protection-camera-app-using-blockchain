# 🛡️ RealityShield: Decentralized Image Authenticity

RealityShield is a multi-platform ecosystem designed to combat misinformation and deepfakes by providing a decentralized proof-of-authenticity for images. It leverages Blockchain for immutable timestamping, IPFS for decentralized storage, and a robust Backend to verify image integrity.

---

## 🚀 Project Overview

The system consists of four main components:

1.  **[RealityShield Backend](./realityshield-backend)**: An Express.js server that handles image hashing, IPFS uploads via Pinata, database management with Supabase, and blockchain interactions.
2.  **[Blockchain](./blockchain)**: A Hardhat-based project containing the `RealityShield` smart contract that stores image hashes and ownership metadata.
3.  **[Mobile App](./mobile-app)**: A premium React Native (Expo) application for capturing "secure-by-default" photos with GPS metadata and verifying them against the vault.
4.  **[Chrome Extension](./extension)**: A browser tool to verify images found on any website by comparing them against the RealityShield registry.

---

## 🛠️ Tech Stack

-   **Frontend**: React Native (Expo), Vanilla JS (Extension)
-   **Backend**: Node.js, Express.js
-   **Storage**: IPFS (Pinata), Supabase (PostgreSQL)
-   **Blockchain**: Solidity, Hardhat, Ethers.js
-   **Design**: Premium Glassmorphism, CSS3 Animations

---

## ⚙️ Setup & Installation

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Expo Go](https://expo.dev/expo-go) app on your mobile device (for testing the app)

### 2. Environment Configuration
Environment files have been created in:
- `./.env` (Root)
- `./realityshield-backend/.env`
- `./blockchain/.env`
- `./mobile-app/.env`

Ensure you have your **Pinata API Keys** and **Supabase Keys** filled in the root `.env`.

### 3. Installation
Install dependencies for all components:

```bash
# Install Backend dependencies
cd realityshield-backend
npm install

# Install Blockchain dependencies
cd ../blockchain
npm install

# Install Mobile App dependencies
cd ../mobile-app
npm install
```

---

## 🏃 Running the Project

### Phase 1: Local Blockchain
Start a local Hardhat node and deploy the contract:

```bash
cd blockchain
npx hardhat node
# In a new terminal:
npx hardhat run scripts/deploy.js --network localhost
```
*Note: Update the `REALITYSHIELD_ADDRESS` in your `.env` files with the deployed contract address.*

### Phase 2: Backend Server
```bash
cd realityshield-backend
node server.js
```
The server will run at `http://localhost:5000`.

### Phase 3: Mobile App
```bash
cd mobile-app
npx expo start --tunnel -c
```
Scan the QR code with the **Expo Go** app.

### Phase 4: Chrome Extension
1. Open Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode**.
3. Click **Load unpacked** and select the `extension` folder from this project.

---

## 📜 License
This project is part of a Google Hackathon submission. All rights reserved.
