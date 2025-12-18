# ArData - Decentralized Encrypted Content Marketplace

ArData is a Web3 platform that allows users to securely publish, sell, and access encrypted content using **Solana**, **Arweave**, and **Lit Protocol**.

## 🚀 Features

-   **Decentralized Storage**: Content is stored permanently on **Arweave** (via Irys).
-   **Encryption**: Content is encrypted using **Lit Protocol**, ensuring only buyers can decrypt it.
-   **Payments**: Smart contracts on **Solana** handle payments (SOL) and access rights.
-   **Dual Publishing**: Support for both Binary Files (PDF, Video, Image) and Private Text.
-   **Marketplace**: Browse and purchase content from other users.

## 🛠 Tech Stack

-   **Frontend**: React (Vite), Tailwind CSS (implied/custom styles).
-   **Backend**: Node.js, Express, MongoDB.
-   **Blockchain**: Solana (Anchor Framework).
-   **Storage**: Arweave (Irys SDK).
-   **Security**: Lit Protocol (Encryption/Access Control).

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

1.  **Node.js** (v18+ recommended) & **NPM**.
2.  **MongoDB**: Installed locally or a cloud URI (MongoDB Atlas).
3.  **Solana CLI** & **Anchor AVM** (only if editing smart contracts).
4.  **Phantom Wallet**: Browser extension (set to **Devnet**).

---

## ⚙️ Manual Setup & Installation

Since this project is not containerized, follow these steps to run each component manually.

### 1. Database & Backend Setup

The backend manages user data and content metadata off-chain for quick access.

1.  Navigate to the server directory:
    ```bash
    cd server
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  **Configuration**: Create a `.env` file in the `server` directory:
    ```env
    MONGO_URI=mongodb://localhost:27017/ardata
    # Or your MongoDB Atlas connection string
    ```
4.  Start the server:
    ```bash
    # Note: If 'npm start' fails, run the file directly:
    node index.js
    ```
    *Server should run on `http://localhost:5000`*

---

### 2. Smart Contract (Solana/Anchor)

The smart contract handles the payment logic on the Solana Devnet.

*Note: The project comes with a pre-setup IDL and program ID. You only need to touch this if you want to modify the contract.*

-   **Directory**: `payment-contract`
-   **Current Program ID**: `EH7hw6xEUm9seh7Ss3jGERDXh7UeFY4ZA9X1wdLd5hif`
-   **Network**: Devnet

If instructions are needed to redeploy:
1.  `cd payment-contract`
2.  `anchor build`
3.  `anchor deploy`
4.  Update the `declare_id!` in rust and `payment_contract` in `Anchor.toml` with the new ID.
5.  Copy the new `idl.json` to `../client/src/idl.json`.

---

### 3. Frontend Setup

The client is the user interface.

1.  Navigate to the client directory:
    ```bash
    cd client
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  **Polyfill Setup** (Important for Web3 apps):
    Ensure your `vite.config.js` or `index.html` handles node polyfills (Buffer, crypto) correctly. This project should already be configured.
4.  Start the development server:
    ```bash
    npm run dev
    ```
5.  Open your browser at `http://localhost:5173` (or the port shown).

---

## 🧪 How to Use

1.  **Connect Wallet**: Click "Connect Wallet" and approve via Phantom (Devnet).
2.  **Get Devnet SOL**: Run `solana airdrop 2` in your terminal or use a faucet if you need funds.
3.  **Publish**:
    -   Go to `/publish`.
    -   Enter Title, Price.
    -   Upload a File OR enter Secret Text.
    -   Click "Encrypt & Publish".
    -   Approve the Transaction.
4.  **Buy & Decrypt**:
    -   Go to `/course` (or click a card in Marketplace).
    -   Click "Buy Access" to pay SOL.
    -   Once paid, the content validates your purchase on-chain and decrypts the data via Lit Protocol.

## ⚠️ Common Issues

-   **Lit Protocol Error**: Ensure you have a small amount of ETH/SOL on the respective tesnet if Lit requires it (usually free for devnet). If decryption fails, ensure the wallet that encrypted it (or paid for it) is connected.
-   **MongoDB Connection**: Ensure your local MongoDB service is running (`sudo systemctl start mongod` on Linux).
-   **Server Script**: If `npm start` in `server/` errors with "missing server.js", just use `node index.js`.

---

## 📜 License
ISC / MIT
