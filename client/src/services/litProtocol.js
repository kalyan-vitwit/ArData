import * as LitJsSdk from "@lit-protocol/lit-node-client";
import { encryptString } from '@lit-protocol/encryption';


// 1. Convert ArrayBuffer to Base64
const arrayBufferToBase64 = (buffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

// 2. Generate Key & Encrypt Data (AES-GCM)
const encryptDataLocally = async (text) => {
    const ec = new TextEncoder();
    
    // A. Generate a random symmetric key
    const key = await window.crypto.subtle.generateKey(
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
    );

    // B. Encrypt the data with this key
    const iv = window.crypto.getRandomValues(new Uint8Array(12)); // Random IV
    const encryptedContent = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv },
        key,
        ec.encode(text)
    );

    // C. Export the Key so we can give it to Lit
    const exportedKey = await window.crypto.subtle.exportKey("raw", key);

    return {
        encryptedPayload: arrayBufferToBase64(encryptedContent),
        payloadIV: arrayBufferToBase64(iv),
        symmetricKeyBytes: new Uint8Array(exportedKey) // This goes to Lit
    };
};

export const getLitClient = async () => {
    const client = new LitJsSdk.LitNodeClient({
        litNetwork: "datil-dev",
        debug: false
    });
    await client.connect();
    return client;
};

export const encryptWithLit = async (litClient, textToEncrypt) => {
    try {
        console.log("1. Encrypting data locally with AES-GCM...");
        const { encryptedPayload, payloadIV, symmetricKeyBytes } = await encryptDataLocally(textToEncrypt);

        console.log("2. Getting Auth Signature...");
        const authSig = await LitJsSdk.checkAndSignAuthMessage({
            chain: "solana",
        });

        const solRpcConditions = [
            {
                method: "getBalance",
                params: [":userAddress"],
                pdaParams: [],
                pdaInterface: { offset: 0, fields: {} },
                pdaKey: "",
                chain: "solana",
                returnValueTest: {
                    key: "",
                    comparator: ">=",
                    value: "0",
                },
            },
        ];

        console.log("3. Encrypting the SYMMETRIC KEY with Lit...");
        // IMPORTANT: We are encrypting the KEY, not the File Text
        // We convert the key bytes to a string or base16 for Lit to handle
        // Lit expects a string or Uint8Array.
        
        const { ciphertext, dataToEncryptHash } = await encryptString(
            {
                solRpcConditions: solRpcConditions,
                dataToEncrypt: LitJsSdk.uint8arrayToString(symmetricKeyBytes, "base16"), // Send Key as string
                authSig: authSig,
                chain: "solana",
            },
            litClient
        );

        // Return the Hybrid Bundle
        return {
            payload: {
                data: encryptedPayload,
                iv: payloadIV
            },
            lit_security: {
                encryptedKey: ciphertext, // This is the encrypted AES key
                keyHash: dataToEncryptHash,
                conditions: solRpcConditions
            }
        };

    } catch (error) {
        console.error("Hybrid Encryption Failed:", error);
        throw error;
    }
};