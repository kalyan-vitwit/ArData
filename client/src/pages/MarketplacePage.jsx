import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const MarketplacePage = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/courses/all');
                setCourses(res.data);
            } catch (error) {
                console.error("Error fetching courses:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    if (loading) {
        return (
            <div style={styles.pageContainer}>
                <div style={styles.loadingContainer}>
                    <div style={styles.spinner}></div>
                    <h2 style={styles.loadingText}>Loading Marketplace...</h2>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.pageContainer}>
            <div style={styles.contentWrapper}>
                <div style={styles.heroSection}>
                    <div style={styles.heroGradient}></div>
                    <h1 style={styles.heroTitle}>Discover Premium Content</h1>
                    <p style={styles.heroSubtitle}>
                        Explore decentralized courses secured by blockchain technology
                    </p>
                    <div style={styles.statsContainer}>
                        <div style={styles.statItem}>
                            <div style={styles.statNumber}>{courses.length}</div>
                            <div style={styles.statLabel}>Courses Available</div>
                        </div>
                        <div style={styles.statDivider}></div>
                        <div style={styles.statItem}>
                            <div style={styles.statNumber}>100%</div>
                            <div style={styles.statLabel}>Decentralized</div>
                        </div>
                        <div style={styles.statDivider}></div>
                        <div style={styles.statItem}>
                            <div style={styles.statNumber}>∞</div>
                            <div style={styles.statLabel}>Permanent Storage</div>
                        </div>
                    </div>
                </div>

                {courses.length === 0 ? (
                    <div style={styles.emptyState}>
                        <div style={styles.emptyIcon}>📚</div>
                        <h2 style={styles.emptyTitle}>No Courses Available Yet</h2>
                        <p style={styles.emptyText}>Be the first to publish content on the marketplace!</p>
                    </div>
                ) : (
                    <div style={styles.grid}>
                        {courses.map((course) => (
                            <div key={course.contentId} style={styles.card}>
                                <div style={styles.cardGlow}></div>
                                
                                <div style={styles.cardHeader}>
                                    <div style={styles.courseIcon}>📖</div>
                                    <div style={styles.chainBadge}>
                                        <span style={styles.chainDot}>●</span>
                                        <span style={styles.chainText}>On-Chain</span>
                                    </div>
                                </div>

                                <h3 style={styles.cardTitle}>{course.title}</h3>
                                
                                <p style={styles.cardDescription}>
                                    {course.description || "No description provided."}
                                </p>

                                <div style={styles.cardFooter}>
                                    <div style={styles.priceSection}>
                                        <div style={styles.priceLabel}>Price</div>
                                        <div style={styles.priceAmount}>
                                            {(course.price / 1000000000).toFixed(4)} SOL
                                        </div>
                                        <div style={styles.priceLamports}>
                                            {course.price.toLocaleString()} Lamports
                                        </div>
                                    </div>

                                    <button 
                                        style={styles.button}
                                        onClick={() => navigate(`/course/${course.contentId}`)}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                            e.currentTarget.style.boxShadow = '0 15px 40px rgba(124, 58, 237, 0.5)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '0 10px 30px rgba(124, 58, 237, 0.4)';
                                        }}
                                    >
                                        <span style={styles.buttonIcon}>🔍</span>
                                        View Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div style={styles.marketplaceFooter}>
                    <div style={styles.footerContent}>
                        <div style={styles.footerIcon}>⚡</div>
                        <div style={styles.footerTextContainer}>
                            <div style={styles.footerTitle}>Powered by Web3</div>
                            <div style={styles.footerSubtext}>
                                Solana • Lit Protocol • Arweave
                            </div>
                        </div>
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
        fontSize: '20px',
        fontWeight: '500',
    },
    heroSection: {
        position: 'relative',
        background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
        borderRadius: '24px',
        padding: '80px 40px 60px',
        marginBottom: '50px',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(124, 58, 237, 0.4)',
        textAlign: 'center',
    },
    heroGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.15) 0%, transparent 60%)',
        pointerEvents: 'none',
    },
    heroTitle: {
        position: 'relative',
        fontSize: '56px',
        fontWeight: '900',
        color: '#ffffff',
        margin: '0 0 20px 0',
        textShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        letterSpacing: '-1px',
    },
    heroSubtitle: {
        position: 'relative',
        fontSize: '20px',
        color: '#f3e8ff',
        margin: '0 0 50px 0',
        maxWidth: '700px',
        marginLeft: 'auto',
        marginRight: 'auto',
        lineHeight: '1.6',
    },
    statsContainer: {
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '40px',
        flexWrap: 'wrap',
        background: 'rgba(0, 0, 0, 0.2)',
        borderRadius: '16px',
        padding: '30px',
        backdropFilter: 'blur(10px)',
        maxWidth: '800px',
        margin: '0 auto',
    },
    statItem: {
        textAlign: 'center',
    },
    statNumber: {
        fontSize: '36px',
        fontWeight: '800',
        color: '#ffffff',
        marginBottom: '8px',
    },
    statLabel: {
        fontSize: '14px',
        color: '#e9d5ff',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        fontWeight: '600',
    },
    statDivider: {
        width: '2px',
        height: '50px',
        background: 'rgba(255, 255, 255, 0.2)',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '30px',
        marginTop: '20px',
    },
    card: {
        position: 'relative',
        background: 'linear-gradient(135deg, rgba(30, 20, 50, 0.9) 0%, rgba(50, 30, 80, 0.9) 100%)',
        border: '2px solid rgba(168, 85, 247, 0.2)',
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
        background: 'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
    },
    courseIcon: {
        fontSize: '40px',
        background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
        width: '70px',
        height: '70px',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 8px 20px rgba(124, 58, 237, 0.3)',
    },
    chainBadge: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        background: 'rgba(16, 185, 129, 0.2)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        borderRadius: '20px',
    },
    chainDot: {
        color: '#10b981',
        fontSize: '12px',
        animation: 'pulse 2s ease-in-out infinite',
    },
    chainText: {
        color: '#6ee7b7',
        fontSize: '12px',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
    },
    cardTitle: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#f3e8ff',
        margin: '0 0 15px 0',
        lineHeight: '1.3',
    },
    cardDescription: {
        fontSize: '15px',
        color: '#c4b5fd',
        lineHeight: '1.6',
        marginBottom: '25px',
        minHeight: '60px',
    },
    cardFooter: {
        borderTop: '2px solid rgba(168, 85, 247, 0.2)',
        paddingTop: '20px',
    },
    priceSection: {
        background: 'rgba(124, 58, 237, 0.15)',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '20px',
        border: '2px solid rgba(168, 85, 247, 0.2)',
        textAlign: 'center',
    },
    priceLabel: {
        fontSize: '12px',
        color: '#c4b5fd',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        fontWeight: '600',
        marginBottom: '8px',
    },
    priceAmount: {
        fontSize: '32px',
        fontWeight: '800',
        color: '#ffffff',
        marginBottom: '4px',
    },
    priceLamports: {
        fontSize: '13px',
        color: '#a78bfa',
    },
    button: {
        width: '100%',
        padding: '16px',
        background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
        color: '#ffffff',
        border: 'none',
        borderRadius: '12px',
        fontSize: '16px',
        fontWeight: '700',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: '0 10px 30px rgba(124, 58, 237, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
    },
    buttonIcon: {
        fontSize: '18px',
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
        maxWidth: '500px',
        margin: '0 auto',
    },
    marketplaceFooter: {
        marginTop: '60px',
        padding: '40px',
        background: 'rgba(30, 20, 50, 0.6)',
        borderRadius: '20px',
        border: '2px solid rgba(168, 85, 247, 0.2)',
        backdropFilter: 'blur(10px)',
    },
    footerContent: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px',
    },
    footerIcon: {
        fontSize: '48px',
    },
    footerTextContainer: {
        textAlign: 'left',
    },
    footerTitle: {
        fontSize: '20px',
        fontWeight: '700',
        color: '#f3e8ff',
        marginBottom: '5px',
    },
    footerSubtext: {
        fontSize: '14px',
        color: '#a78bfa',
        fontWeight: '500',
    },
};

// Add hover effect for cards via CSS
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
        div[style*="rgba(30, 20, 50, 0.9)"]:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 60px rgba(124, 58, 237, 0.5) !important;
            border-color: rgba(168, 85, 247, 0.4) !important;
        }
    `;
    if (!document.getElementById('marketplace-animations')) {
        styleSheet.id = 'marketplace-animations';
        document.head.appendChild(styleSheet);
    }
}

export default MarketplacePage;