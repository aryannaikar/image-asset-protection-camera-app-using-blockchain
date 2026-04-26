# 🚀 RealityShield Backend

This is the core API for the RealityShield ecosystem. It bridges the gap between the user interfaces (Mobile/Extension) and the decentralized infrastructure (Blockchain/IPFS).

## 🛠️ Features
- **Image Verification**: Compares image hashes against the blockchain registry.
- **Identity Locking**: Stores image metadata on IPFS and registers it on-chain.
- **Authentication**: Simple credential-based access to the vault.
- **Database**: Uses Supabase for fast lookups of history and user records.

## 📡 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/verify` | Analyze an image for authenticity. |
| `POST` | `/api/upload` | Register a new image on the blockchain. |
| `GET` | `/api/history` | Retrieve secure vault history for a user. |
| `POST` | `/api/login` | Authenticate or initialize a user identity. |

## 🛠️ Setup
1. `npm install`
2. Ensure `.env` is configured (see root `.env.example`).
3. `npm run dev` (Runs with nodemon)
