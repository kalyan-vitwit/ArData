import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

import '@solana/wallet-adapter-react-ui/styles.css';

import MarketplacePage from './pages/MarketplacePage';
import CoursePage from './pages/CoursePage';
import PublishPage from './pages/PublishPage';
import MyCoursesPage from './pages/MyCoursesPage';

function App() {
    const endpoint = clusterApiUrl('devnet');
    const wallets = [new PhantomWalletAdapter()];

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    <Router>
                        <header style={styles.header}>
                            <nav style={styles.nav}>
                                <Link to="/" style={styles.link}>
                                    <span style={styles.linkIcon}>🏠</span>
                                    Marketplace
                                </Link>
                                <Link to="/publish" style={{...styles.link, color: '#a855f7'}}>
                                    <span style={styles.linkIcon}>➕</span>
                                    Publish Content
                                </Link>
                                <Link to="/my-courses" style={styles.link}>
                                    <span style={styles.linkIcon}>📚</span>
                                    My Courses
                                </Link>
                            </nav>
                            <WalletMultiButton style={styles.walletButton} />
                        </header>

                        <Routes>
                            <Route path="/" element={<MarketplacePage />} />
                            <Route path="/course/:contentId" element={<CoursePage />} />
                            <Route path="/publish" element={<PublishPage />} />
                            <Route path="/my-courses" element={<MyCoursesPage />} />
                        </Routes>
                    </Router>
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
}

const styles = {
    header: {
        padding: '20px 40px',
        background: 'linear-gradient(135deg, #1a0a2e 0%, #2d1b4e 100%)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 20px rgba(124, 58, 237, 0.3)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
    },
    nav: {
        display: 'flex',
        gap: '30px',
        alignItems: 'center'
    },
    link: {
        color: '#e9d5ff',
        textDecoration: 'none',
        fontSize: '1.1rem',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'all 0.3s ease',
        padding: '8px 16px',
        borderRadius: '8px',
    },
    linkIcon: {
        fontSize: '1.3rem'
    },
    walletButton: {
        background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
        borderRadius: '10px',
    }
};

export default App;


