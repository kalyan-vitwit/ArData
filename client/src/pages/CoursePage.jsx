import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { Program, AnchorProvider, BN } from '@coral-xyz/anchor'; 
import axios from 'axios';

import { getLitClient, decryptArweaveFile } from '../services/litProtocol';
import idl from '../idl.json'; 

const PROGRAM_ID = new PublicKey("EH7hw6xEUm9seh7Ss3jGERDXh7UeFY4ZA9X1wdLd5hif");

const CoursePage = () => {
    const { contentId } = useParams();
    const { connection } = useConnection();
    const wallet = useWallet();

    const [course, setCourse] = useState(null);
    const [hasAccess, setHasAccess] = useState(false);
    const [decryptedContent, setDecryptedContent] = useState(null);
    const [status, setStatus] = useState("");

    useEffect(() => {
        if (!contentId) return;

        const init = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/courses/${contentId}`);
                setCourse(res.data);

                if (wallet.publicKey) {
                    const [receiptPda] = PublicKey.findProgramAddressSync(
                        [
                            Buffer.from("receipt"),
                            wallet.publicKey.toBuffer(),
                            Buffer.from(contentId)
                        ],
                        PROGRAM_ID
                    );
                    
                    const accountInfo = await connection.getAccountInfo(receiptPda);
                    if (accountInfo) setHasAccess(true);
                }
            } catch (err) {
                console.error("Error loading course:", err);
            }
        };
        init();
    }, [contentId, wallet.publicKey, connection]);

    const handleBuy = async () => {
        if (!wallet.publicKey) return alert("Connect Wallet!");
        setStatus("Processing Transaction...");

        try {
            const provider = new AnchorProvider(connection, wallet, {});
            const validIdl = idl.default || idl;
            const program = new Program(validIdl, provider);
            
            const [listingPda] = PublicKey.findProgramAddressSync(
                [Buffer.from("listing"), Buffer.from(contentId)],
                PROGRAM_ID
            );
            const [receiptPda] = PublicKey.findProgramAddressSync(
                [Buffer.from("receipt"), wallet.publicKey.toBuffer(), Buffer.from(contentId)],
                PROGRAM_ID
            );

            const txSignature = await program.methods
                .buyContent(contentId)
                .accounts({
                    buyer: wallet.publicKey,
                    seller: new PublicKey(course.sellerPublicKey),
                    listingPda: listingPda,
                    treasury: new PublicKey("H5DiQKbhnKM2GMtpc953QZJwVCEi5zDawkseH3zGMg86"),
                    receiptPda: receiptPda,
                    systemProgram: SystemProgram.programId,
                })
                .rpc();

            console.log("Transaction Signature:", txSignature);
            setStatus("Transaction confirmed! Saving to database...");

            await axios.post('http://localhost:5000/api/users/purchase', {
                walletAddress: wallet.publicKey.toString(),
                contentId: contentId,
                txSignature: txSignature
            });

            setStatus("Purchase Successful!");
            setHasAccess(true);
        } catch (err) {
            console.error(err);
            setStatus("Purchase Failed: " + err.message);
        }
    };

    const handleDecrypt = async () => {
        try {
            setStatus("Fetching encrypted data from Arweave...");
            const response = await axios.get(`https://gateway.irys.xyz/${course.arweaveId}`);
            const arweaveData = response.data;

            setStatus("Verifying Access with Lit Protocol...");
            const litClient = await getLitClient();
            const result = await decryptArweaveFile(litClient, arweaveData);

            setDecryptedContent(result.content);
            setStatus("Decrypted!");
        } catch (err) {
            console.error(err);
            setStatus("Decryption Failed: " + err.message);
        }
    };

    if (!course) {
        return (
            <div style={styles.pageContainer}>
                <div style={styles.loadingContainer}>
                    <div style={styles.spinner}></div>
                    <h2 style={styles.loadingText}>Loading Course...</h2>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.pageContainer}>
            <div style={styles.contentWrapper}>
                {/* Header Section */}
                <div style={styles.header}>
                    <div style={styles.headerGradient}></div>
                    <h1 style={styles.title}>{course.title}</h1>
                    <p style={styles.description}>{course.description}</p>
                </div>

                {/* Status Banner */}
                {status && (
                    <div style={styles.statusBanner}>
                        <div style={styles.statusIcon}>⚡</div>
                        <span style={styles.statusText}>{status}</span>
                    </div>
                )}

                {/* Main Content Area */}
                {!hasAccess ? (
                    <div style={styles.lockedCard}>
                        <div style={styles.lockIconContainer}>
                            <div style={styles.lockIcon}>🔒</div>
                        </div>
                        <h2 style={styles.lockedTitle}>Premium Content</h2>
                        <p style={styles.lockedSubtitle}>Unlock this course to access exclusive content</p>
                        
                        <div style={styles.priceContainer}>
                            <div style={styles.priceLabel}>Price</div>
                            <div style={styles.priceAmount}>
                                {(course.price / 1000000000).toFixed(4)} SOL
                            </div>
                            <div style={styles.priceLamports}>
                                ({course.price.toLocaleString()} Lamports)
                            </div>
                        </div>

                        <button onClick={handleBuy} style={styles.buyButton}>
                            <span style={styles.buttonIcon}>💎</span>
                            Purchase Course
                        </button>

                        <div style={styles.securityBadge}>
                            <span style={styles.badgeIcon}>🛡️</span>
                            <span style={styles.badgeText}>Secured by Solana Blockchain</span>
                        </div>
                    </div>
                ) : (
                    <div style={styles.unlockedCard}>
                        <div style={styles.successHeader}>
                            <div style={styles.checkIcon}>✓</div>
                            <h2 style={styles.unlockedTitle}>You Own This Course!</h2>
                        </div>
                        
                        {!decryptedContent ? (
                            <div style={styles.decryptSection}>
                                <p style={styles.decryptInfo}>
                                    Your content is encrypted on Arweave. Click below to decrypt and view.
                                </p>
                                <button onClick={handleDecrypt} style={styles.decryptButton}>
                                    <span style={styles.buttonIcon}>🔓</span>
                                    Decrypt & Access Content
                                </button>
                            </div>
                        ) : (
                            <div style={styles.contentSection}>
                                <div style={styles.contentHeader}>
                                    <h3 style={styles.contentTitle}>📚 Course Content</h3>
                                    <div style={styles.decryptedBadge}>Decrypted</div>
                                </div>
                                <div style={styles.contentBox}>
                                    <pre style={styles.contentText}>{decryptedContent}</pre>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Footer Info */}
                <div style={styles.footer}>
                    <div style={styles.footerItem}>
                        <span style={styles.footerIcon}>🔗</span>
                        <span style={styles.footerText}>Powered by Lit Protocol</span>
                    </div>
                    <div style={styles.footerItem}>
                        <span style={styles.footerIcon}>📦</span>
                        <span style={styles.footerText}>Stored on Arweave</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    pageContainer: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 50%, #2d1b4e 100%)',
        padding: '40px 20px',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        overflow: 'auto',
    },
    contentWrapper: {
        maxWidth: '900px',
        width: '100%',
        margin: '0 auto',
    },
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
    },
    spinner: {
        width: '60px',
        height: '60px',
        border: '4px solid rgba(147, 51, 234, 0.2)',
        borderTop: '4px solid #9333ea',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
    },
    loadingText: {
        color: '#e0d0ff',
        marginTop: '20px',
        fontSize: '20px',
        fontWeight: '500',
    },
    header: {
        position: 'relative',
        background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
        borderRadius: '20px',
        padding: '60px 40px',
        marginBottom: '30px',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(124, 58, 237, 0.3)',
    },
    headerGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
        pointerEvents: 'none',
    },
    title: {
        position: 'relative',
        fontSize: '42px',
        fontWeight: '800',
        color: '#ffffff',
        margin: '0 0 15px 0',
        textAlign: 'center',
        textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
    },
    description: {
        position: 'relative',
        fontSize: '18px',
        color: '#f3e8ff',
        margin: 0,
        textAlign: 'center',
        lineHeight: '1.6',
        maxWidth: '700px',
        marginLeft: 'auto',
        marginRight: 'auto',
    },
    statusBanner: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(124, 58, 237, 0.15)',
        border: '2px solid rgba(168, 85, 247, 0.3)',
        borderRadius: '12px',
        padding: '16px 24px',
        marginBottom: '30px',
        backdropFilter: 'blur(10px)',
    },
    statusIcon: {
        fontSize: '24px',
        marginRight: '12px',
        animation: 'pulse 2s ease-in-out infinite',
    },
    statusText: {
        color: '#e9d5ff',
        fontSize: '16px',
        fontWeight: '600',
    },
    lockedCard: {
        background: 'linear-gradient(135deg, rgba(30, 20, 50, 0.8) 0%, rgba(50, 30, 80, 0.8) 100%)',
        borderRadius: '24px',
        padding: '50px 40px',
        textAlign: 'center',
        border: '2px solid rgba(168, 85, 247, 0.2)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
    },
    lockIconContainer: {
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '25px',
    },
    lockIcon: {
        fontSize: '64px',
        background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
        width: '120px',
        height: '120px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 10px 40px rgba(124, 58, 237, 0.4)',
    },
    lockedTitle: {
        fontSize: '32px',
        fontWeight: '700',
        color: '#f3e8ff',
        margin: '0 0 10px 0',
    },
    lockedSubtitle: {
        fontSize: '16px',
        color: '#c4b5fd',
        margin: '0 0 40px 0',
    },
    priceContainer: {
        background: 'rgba(124, 58, 237, 0.15)',
        borderRadius: '16px',
        padding: '30px',
        marginBottom: '35px',
        border: '2px solid rgba(168, 85, 247, 0.3)',
    },
    priceLabel: {
        fontSize: '14px',
        color: '#c4b5fd',
        textTransform: 'uppercase',
        letterSpacing: '1.5px',
        fontWeight: '600',
        marginBottom: '10px',
    },
    priceAmount: {
        fontSize: '48px',
        fontWeight: '800',
        color: '#ffffff',
        marginBottom: '5px',
    },
    priceLamports: {
        fontSize: '14px',
        color: '#a78bfa',
    },
    buyButton: {
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        color: '#ffffff',
        border: 'none',
        borderRadius: '14px',
        padding: '18px 50px',
        fontSize: '18px',
        fontWeight: '700',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '12px',
        boxShadow: '0 10px 30px rgba(16, 185, 129, 0.4)',
        transition: 'all 0.3s ease',
        marginBottom: '25px',
    },
    securityBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 20px',
        background: 'rgba(124, 58, 237, 0.2)',
        borderRadius: '50px',
        border: '1px solid rgba(168, 85, 247, 0.3)',
    },
    badgeIcon: {
        fontSize: '18px',
    },
    badgeText: {
        fontSize: '14px',
        color: '#e9d5ff',
        fontWeight: '500',
    },
    unlockedCard: {
        background: 'linear-gradient(135deg, rgba(30, 50, 40, 0.8) 0%, rgba(20, 60, 40, 0.8) 100%)',
        borderRadius: '24px',
        padding: '40px',
        border: '2px solid rgba(16, 185, 129, 0.3)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
    },
    successHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '15px',
        marginBottom: '30px',
        flexWrap: 'wrap',
    },
    checkIcon: {
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '32px',
        color: '#ffffff',
        fontWeight: 'bold',
        boxShadow: '0 8px 25px rgba(16, 185, 129, 0.4)',
        flexShrink: 0,
    },
    unlockedTitle: {
        fontSize: '28px',
        fontWeight: '700',
        color: '#d1fae5',
        margin: 0,
    },
    decryptSection: {
        textAlign: 'center',
        padding: '30px 0',
    },
    decryptInfo: {
        fontSize: '16px',
        color: '#a7f3d0',
        marginBottom: '25px',
        lineHeight: '1.6',
    },
    decryptButton: {
        background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
        color: '#ffffff',
        border: 'none',
        borderRadius: '14px',
        padding: '18px 45px',
        fontSize: '18px',
        fontWeight: '700',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '12px',
        boxShadow: '0 10px 30px rgba(124, 58, 237, 0.4)',
        transition: 'all 0.3s ease',
    },
    contentSection: {
        marginTop: '20px',
    },
    contentHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '15px',
    },
    contentTitle: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#d1fae5',
        margin: 0,
    },
    decryptedBadge: {
        padding: '8px 16px',
        background: 'rgba(16, 185, 129, 0.2)',
        border: '2px solid rgba(16, 185, 129, 0.4)',
        borderRadius: '20px',
        fontSize: '13px',
        fontWeight: '600',
        color: '#6ee7b7',
        textTransform: 'uppercase',
        letterSpacing: '1px',
    },
    contentBox: {
        background: 'rgba(0, 0, 0, 0.3)',
        borderRadius: '16px',
        padding: '30px',
        border: '2px solid rgba(16, 185, 129, 0.2)',
        boxShadow: 'inset 0 2px 10px rgba(0, 0, 0, 0.3)',
    },
    contentText: {
        fontSize: '15px',
        lineHeight: '1.8',
        color: '#d1fae5',
        margin: 0,
        whiteSpace: 'pre-wrap',
        wordWrap: 'break-word',
        fontFamily: "'Fira Code', 'Courier New', monospace",
    },
    buttonIcon: {
        fontSize: '22px',
    },
    footer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '40px',
        marginTop: '40px',
        padding: '25px',
        flexWrap: 'wrap',
    },
    footerItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    footerIcon: {
        fontSize: '20px',
    },
    footerText: {
        fontSize: '14px',
        color: '#a78bfa',
        fontWeight: '500',
    },
};

// Add animations
if (typeof document !== 'undefined') {
    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.6; }
        }
        button:hover {
            transform: translateY(-2px);
            filter: brightness(1.1);
        }
        button:active {
            transform: translateY(0);
        }
        a:hover {
            background: rgba(124, 58, 237, 0.2) !important;
        }
        
        /* Custom scrollbar for content box */
        *::-webkit-scrollbar {
            width: 10px;
        }
        *::-webkit-scrollbar-track {
            background: rgba(124, 58, 237, 0.1);
            border-radius: 10px;
        }
        *::-webkit-scrollbar-thumb {
            background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
            border-radius: 10px;
        }
        *::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(135deg, #a855f7 0%, #c084fc 100%);
        }
    `;
    if (!document.getElementById('web3-animations')) {
        styleSheet.id = 'web3-animations';
        document.head.appendChild(styleSheet);
    }
}

export default CoursePage;
