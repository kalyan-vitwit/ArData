import { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import '@solana/wallet-adapter-react-ui/styles.css';

import { PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider, web3, utils, BN } from '@coral-xyz/anchor';
import idl from '../idl.json';
import { encryptWithLit, getLitClient } from '../services/litProtocol';
import { uploadToArweave } from '../services/irysUpload';

const PublishPage = () => {
    const { connection } = useConnection();
    const wallet = useWallet();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState(0);
    const [fileText, setFileText] = useState("");
    const [fileName, setFileName] = useState("");
    const [status, setStatus] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    // Handle file upload
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setFileName(file.name);
        const reader = new FileReader();

        reader.onload = (event) => {
            setFileText(event.target.result);
            setStatus(`File "${file.name}" loaded successfully!`);
        };

        reader.onerror = () => {
            setStatus("Error reading file");
        };

        reader.readAsText(file);
    };

    // Clear uploaded file
    const clearFile = () => {
        setFileText("");
        setFileName("");
        setStatus("");
        document.getElementById('fileInput').value = '';
    };

    const handlePublish = async () => {
        if (!wallet.publicKey) return alert("Please Connect Wallet first!");
        if (!title.trim()) return alert("Please enter a title!");
        if (!fileText.trim()) return alert("Please add content or upload a file!");
        if (price <= 0) return alert("Please set a valid price!");

        try {
            setIsProcessing(true);
            setStatus("Starting process...");
            const contentId = "id_" + Math.random().toString(36).substring(2, 12);

            // Encrypt with Lit Protocol
            setStatus("Encrypting data with Lit Protocol...");
            const litClient = await getLitClient();
            const hybridBundle = await encryptWithLit(litClient, fileText);

            // Upload to Arweave
            setStatus("Uploading to Arweave...");
            const metadata = {
                title,
                description: description || "Premium Content",
                contentId,
            };

            const arweaveHash = await uploadToArweave(wallet, hybridBundle, metadata);
            console.log("Arweave Hash:", arweaveHash);

            // List on Solana
            setStatus("Listing on Smart Contract...");
            const provider = new AnchorProvider(connection, wallet, {});
            const validIdl = idl.default || idl;
            validIdl.address = "EH7hw6xEUm9seh7Ss3jGERDXh7UeFY4ZA9X1wdLd5hif";
            const program = new Program(validIdl, provider);

            const [listingPda] = PublicKey.findProgramAddressSync(
                [utils.bytes.utf8.encode("listing"), utils.bytes.utf8.encode(contentId)],
                program.programId
            );

            const txSignature = await program.methods
                .listContent(contentId, arweaveHash, title, new BN(price))
                .accounts({
                    seller: wallet.publicKey,
                    listingPda: listingPda,
                    systemProgram: web3.SystemProgram.programId,
                })
                .rpc();

            // Save to Database
            setStatus("Saving to Database...");
            const apiPayload = {
                contentId,
                title,
                description: description || "Premium Content",
                price,
                arweaveId: arweaveHash,
                sellerPublicKey: wallet.publicKey.toString(),
                solanaTxSignature: txSignature,
                createdAt: new Date().toISOString()
            };

            const response = await fetch('http://localhost:5000/api/courses/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(apiPayload)
            });

            if (!response.ok) throw new Error("Failed to save to database");

            setStatus("✅ Success! Content is live on Devnet.");
            
            // Reset form
            setTimeout(() => {
                setTitle("");
                setDescription("");
                setPrice(0);
                setFileText("");
                setFileName("");
                setStatus("");
            }, 3000);

        } catch (error) {
            console.error(error);
            setStatus("❌ Error: " + error.message);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div style={styles.pageContainer}>
            <div style={styles.contentWrapper}>
                {/* Header Section */}
                <div style={styles.header}>
                    <div style={styles.headerGradient}></div>
                    <h1 style={styles.title}>📝 Publisher Dashboard</h1>
                    <p style={styles.subtitle}>
                        Create and publish encrypted content on the blockchain
                    </p>
                </div>

                {wallet.connected ? (
                    <div style={styles.formCard}>
                        <div style={styles.cardGlow}></div>

                        {/* Status Banner */}
                        {status && (
                            <div style={{
                                ...styles.statusBanner,
                                background: status.includes("Error") || status.includes("❌")
                                    ? 'rgba(239, 68, 68, 0.15)'
                                    : status.includes("Success") || status.includes("✅")
                                    ? 'rgba(16, 185, 129, 0.15)'
                                    : 'rgba(124, 58, 237, 0.15)',
                                borderColor: status.includes("Error") || status.includes("❌")
                                    ? 'rgba(239, 68, 68, 0.3)'
                                    : status.includes("Success") || status.includes("✅")
                                    ? 'rgba(16, 185, 129, 0.3)'
                                    : 'rgba(168, 85, 247, 0.3)',
                            }}>
                                <div style={styles.statusIcon}>
                                    {isProcessing ? '⚡' : status.includes("Error") ? '❌' : status.includes("Success") ? '✅' : 'ℹ️'}
                                </div>
                                <span style={styles.statusText}>{status}</span>
                            </div>
                        )}

                        {/* Form Fields */}
                        <div style={styles.formSection}>
                            <label style={styles.label}>
                                <span style={styles.labelIcon}>📌</span>
                                Content Title
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter your course title..."
                                style={styles.input}
                                disabled={isProcessing}
                            />
                        </div>

                        <div style={styles.formSection}>
                            <label style={styles.label}>
                                <span style={styles.labelIcon}>📄</span>
                                Description (Optional)
                            </label>
                            <input
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Brief description of your content..."
                                style={styles.input}
                                disabled={isProcessing}
                            />
                        </div>

                        <div style={styles.formSection}>
                            <label style={styles.label}>
                                <span style={styles.labelIcon}>💰</span>
                                Price (Lamports)
                            </label>
                            <div style={styles.priceInputWrapper}>
                                <input
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(Number(e.target.value))}
                                    placeholder="0"
                                    style={styles.input}
                                    disabled={isProcessing}
                                    min="0"
                                />
                                <div style={styles.solConversion}>
                                    ≈ {(price / 1000000000).toFixed(4)} SOL
                                </div>
                            </div>
                        </div>

                        {/* File Upload Section */}
                        <div style={styles.formSection}>
                            <label style={styles.label}>
                                <span style={styles.labelIcon}>🔒</span>
                                Secret Content
                            </label>
                            
                            <div style={styles.fileUploadContainer}>
                                <input
                                    type="file"
                                    id="fileInput"
                                    onChange={handleFileUpload}
                                    style={styles.fileInput}
                                    accept=".txt,.md,.json,.js,.py,.sol"
                                    disabled={isProcessing}
                                />
                                <label htmlFor="fileInput" style={styles.fileUploadButton}>
                                    <span style={styles.uploadIcon}>📁</span>
                                    {fileName ? `${fileName}` : 'Choose File'}
                                </label>
                                
                                {fileName && (
                                    <button
                                        onClick={clearFile}
                                        style={styles.clearButton}
                                        disabled={isProcessing}
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>

                            <div style={styles.divider}>
                                <span style={styles.dividerText}>OR</span>
                            </div>

                            <textarea
                                value={fileText}
                                onChange={(e) => setFileText(e.target.value)}
                                placeholder="Paste or type your content here..."
                                style={styles.textarea}
                                disabled={isProcessing}
                            />
                            
                            {fileText && (
                                <div style={styles.contentInfo}>
                                    {fileText.length} characters • {fileText.split('\n').length} lines
                                </div>
                            )}
                        </div>

                        {/* Publish Button */}
                        <button
                            onClick={handlePublish}
                            style={{
                                ...styles.publishButton,
                                opacity: isProcessing ? 0.6 : 1,
                                cursor: isProcessing ? 'not-allowed' : 'pointer',
                            }}
                            disabled={isProcessing}
                            onMouseEnter={(e) => {
                                if (!isProcessing) {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 15px 40px rgba(124, 58, 237, 0.6)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 10px 30px rgba(124, 58, 237, 0.4)';
                            }}
                        >
                            <span style={styles.buttonIcon}>
                                {isProcessing ? '⏳' : '🚀'}
                            </span>
                            {isProcessing ? 'Publishing...' : 'Encrypt & Publish'}
                        </button>

                        {/* Info Section */}
                        <div style={styles.infoSection}>
                            <div style={styles.infoItem}>
                                <span style={styles.infoIcon}>🔐</span>
                                <span style={styles.infoText}>Encrypted with Lit Protocol</span>
                            </div>
                            <div style={styles.infoItem}>
                                <span style={styles.infoIcon}>📦</span>
                                <span style={styles.infoText}>Stored on Arweave</span>
                            </div>
                            <div style={styles.infoItem}>
                                <span style={styles.infoIcon}>⛓️</span>
                                <span style={styles.infoText}>Listed on Solana</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div style={styles.connectCard}>
                        <div style={styles.connectIcon}>🔌</div>
                        <h2 style={styles.connectTitle}>Wallet Not Connected</h2>
                        <p style={styles.connectText}>
                            Please connect your wallet to publish content
                        </p>
                        <div style={styles.connectHint}>
                            Click "Select Wallet" in the top right corner
                        </div>
                    </div>
                )}
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
    },
    contentWrapper: {
        maxWidth: '800px',
        margin: '0 auto',
    },
    header: {
        position: 'relative',
        background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
        borderRadius: '20px',
        padding: '50px 40px',
        marginBottom: '30px',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(124, 58, 237, 0.3)',
        textAlign: 'center',
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
        textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
    },
    subtitle: {
        position: 'relative',
        fontSize: '18px',
        color: '#f3e8ff',
        margin: 0,
        lineHeight: '1.6',
    },
    formCard: {
        position: 'relative',
        background: 'linear-gradient(135deg, rgba(30, 20, 50, 0.9) 0%, rgba(50, 30, 80, 0.9) 100%)',
        borderRadius: '24px',
        padding: '40px',
        border: '2px solid rgba(168, 85, 247, 0.2)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
        overflow: 'hidden',
    },
    cardGlow: {
        position: 'absolute',
        top: '-50%',
        right: '-50%',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, transparent 70%)',
        pointerEvents: 'none',
    },
    statusBanner: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '2px solid',
        borderRadius: '12px',
        padding: '16px 24px',
        marginBottom: '30px',
        backdropFilter: 'blur(10px)',
    },
    statusIcon: {
        fontSize: '24px',
        marginRight: '12px',
    },
    statusText: {
        color: '#e9d5ff',
        fontSize: '15px',
        fontWeight: '600',
    },
    formSection: {
        marginBottom: '25px',
    },
    label: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '15px',
        fontWeight: '600',
        color: '#e9d5ff',
        marginBottom: '10px',
    },
    labelIcon: {
        fontSize: '18px',
    },
    input: {
        width: '100%',
        padding: '14px 16px',
        background: 'rgba(0, 0, 0, 0.3)',
        border: '2px solid rgba(168, 85, 247, 0.2)',
        borderRadius: '12px',
        fontSize: '15px',
        color: '#f3e8ff',
        outline: 'none',
        transition: 'all 0.3s ease',
        boxSizing: 'border-box',
    },
    priceInputWrapper: {
        position: 'relative',
    },
    solConversion: {
        position: 'absolute',
        right: '16px',
        top: '50%',
        transform: 'translateY(-50%)',
        fontSize: '13px',
        color: '#a78bfa',
        fontWeight: '600',
        pointerEvents: 'none',
    },
    fileUploadContainer: {
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
        marginBottom: '15px',
    },
    fileInput: {
        display: 'none',
    },
    fileUploadButton: {
        flex: 1,
        padding: '14px 20px',
        background: 'rgba(124, 58, 237, 0.2)',
        border: '2px dashed rgba(168, 85, 247, 0.4)',
        borderRadius: '12px',
        color: '#e9d5ff',
        fontSize: '15px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
    },
    uploadIcon: {
        fontSize: '20px',
    },
    clearButton: {
        padding: '14px 18px',
        background: 'rgba(239, 68, 68, 0.2)',
        border: '2px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '12px',
        color: '#fca5a5',
        fontSize: '16px',
        fontWeight: '700',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
    },
    divider: {
        position: 'relative',
        textAlign: 'center',
        margin: '20px 0',
    },
    dividerText: {
        position: 'relative',
        padding: '0 20px',
        background: 'linear-gradient(135deg, rgba(30, 20, 50, 0.9) 0%, rgba(50, 30, 80, 0.9) 100%)',
        color: '#a78bfa',
        fontSize: '13px',
        fontWeight: '600',
        zIndex: 1,
    },
    textarea: {
        width: '100%',
        minHeight: '200px',
        padding: '14px 16px',
        background: 'rgba(0, 0, 0, 0.3)',
        border: '2px solid rgba(168, 85, 247, 0.2)',
        borderRadius: '12px',
        fontSize: '14px',
        color: '#f3e8ff',
        outline: 'none',
        resize: 'vertical',
        fontFamily: "'Fira Code', 'Courier New', monospace",
        lineHeight: '1.6',
        boxSizing: 'border-box',
    },
    contentInfo: {
        marginTop: '8px',
        fontSize: '13px',
        color: '#a78bfa',
        textAlign: 'right',
    },
    publishButton: {
        width: '100%',
        padding: '18px',
        background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
        color: '#ffffff',
        border: 'none',
        borderRadius: '14px',
        fontSize: '18px',
        fontWeight: '700',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: '0 10px 30px rgba(124, 58, 237, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        marginTop: '30px',
    },
    buttonIcon: {
        fontSize: '22px',
    },
    infoSection: {
        display: 'flex',
        justifyContent: 'space-around',
        flexWrap: 'wrap',
        gap: '15px',
        marginTop: '30px',
        padding: '25px',
        background: 'rgba(124, 58, 237, 0.1)',
        borderRadius: '16px',
        border: '2px solid rgba(168, 85, 247, 0.2)',
    },
    infoItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    infoIcon: {
        fontSize: '18px',
    },
    infoText: {
        fontSize: '13px',
        color: '#c4b5fd',
        fontWeight: '500',
    },
    connectCard: {
        background: 'linear-gradient(135deg, rgba(30, 20, 50, 0.9) 0%, rgba(50, 30, 80, 0.9) 100%)',
        borderRadius: '24px',
        padding: '80px 40px',
        textAlign: 'center',
        border: '2px dashed rgba(168, 85, 247, 0.3)',
        backdropFilter: 'blur(20px)',
    },
    connectIcon: {
        fontSize: '80px',
        marginBottom: '20px',
    },
    connectTitle: {
        fontSize: '32px',
        fontWeight: '700',
        color: '#f3e8ff',
        marginBottom: '15px',
    },
    connectText: {
        fontSize: '18px',
        color: '#c4b5fd',
        marginBottom: '20px',
    },
    connectHint: {
        display: 'inline-block',
        padding: '10px 20px',
        background: 'rgba(124, 58, 237, 0.2)',
        border: '2px solid rgba(168, 85, 247, 0.3)',
        borderRadius: '20px',
        fontSize: '14px',
        color: '#e9d5ff',
        fontWeight: '600',
    },
};

// Add CSS for hover effects and animations
if (typeof document !== 'undefined') {
    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
        input:focus, textarea:focus {
            border-color: rgba(168, 85, 247, 0.5) !important;
            box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.1) !important;
        }
        
        input::placeholder, textarea::placeholder {
            color: rgba(196, 181, 253, 0.5);
        }
        
        label[for="fileInput"]:hover {
            background: rgba(124, 58, 237, 0.3) !important;
            border-color: rgba(168, 85, 247, 0.6) !important;
        }
        
        button:hover:not(:disabled) {
            filter: brightness(1.1);
        }
        
        /* Remove number input arrows */
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
            -webkit-appearance: none;
            margin: 0;
        }
        input[type="number"] {
            -moz-appearance: textfield;
        }
    `;
    if (!document.getElementById('publish-page-styles')) {
        styleSheet.id = 'publish-page-styles';
        document.head.appendChild(styleSheet);
    }
}

export default PublishPage;