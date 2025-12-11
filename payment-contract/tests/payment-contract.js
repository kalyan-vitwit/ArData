const anchor = require("@coral-xyz/anchor");
const { SystemProgram } = anchor.web3;
const { assert } = require("chai");

describe("solana-arweave-store", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.SolanaArweaveStore;

  const TREASURY_KEY = new anchor.web3.PublicKey("H5DiQKbhnKM2GMtpc953QZJwVCEi5zDawkseH3zGMg86");
  
  const seller = anchor.web3.Keypair.generate();
  const buyer = anchor.web3.Keypair.generate();
  
  // FIX: Generate a RANDOM ID for every test run.
  // This prevents "Account already in use" errors when re-running tests.
  const randomId = Math.floor(Math.random() * 1000000);
  const contentId = `course_${randomId}`; 
  
  const arweaveHash = "arweave_hash_placeholder_123456789012345678"; 
  const title = "Master Solana Development";
  const price = new anchor.BN(1 * anchor.web3.LAMPORTS_PER_SOL); 

  let listingPda = null;
  let receiptPda = null;

  before(async () => {
    // Airdrop SOL
    const sig1 = await provider.connection.requestAirdrop(seller.publicKey, 2e9);
    await provider.connection.confirmTransaction(sig1);

    const sig2 = await provider.connection.requestAirdrop(buyer.publicKey, 5e9);
    await provider.connection.confirmTransaction(sig2);
    
    console.log(`\n--- TESTING WITH ID: ${contentId} ---\n`);
  });

  it("Lists content successfully", async () => {
    const [pda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("listing"), Buffer.from(contentId)],
      program.programId
    );
    listingPda = pda;

    await program.methods
      .listContent(contentId, arweaveHash, title, price)
      .accounts({
        seller: seller.publicKey,
        listingPda: listingPda,
        systemProgram: SystemProgram.programId,
      })
      .signers([seller])
      .rpc();

    const listingAccount = await program.account.listing.fetch(listingPda);
    assert.equal(listingAccount.authority.toBase58(), seller.publicKey.toBase58());
    console.log("✅ Listing created");
  });

  it("Buys content and distributes fees correctly", async () => {
    const [pda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("receipt"),
        buyer.publicKey.toBuffer(),
        Buffer.from(contentId)
      ],
      program.programId
    );
    receiptPda = pda;

    const sellerBefore = await provider.connection.getBalance(seller.publicKey);
    const treasuryBefore = await provider.connection.getBalance(TREASURY_KEY);

    await program.methods
      .buyContent(contentId)
      .accounts({
        buyer: buyer.publicKey,
        seller: seller.publicKey, // This matches the seller from the previous test
        listingPda: listingPda,
        treasury: TREASURY_KEY, 
        receiptPda: receiptPda,
        systemProgram: SystemProgram.programId,
      })
      .signers([buyer])
      .rpc();

    // Verification
    const receiptAccount = await program.account.receipt.fetch(receiptPda);
    assert.equal(receiptAccount.buyer.toBase58(), buyer.publicKey.toBase58());

    const sellerAfter = await provider.connection.getBalance(seller.publicKey);
    const expectedSellerIncrease = 1e9 * 0.95; 
    assert.equal(sellerAfter, sellerBefore + expectedSellerIncrease, "Seller didn't get 95%");
    
    // Just check for increase for Treasury (simplest for non-fresh states)
    const treasuryAfter = await provider.connection.getBalance(TREASURY_KEY);
    assert.isTrue(treasuryAfter > treasuryBefore, "Treasury should increase");
    
    console.log("✅ Purchase successful & Funds distributed");
  });

  it("Fails if Treasury is wrong", async () => {
    const fakeTreasury = anchor.web3.Keypair.generate();
    
    // We use a NEW random ID for this failing test to keep it clean
    const badTestId = `course_${randomId}_bad`; 

    // 1. List the item first
    const [badListingPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("listing"), Buffer.from(badTestId)],
        program.programId
    );
    
    await program.methods
      .listContent(badTestId, arweaveHash, title, price)
      .accounts({
        seller: seller.publicKey,
        listingPda: badListingPda,
        systemProgram: SystemProgram.programId,
      })
      .signers([seller])
      .rpc();

    // 2. Try to buy with wrong treasury
    const [badReceiptPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("receipt"), buyer.publicKey.toBuffer(), Buffer.from(badTestId)],
        program.programId
    );

    try {
        await program.methods
        .buyContent(badTestId)
        .accounts({
            buyer: buyer.publicKey,
            seller: seller.publicKey,
            listingPda: badListingPda,
            treasury: fakeTreasury.publicKey, // <--- Wrong Key
            receiptPda: badReceiptPda,
            systemProgram: SystemProgram.programId,
        })
        .signers([buyer])
        .rpc();
        
        assert.fail("Should have failed!");
    } catch (e) {
        const msg = e.toString();
        assert.ok(
            msg.includes("ConstraintAddress") || msg.includes("2012") || msg.includes("An address constraint was violated"), 
            "Error should be ConstraintAddress"
        );
        console.log("✅ Correctly rejected fake treasury wallet");
    }
  });
});