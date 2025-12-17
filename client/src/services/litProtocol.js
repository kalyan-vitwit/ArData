import * as LitJsSdk from "@lit-protocol/lit-node-client";
import { encryptString, decryptToString } from "@lit-protocol/encryption";


const arrayBufferToBase64 = (buffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

const base64ToUint8Array = (base64) => {
    const binary_string = window.atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes;
};

const encryptDataLocally = async (data) => {
    const encodedData = typeof data === 'string' ? new TextEncoder().encode(data) : data;

    const key = await window.crypto.subtle.generateKey(
        { name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]
    );
    const iv = window.crypto.getRandomValues(new Uint8Array(12)); 
    const encryptedContent = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv }, key, encodedData
    );
    const exportedKey = await window.crypto.subtle.exportKey("raw", key);

    return {
        encryptedPayload: arrayBufferToBase64(encryptedContent),
        payloadIV: arrayBufferToBase64(iv),
        symmetricKeyBytes: new Uint8Array(exportedKey) 
    };
};

const decryptLocally = async (encryptedBase64, ivBase64, symmetricKeyBytes) => {
    const dataBuffer = base64ToUint8Array(encryptedBase64);
    const ivBuffer = base64ToUint8Array(ivBase64);

    const key = await window.crypto.subtle.importKey(
        "raw", symmetricKeyBytes, { name: "AES-GCM" }, true, ["encrypt", "decrypt"]
    );
    
    const decryptedBuffer = await window.crypto.subtle.decrypt(
        { name: "AES-GCM", iv: ivBuffer }, key, dataBuffer
    );

    return new Uint8Array(decryptedBuffer);
};

export const getLitClient = async () => {
    const client = new LitJsSdk.LitNodeClient({
        litNetwork: "datil-dev",
        debug: false
    });
    await client.connect();
    return client;
};


export const encryptWithLit = async (litClient, fileData, contentId, programId) => {
    try {
        console.log("1. Encrypting data locally...");
        const { encryptedPayload, payloadIV, symmetricKeyBytes } = await encryptDataLocally(fileData);

        console.log("2. Calculating Receipt PDA...");
        
        const authSig = await LitJsSdk.checkAndSignAuthMessage({
            chain: "solana",
        });

        const accessControlConditions = [
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

        console.log("3. Encrypting Key with Lit...");
        
        const { ciphertext, dataToEncryptHash } = await encryptString(
            {
                solRpcConditions: accessControlConditions,
                dataToEncrypt: LitJsSdk.uint8arrayToString(symmetricKeyBytes, "base16"),
                authSig,
                chain: "solana",
            },
            litClient
        );

        return {
            payload: { data: encryptedPayload, iv: payloadIV },
            lit_security: {
                encryptedKey: ciphertext,
                keyHash: dataToEncryptHash,
                accessControlConditions: accessControlConditions,
                jsParams: { contentId, programId } 
            }
        };

    } catch (error) {
        console.error("Hybrid Encryption Failed:", error);
        throw error;
    }
};

export const decryptArweaveFile = async (litClient, arweaveData) => {
    try {
        console.log("🔓 Starting Decryption Process...");
        
        const authSig = await LitJsSdk.checkAndSignAuthMessage({ chain: "solana" });
        const { payload, lit_security, metadata } = arweaveData;

        console.log("⚡ Decrypting Key...");
        
        const decryptedKeyHex = await decryptToString(
            {
                solRpcConditions: lit_security.accessControlConditions,
                ciphertext: lit_security.encryptedKey,
                dataToEncryptHash: lit_security.keyHash,
                authSig,
                chain: "solana",
            },
            litClient
        );

        const symmetricKey = new Uint8Array(
            decryptedKeyHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16))
        );

        console.log("🔑 Key Retrieved! Decrypting content...");

        const decryptedBytes = await decryptLocally(
            payload.data,
            payload.iv,
            symmetricKey
        );

        return {
            decryptedData: decryptedBytes,
            metadata: metadata
        };

    } catch (error) {
        console.error("❌ Decryption Failed:", error);
        throw error;
    }
};