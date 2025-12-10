import React, { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';


import { WebIrys } from "@irys/sdk";
import { PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider, web3, utils, BN } from '@coral-xyz/anchor';
import idl from './idl.json';
import { encryptWithLit, getLitClient } from './services/litProtocol';
import { uploadToArweave } from './services/irysUpload';

const PublishPage = () => {
    const { connection } = useConnection();
    const wallet = useWallet();

    const [title, setTitle] = useState("");
    const [price, setPrice] = useState(0);
    const [fileText, setFileText] = useState("");
    const [status, setStatus] = useState("");

    const handlePublish = async () => {
        if (!wallet.publicKey) return alert("Please Connect Wallet first!");

        try {
            setStatus("Starting process...");
            // FIX: Generate a shorter ID (must be < 32 chars for Solana seeds)
            const contentId = "id_" + Math.random().toString(36).substring(2, 12);

            // --- STEP A: Encrypt with Lit ---
            setStatus("Encrypting data (Please sign the auth message)...");
            const litClient = await getLitClient();
            console.log("Lit Client connected:", litClient);

            const { ciphertext, dataToEncryptHash, solRpcConditions } = await encryptWithLit(litClient, fileText);

            // --- STEP B: Upload to Arweave ---
            // Prepare metadata separate from the encrypted payload
            const metadata = {
                title,
                description: "Premium Content",
                contentId,
                solRpcConditions
            };

            setStatus("Uploading to Arweave...");

            // FIX: Pass 'wallet' as the first argument
            const arweaveHash = await uploadToArweave(
                wallet,
                {
                    encryptedString: ciphertext,
                    encryptedSymmetricKey: dataToEncryptHash,
                    accessControlConditions: solRpcConditions
                },
                metadata
            );

            console.log("Arweave Hash:", arweaveHash);

            // --- STEP C: List on Solana ---
            setStatus("Listing on Smart Contract...");

            const provider = new AnchorProvider(connection, wallet, {});
            console.log("Anchor Provider created :", provider);

            const validIdl = idl.default || idl;

            // Debugging: Check if IDL is loaded correctly
            console.log("Loaded IDL:", validIdl);

            if (!validIdl || !validIdl.accounts) {
                throw new Error("IDL file is missing or invalid. Please check idl.json");
            }
            validIdl.address = "D3tJsQ2Ad36CNK68H9P9porbsmQAyXz8WxxN3CfkDi91";

            // REPLACE WITH YOUR PROGRAM ID
            const program = new Program(validIdl, provider);
            console.log("Program instance created:", program);

            const [listingPda] = PublicKey.findProgramAddressSync(
                [utils.bytes.utf8.encode("listing"), utils.bytes.utf8.encode(contentId)],
                program.programId
            );
            console.log("Listing PDA:", listingPda.toBase58());

            await program.methods
                .listContent(contentId, arweaveHash, title, new BN(price))
                .accounts({
                    seller: wallet.publicKey,
                    listingPda: listingPda,
                    systemProgram: web3.SystemProgram.programId,
                })
                .rpc();

            setStatus("Success! Content is live on Devnet.");

        } catch (error) {
            console.error(error);
            setStatus("Error: " + error.message);
        }
    };

    return (
        <div style={{ padding: 40, maxWidth: 600, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h1>Publisher Dashboard</h1>
                <WalletMultiButton />
            </div>

            {wallet.connected ? (
                <div style={{ background: '#f5f5f5', padding: 20, borderRadius: 10 }}>
                    <div style={{ marginBottom: 15 }}>
                        <label>Content Title:</label>
                        <input value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: '100%', padding: 8, marginTop: 5 }} />
                    </div>

                    <div style={{ marginBottom: 15 }}>
                        <label>Price (Lamports):</label>
                        <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} style={{ width: '100%', padding: 8, marginTop: 5 }} />
                    </div>

                    <div style={{ marginBottom: 15 }}>
                        <label>Secret Content:</label>
                        <textarea value={fileText} onChange={(e) => setFileText(e.target.value)} style={{ width: '100%', height: 100, padding: 8, marginTop: 5 }} />
                    </div>

                    <button onClick={handlePublish} style={{ padding: '10px 20px', background: '#512da8', color: 'white', border: 'none', borderRadius: 5, cursor: 'pointer', fontSize: '16px' }}>
                        Encrypt & Publish
                    </button>

                    <div style={{ marginTop: 20, color: status.includes("Error") ? "red" : "green" }}>
                        <strong>{status}</strong>
                    </div>
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: 50, background: '#eee', borderRadius: 10 }}>
                    <h3>Please connect your wallet to continue</h3>
                </div>
            )}
        </div>
    );
};

export default PublishPage;