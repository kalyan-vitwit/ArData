import * as LitJsSdk from "@lit-protocol/lit-node-client";
import { encryptString, decryptToString } from '@lit-protocol/encryption';


export async function getLitClient() {
    const client = new LitJsSdk.LitNodeClient({
        litNetwork: "datil-dev",
        debug: false
    });
    await client.connect();
    return client;
}

export async function encryptWithLit(litClient, DataToEncrypt) {
    // 1. Auth Signature
    const authSig = await LitJsSdk.checkAndSignAuthMessage({
        chain: "solana",
        // This will detect your Phantom wallet automatically
    });

    // 2. Access Control Conditions
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

    // 3. Encrypt
    const { ciphertext, dataToEncryptHash } = await encryptString(
        {
            solRpcConditions: solRpcConditions,
            dataToEncrypt: DataToEncrypt,
            authSig: authSig,
            chain: "solana",
        },
        litClient
    );
    console.log("Encryption complete. Data Hash:", dataToEncryptHash);

    return { ciphertext, dataToEncryptHash, solRpcConditions };
}