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
                     <div style={styles.emptyState}>
                        <div style={styles.emptyIcon}>🔌</div>
                        <h2 style={styles.emptyTitle}>Wallet Not Connected</h2>
                        <p style={styles.emptyText}>Please connect your wallet to view your purchased courses.</p>
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
                    <h2 style={styles.loadingText}>Loading Your Library...</h2>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.pageContainer}>
            <div style={styles.contentWrapper}>
                <div style={styles.header}>
                    <div style={styles.headerGradient}></div>
                    <h1 style={styles.title}>My Library</h1>
                    <p style={styles.subtitle}>
                        Access your owned content permanently stored on Arweave
                    </p>
                </div>

                {courses.length === 0 ? (
                    <div style={styles.emptyState}>
                        <div style={styles.emptyIcon}>📂</div>
                        <h2 style={styles.emptyTitle}>No Courses Found</h2>
                        <p style={styles.emptyText}>You haven't purchased any content yet.</p>
                        <button 
                            style={styles.browseButton}
                            onClick={() => navigate('/')}
                        >
                            Browse Marketplace
                        </button>
                    </div>
                ) : (
                    <div style={styles.grid}>
                        {courses.map((course) => (
                            <div key={course.contentId} style={styles.card}>
                                <div style={styles.cardGlow}></div>
                                
                                <div style={styles.cardHeader}>
                                    <div style={styles.courseIcon}>🎓</div>
                                    <div style={styles.chainBadge}>
                                        <span style={styles.chainDot}>●</span>
                                        <span style={styles.chainText}>Owned</span>
                                    </div>
                                </div>

                                <h3 style={styles.cardTitle}>{course.title}</h3>
                                
                                <p style={styles.cardDescription}>
                                    {course.description || "No description provided."}
                                </p>

                                <div style={styles.cardFooter}>
                                    <button 
                                        style={styles.button}
                                        onClick={() => navigate(`/course/${course.contentId}`)}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                            e.currentTarget.style.boxShadow = '0 15px 40px rgba(16, 185, 129, 0.5)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '0 10px 30px rgba(16, 185, 129, 0.4)';
                                        }}
                                    >
                                        <span style={styles.buttonIcon}>🔓</span>
                                        Access Content
                                    </button>
                                </div>
                            </div>
                        ))}
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
        maxWidth: '1200px',
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
        marginBottom: '40px',
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
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '30px',
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
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        width: '70px',
        height: '70px',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)',
    },
    chainBadge: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        background: 'rgba(124, 58, 237, 0.2)',
        border: '1px solid rgba(124, 58, 237, 0.3)',
        borderRadius: '20px',
    },
    chainDot: {
        color: '#a855f7',
        fontSize: '12px',
    },
    chainText: {
        color: '#d8b4fe',
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
    button: {
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
    emptyState: {
        textAlign: 'center',
        padding: '80px 40px',
        background: 'rgba(30, 20, 50, 0.6)',
        borderRadius: '24px',
        border: '2px dashed rgba(168, 85, 247, 0.3)',
        backdropFilter: 'blur(10px)',
        marginTop: '40px',
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
    },
};

export default MyCoursesPage;
