import { WebIrys } from '@irys/sdk';

export async function initializeIrys(wallet) {
    try {
        if (!wallet || !wallet.publicKey) throw new Error('Wallet not connected');
        const rpcUrl = "https://api.devnet.solana.com";
        const walletAdapter = { name: "solana", provider: wallet };

        const irys = new WebIrys({
            url: 'https://devnet.irys.xyz',
            token: 'solana',
            wallet: walletAdapter,
            config: { providerUrl: rpcUrl } 
        });

        await irys.ready();
        return irys;
    } catch (error) {
        throw new Error(`Irys initialization failed: ${error.message}`);
    }
}

export async function uploadToArweave(wallet, hybridData, metadata = {}) {
    try {
        const irys = await initializeIrys(wallet);

        const dataPackage = {
            payload: hybridData.payload, 
            lit_security: hybridData.lit_security,
            metadata: {
                uploadedAt: new Date().toISOString(),
                contentType: 'ai-prompt',
                version: '2.0',
                ...metadata,
            },
        };

        const dataString = JSON.stringify(dataPackage);

        const price = await irys.getPrice(dataString.length);
        const balance = await irys.getLoadedBalance();

        console.log(`📊 Upload cost: ${irys.utils.fromAtomic(price)} SOL`);

        if (balance.lt(price)) {
            console.log(`Funding needed...`);
            await irys.fund(price); 
        }

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