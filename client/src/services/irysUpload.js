import { WebIrys } from '@irys/sdk';
import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';

/**
 * Initialize Irys client using the React Wallet Adapter
 * @param {Object} wallet - The wallet object from useWallet() hook
 */
export async function initializeIrys(wallet) {
    try {
        if (!wallet || !wallet.publicKey) {
            throw new Error('Wallet not connected');
        }

        const rpcUrl = "https://api.devnet.solana.com";

        // Create the compatible wrapper
        const walletAdapter = {
            name: "solana",
            provider: wallet, // Pass the React wallet adapter here
        };

        const irys = new WebIrys({
            url: 'https://devnet.irys.xyz',
            token: 'solana',
            wallet: walletAdapter,
            config: { providerUrl: rpcUrl } 
        });

        console.log('🔄 Connecting to Irys...');
        await irys.ready();
        console.log('✅ Irys client initialized');
        
        return irys;

    } catch (error) {
        console.error('❌ Failed to initialize Irys:', error);
        throw new Error(`Irys initialization failed: ${error.message}`);
    }
}

/**
 * Check Irys balance
 */
export async function checkIrysBalance(irys) {
    try {
        const balance = await irys.getLoadedBalance();
        console.log(`💰 Irys Node Balance: ${irys.utils.fromAtomic(balance)} SOL`);
        return balance;
    } catch (error) {
        console.error('❌ Failed to check balance:', error);
        throw error;
    }
}

/**
 * Upload encrypted data to Arweave
 * @param {Object} wallet - The wallet object from useWallet()
 * @param {Object} encryptedData - The encrypted data object
 * @param {Object} metadata - (Optional) Additional metadata
 */
export async function uploadToArweave(wallet, encryptedData, metadata = {}) {
    try {
        // 1. Initialize with the passed wallet
        const irys = await initializeIrys(wallet);

        // 2. Prepare Data
        const dataPackage = {
            encrypted: {
                ciphertext: encryptedData.encryptedString, // This key name matches what you passed from PublishPage
                dataToEncryptHash: encryptedData.encryptedSymmetricKey,
                accessControlConditions: encryptedData.accessControlConditions, 
            },
            metadata: {
                uploadedAt: new Date().toISOString(),
                contentType: 'ai-prompt',
                version: '1.0',
                ...metadata,
            },
        };

        const dataString = JSON.stringify(dataPackage);

        // 3. Check Balance & Price
        const price = await irys.getPrice(dataString.length);
        const balance = await irys.getLoadedBalance();

        console.log(`📊 Upload cost: ${irys.utils.fromAtomic(price)} SOL`);

        if (balance.lt(price)) {
            console.log(`Funding needed...`);
            try {
                // Fund exact amount needed
                await irys.fund(price); 
                console.log('✅ Funded successfully');
            } catch (fundError) {
                throw new Error(`Funding failed: ${fundError.message}`);
            }
        }

        // 4. Upload
        console.log('📤 Uploading...');
        const receipt = await irys.upload(dataString, {
            tags: [
                { name: 'Content-Type', value: 'application/json' },
                { name: 'App-Name', value: 'PromptLock-Solana' }
            ],
        });

        console.log(`✅ Uploaded! ID: ${receipt.id}`);
        return receipt.id;

    } catch (error) {
        console.error('❌ Upload failed:', error);
        throw error;
    }
}