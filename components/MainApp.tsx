
import React, { useState } from 'react';
import { HashRouter, Routes, Route, Outlet, useLocation, Navigate } from 'react-router-dom';
import { useUser } from '../hooks/useUserData';
import HomePage from './HomePage';
import HistoryPage from './HistoryPage';
import ProfilePage from './ProfilePage';
import AutoPayPage from './AutoPayPage';
import { BottomNav, Drawer, AiAdvisorModal, SettingsModal, AddTransactionModal } from './SharedUI';
import { AppMode } from '../types';

const MainLayout: React.FC = () => {
    const { user, t } = useUser();
    const location = useLocation();
    const isAdvisorRoute = location.pathname === '/advisor';
    const [isAdvisorModalOpen, setAdvisorModalOpen] = useState(false);

    // Effect to open modal when route is /advisor, and close when navigating away
    React.useEffect(() => {
        if (isAdvisorRoute) {
            setAdvisorModalOpen(true);
        }
    }, [isAdvisorRoute]);

    const handleAdvisorClose = () => {
        setAdvisorModalOpen(false);
        // If the modal is closed, navigate back to home to not stay on the empty advisor route
        if(isAdvisorRoute) {
            window.history.back();
        }
    };
    
    return (
        <>
            <main className="pb-20">
                <Outlet />
            </main>
            <AiAdvisorModal isOpen={isAdvisorModalOpen} onClose={handleAdvisorClose} t={t} mode={user.mode} />
        </>
    );
};

const MainApp: React.FC = () => {
    const { user, balance, t, setTheme, setLanguage, setMode, handleCategorizeTransaction, logout, addTransaction } = useUser();
    const [isDrawerOpen, setDrawerOpen] = useState(false);
    const [isSettingsOpen, setSettingsOpen] = useState(false);
    const [isAddTxModalOpen, setAddTxModalOpen] = useState(false);

    const handleModeChange = (newMode: AppMode) => {
        setMode(newMode);
        setDrawerOpen(false);
    };

    return (
        <HashRouter>
            <div className="relative min-h-screen bg-dhan-lightest dark:bg-dhan-deep-dark text-dhan-darkest dark:text-dhan-lightest">
                <Routes>
                    <Route path="/" element={<MainLayout />}>
                        <Route index element={<HomePage userName={user.userName} recentTransactions={user.transactions} balance={balance} t={t} onMenuClick={() => setDrawerOpen(true)} />} />
                        <Route path="history" element={<HistoryPage transactions={user.transactions} handleCategorize={handleCategorizeTransaction} t={t} />} />
                        <Route path="profile" element={<ProfilePage />} />
                        <Route path="autopay" element={<AutoPayPage />} />
                        {/* Advisor route just triggers the modal, content can be home page */}
                        <Route path="advisor" element={<HomePage userName={user.userName} recentTransactions={user.transactions} balance={balance} t={t} onMenuClick={() => setDrawerOpen(true)} />} />
                        <Route path="*" element={<Navigate to="/" />} />
                    </Route>
                </Routes>
                <BottomNav t={t} mode={user.mode} onAddClick={() => setAddTxModalOpen(true)} />
                
                <Drawer
                    isOpen={isDrawerOpen}
                    onClose={() => setDrawerOpen(false)}
                    currentMode={user.mode}
                    onModeChange={handleModeChange}
                    onSettingsClick={() => setSettingsOpen(true)}
                    onLogout={logout}
                    userName={user.userName}
                    userPhone={user.phoneNumber}
                    t={t}
                />
                
                <SettingsModal
                    isOpen={isSettingsOpen}
                    onClose={() => setSettingsOpen(false)}
                    theme={user.theme}
                    onThemeChange={setTheme}
                    language={user.language}
                    onLanguageChange={setLanguage}
                    t={t}
                />

                <AddTransactionModal
                    isOpen={isAddTxModalOpen}
                    onClose={() => setAddTxModalOpen(false)}
                    onAddTransaction={addTransaction}
                    t={t}
                />
            </div>
        </HashRouter>
    );
};

export default MainApp;
