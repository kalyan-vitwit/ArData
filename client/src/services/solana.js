import { PublicKey } from '@solana/web3.js';

export const checkReceiptExists = async (connection, programId, buyerPublicKey, contentId) => {
    try {
        const [receiptPda] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("receipt"),           // Seed 1: Literal "receipt"
                buyerPublicKey.toBuffer(),        // Seed 2: Buyer's Public Key
                Buffer.from(contentId)            // Seed 3: Content ID String
            ],
            programId
        );

        const accountInfo = await connection.getAccountInfo(receiptPda);
        console.log("Receipt PDA:", accountInfo);

        return accountInfo !== null;

    } catch (error) {
        console.error("Error checking receipt PDA:", error);
        return false;
    }
};