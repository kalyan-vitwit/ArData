import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';

const MyCoursesPage = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const wallet = useWallet();
    const navigate = useNavigate();

    useEffect(() => {
        if (!wallet.connected || !wallet.publicKey) {
            setCourses([]);
            return;
        }

        const fetchMyCourses = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`http://localhost:5000/api/users/${wallet.publicKey.toString()}`);
                setCourses(res.data);
            } catch (error) {
                console.error("Error fetching my courses:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMyCourses();
    }, [wallet.connected, wallet.publicKey]);

    if (!wallet.connected) {
        return (
            <div style={styles.pageContainer}>
                <div style={styles.contentWrapper}>
                    <div style={styles.connectCard}>
                        <div style={styles.connectIconLarge}>🔐</div>
                        <h2 style={styles.connectTitle}>Authentication Required</h2>
                        <p style={styles.connectText}>
                            Connect your Solana wallet to access your personal library and view all your purchased courses
                        </p>
                        <div style={styles.securityFeatures}>
                            <div style={styles.securityItem}>
                                <span style={styles.securityIcon}>⛓️</span>
                                <span style={styles.securityText}>Blockchain Verified</span>
                            </div>
                            <div style={styles.securityDivider}></div>
                            <div style={styles.securityItem}>
                                <span style={styles.securityIcon}>🔒</span>
                                <span style={styles.securityText}>Encrypted Storage</span>
                            </div>
                            <div style={styles.securityDivider}></div>
                            <div style={styles.securityItem}>
                                <span style={styles.securityIcon}>∞</span>
                                <span style={styles.securityText}>Lifetime Access</span>
                            </div>
                        </div>
                        <div style={styles.connectHint}>
                            Click "Select Wallet" in the navigation bar above
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div style={styles.pageContainer}>
                <div style={styles.loadingContainer}>
                    <div style={styles.spinner}></div>
                    <h2 style={styles.loadingText}>Loading Your Collection...</h2>
                    <p style={styles.loadingSubtext}>Fetching your owned content from the blockchain</p>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.pageContainer}>
            <div style={styles.contentWrapper}>
                {/* Enhanced Header with Stats */}
                <div style={styles.header}>
                    <div style={styles.headerGradient}></div>
                    <div style={styles.headerContent}>
                        <div style={styles.titleSection}>
                            <div style={styles.titleIcon}>📚</div>
                            <h1 style={styles.title}>My Library</h1>
                        </div>
                        <p style={styles.subtitle}>
                            Your collection of premium content, secured forever on Arweave
                        </p>
                        
                        {/* Stats Bar */}
                        <div style={styles.statsBar}>
                            <div style={styles.statItem}>
                                <div style={styles.statNumber}>{courses.length}</div>
                                <div style={styles.statLabel}>Courses Owned</div>
                            </div>
                            <div style={styles.statDivider}></div>
                            <div style={styles.statItem}>
                                <div style={styles.statNumber}>100%</div>
                                <div style={styles.statLabel}>Encrypted</div>
                            </div>
                            <div style={styles.statDivider}></div>
                            <div style={styles.statItem}>
                                <div style={styles.statNumber}>∞</div>
                                <div style={styles.statLabel}>Permanent Access</div>
                            </div>
                        </div>
                    </div>
                </div>

                {courses.length === 0 ? (
                    <div style={styles.emptyState}>
                        <div style={styles.emptyIcon}>🎯</div>
                        <h2 style={styles.emptyTitle}>Your Library is Empty</h2>
                        <p style={styles.emptyText}>
                            Start building your collection by exploring premium courses on the marketplace
                        </p>
                        <div style={styles.emptyFeatures}>
                            <div style={styles.emptyFeature}>
                                <span style={styles.featureIcon}>🔐</span>
                                <span style={styles.featureText}>End-to-end encryption</span>
                            </div>
                            <div style={styles.emptyFeature}>
                                <span style={styles.featureIcon}>💎</span>
                                <span style={styles.featureText}>True ownership</span>
                            </div>
                            <div style={styles.emptyFeature}>
                                <span style={styles.featureIcon}>🚀</span>
                                <span style={styles.featureText}>Instant access</span>
                            </div>
                        </div>
                        <button 
                            style={styles.browseButton}
                            onClick={() => navigate('/')}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 15px 40px rgba(124, 58, 237, 0.6)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 10px 30px rgba(124, 58, 237, 0.4)';
                            }}
                        >
                            <span style={styles.buttonIconLarge}>🚀</span>
                            Explore Marketplace
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Sort Info Banner */}
                        <div style={styles.sortBanner}>
                            <span style={styles.sortIcon}>📅</span>
                            <span style={styles.sortText}>
                                Showing {courses.length} {courses.length === 1 ? 'course' : 'courses'} • Sorted by purchase date
                            </span>
                        </div>

                        {/* Courses Grid */}
                        <div style={styles.grid}>
                            {courses.map((course, index) => (
                                <div key={course.contentId} style={styles.card}>
                                    <div style={styles.cardGlow}></div>
                                    
                                    {/* Card Number Badge */}
                                    <div style={styles.cardNumber}>#{index + 1}</div>
                                    
                                    <div style={styles.cardHeader}>
                                        <div style={styles.courseIcon}>📖</div>
                                        <div style={styles.ownedBadge}>
                                            <span style={styles.badgeDot}>●</span>
                                            <span style={styles.badgeText}>Owned</span>
                                        </div>
                                    </div>

                                    <h3 style={styles.cardTitle}>{course.title}</h3>
                                    
                                    <p style={styles.cardDescription}>
                                        {course.description 
                                            ? (course.description.length > 100 
                                                ? course.description.substring(0, 100) + "..." 
                                                : course.description)
                                            : "Encrypted premium content awaiting decryption."}
                                    </p>

                                    {/* Access Info */}
                                    <div style={styles.accessInfo}>
                                        <div style={styles.accessItem}>
                                            <span style={styles.accessIcon}>🔓</span>
                                            <span style={styles.accessLabel}>Ready to decrypt</span>
                                        </div>
                                        <div style={styles.accessItem}>
                                            <span style={styles.accessIcon}>📦</span>
                                            <span style={styles.accessLabel}>On Arweave</span>
                                        </div>
                                    </div>

                                    <div style={styles.cardFooter}>
                                        <button 
                                            style={styles.accessButton}
                                            onClick={() => navigate(`/course/${course.contentId}`)}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                                e.currentTarget.style.boxShadow = '0 15px 40px rgba(16, 185, 129, 0.6)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = '0 10px 30px rgba(16, 185, 129, 0.4)';
                                            }}
                                        >
                                            <span style={styles.buttonIcon}>🔐</span>
                                            Access Content
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Bottom Info Footer */}
                        <div style={styles.infoFooter}>
                            <div style={styles.infoContent}>
                                <div style={styles.infoIconLarge}>💡</div>
                                <div style={styles.infoTextContainer}>
                                    <div style={styles.infoTitle}>Permanent Ownership Guaranteed</div>
                                    <div style={styles.infoSubtext}>
                                        Your purchases are cryptographically secured on the Solana blockchain and can never be revoked or taken away
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
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
        maxWidth: '1400px',
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
        fontSize: '24px',
        fontWeight: '600',
        margin: '20px 0 10px 0',
    },
    loadingSubtext: {
        color: '#a78bfa',
        fontSize: '16px',
        fontWeight: '400',
    },
    header: {
        position: 'relative',
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        borderRadius: '24px',
        padding: '60px 40px',
        marginBottom: '40px',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(16, 185, 129, 0.4)',
    },
    headerGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.15) 0%, transparent 60%)',
        pointerEvents: 'none',
    },
    headerContent: {
        position: 'relative',
        textAlign: 'center',
    },
    titleSection: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '15px',
        marginBottom: '15px',
    },
    titleIcon: {
        fontSize: '48px',
    },
    title: {
        fontSize: '48px',
        fontWeight: '900',
        color: '#ffffff',
        margin: 0,
        textShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        letterSpacing: '-0.5px',
    },
    subtitle: {
        fontSize: '18px',
        color: '#d1fae5',
        margin: '0 0 40px 0',
        lineHeight: '1.6',
        maxWidth: '700px',
        marginLeft: 'auto',
        marginRight: 'auto',
    },
    statsBar: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '40px',
        flexWrap: 'wrap',
        background: 'rgba(0, 0, 0, 0.2)',
        borderRadius: '16px',
        padding: '25px',
        backdropFilter: 'blur(10px)',
        maxWidth: '700px',
        margin: '0 auto',
    },
    statItem: {
        textAlign: 'center',
    },
    statNumber: {
        fontSize: '32px',
        fontWeight: '800',
        color: '#ffffff',
        marginBottom: '6px',
    },
    statLabel: {
        fontSize: '13px',
        color: '#d1fae5',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        fontWeight: '600',
    },
    statDivider: {
        width: '2px',
        height: '40px',
        background: 'rgba(255, 255, 255, 0.2)',
    },
    sortBanner: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        padding: '12px 24px',
        background: 'rgba(16, 185, 129, 0.15)',
        border: '2px solid rgba(16, 185, 129, 0.3)',
        borderRadius: '12px',
        marginBottom: '30px',
        backdropFilter: 'blur(10px)',
    },
    sortIcon: {
        fontSize: '18px',
    },
    sortText: {
        color: '#6ee7b7',
        fontSize: '14px',
        fontWeight: '600',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '30px',
        marginBottom: '50px',
    },
    card: {
        position: 'relative',
        background: 'linear-gradient(135deg, rgba(20, 60, 40, 0.9) 0%, rgba(30, 50, 40, 0.9) 100%)',
        border: '2px solid rgba(16, 185, 129, 0.3)',
        padding: '30px',
        borderRadius: '20px',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
        transition: 'all 0.3s ease',
        overflow: 'hidden',
    },
    cardGlow: {
        position: 'absolute',
        top: '-50%',
        right: '-50%',
        width: '200px',
        height: '200px',
        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
    },
    cardNumber: {
        position: 'absolute',
        top: '15px',
        left: '15px',
        padding: '4px 10px',
        background: 'rgba(16, 185, 129, 0.2)',
        border: '2px solid rgba(16, 185, 129, 0.4)',
        borderRadius: '8px',
        fontSize: '12px',
        fontWeight: '700',
        color: '#6ee7b7',
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
    },
    courseIcon: {
        fontSize: '40px',
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        width: '70px',
        height: '70px',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)',
    },
    ownedBadge: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 14px',
        background: 'rgba(16, 185, 129, 0.2)',
        border: '2px solid rgba(16, 185, 129, 0.4)',
        borderRadius: '20px',
    },
    badgeDot: {
        color: '#10b981',
        fontSize: '12px',
        animation: 'pulse 2s ease-in-out infinite',
    },
    badgeText: {
        color: '#6ee7b7',
        fontSize: '13px',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
    },
    cardTitle: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#d1fae5',
        margin: '0 0 15px 0',
        lineHeight: '1.3',
    },
    cardDescription: {
        fontSize: '15px',
        color: '#a7f3d0',
        lineHeight: '1.6',
        marginBottom: '20px',
        minHeight: '60px',
    },
    accessInfo: {
        display: 'flex',
        gap: '10px',
        marginBottom: '20px',
        flexWrap: 'wrap',
    },
    accessItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 12px',
        background: 'rgba(16, 185, 129, 0.1)',
        borderRadius: '8px',
        border: '1px solid rgba(16, 185, 129, 0.2)',
    },
    accessIcon: {
        fontSize: '16px',
    },
    accessLabel: {
        color: '#6ee7b7',
        fontSize: '13px',
        fontWeight: '600',
    },
    cardFooter: {
        borderTop: '2px solid rgba(16, 185, 129, 0.2)',
        paddingTop: '20px',
    },
    accessButton: {
        width: '100%',
        padding: '16px',
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        color: '#ffffff',
        border: 'none',
        borderRadius: '12px',
        fontSize: '16px',
        fontWeight: '700',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: '0 10px 30px rgba(16, 185, 129, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
    },
    buttonIcon: {
        fontSize: '18px',
    },
    buttonIconLarge: {
        fontSize: '22px',
    },
    emptyState: {
        textAlign: 'center',
        padding: '80px 40px',
        background: 'rgba(30, 20, 50, 0.6)',
        borderRadius: '24px',
        border: '2px dashed rgba(168, 85, 247, 0.3)',
        backdropFilter: 'blur(10px)',
    },
    emptyIcon: {
        fontSize: '80px',
        marginBottom: '20px',
    },
    emptyTitle: {
        fontSize: '32px',
        fontWeight: '700',
        color: '#f3e8ff',
        marginBottom: '15px',
    },
    emptyText: {
        fontSize: '18px',
        color: '#c4b5fd',
        marginBottom: '30px',
        lineHeight: '1.6',
        maxWidth: '600px',
        margin: '0 auto 30px auto',
    },
    emptyFeatures: {
        display: 'flex',
        justifyContent: 'center',
        gap: '30px',
        marginBottom: '40px',
        flexWrap: 'wrap',
    },
    emptyFeature: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    featureIcon: {
        fontSize: '20px',
    },
    featureText: {
        color: '#a78bfa',
        fontSize: '14px',
        fontWeight: '600',
    },
    browseButton: {
        background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
        color: '#ffffff',
        border: 'none',
        borderRadius: '12px',
        padding: '16px 40px',
        fontSize: '16px',
        fontWeight: '700',
        cursor: 'pointer',
        boxShadow: '0 10px 30px rgba(124, 58, 237, 0.4)',
        transition: 'all 0.3s ease',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
    },
    connectCard: {
        background: 'linear-gradient(135deg, rgba(30, 20, 50, 0.9) 0%, rgba(50, 30, 80, 0.9) 100%)',
        borderRadius: '24px',
        padding: '80px 40px',
        textAlign: 'center',
        border: '2px dashed rgba(168, 85, 247, 0.3)',
        backdropFilter: 'blur(20px)',
        maxWidth: '700px',
        margin: '100px auto',
    },
    connectIconLarge: {
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
        marginBottom: '40px',
        lineHeight: '1.6',
        maxWidth: '500px',
        margin: '0 auto 40px auto',
    },
    securityFeatures: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '30px',
        flexWrap: 'wrap',
        padding: '25px',
        background: 'rgba(124, 58, 237, 0.1)',
        borderRadius: '16px',
        marginBottom: '30px',
    },
    securityItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    securityIcon: {
        fontSize: '20px',
    },
    securityText: {
        color: '#c4b5fd',
        fontSize: '14px',
        fontWeight: '600',
    },
    securityDivider: {
        width: '2px',
        height: '30px',
        background: 'rgba(168, 85, 247, 0.3)',
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
    infoFooter: {
        padding: '30px 40px',
        background: 'rgba(30, 20, 50, 0.6)',
        borderRadius: '20px',
        border: '2px solid rgba(168, 85, 247, 0.2)',
        backdropFilter: 'blur(10px)',
    },
    infoContent: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px',
        flexWrap: 'wrap',
    },
    infoIconLarge: {
        fontSize: '48px',
    },
    infoTextContainer: {
        textAlign: 'left',
        maxWidth: '600px',
    },
    infoTitle: {
        fontSize: '20px',
        fontWeight: '700',
        color: '#f3e8ff',
        marginBottom: '5px',
    },
    infoSubtext: {
        fontSize: '14px',
        color: '#a78bfa',
        fontWeight: '500',
        lineHeight: '1.6',
    },
};

// Add animations and hover effects
if (typeof document !== 'undefined') {
    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        
        /* Card hover effect */
        div[style*="rgba(20, 60, 40, 0.9)"]:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 60px rgba(16, 185, 129, 0.5) !important;
            border-color: rgba(16, 185, 129, 0.5) !important;
        }
    `;
    if (!document.getElementById('my-courses-animations')) {
        styleSheet.id = 'my-courses-animations';
        document.head.appendChild(styleSheet);
    }
}

export default MyCoursesPage;