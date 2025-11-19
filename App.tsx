import React from 'react';
import { useUserData, UserDataContext } from './hooks/useUserData';
import AuthPage from './components/AuthPage';
import MainApp from './components/MainApp';
import ModeSelectionPage from './components/ModeSelectionPage';

const App: React.FC = () => {
    const userData = useUserData();
    const { user } = userData;

    // Apply theme to the root element
    React.useEffect(() => {
        if (user.theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [user.theme]);
    
    // Apply language to the root element
     React.useEffect(() => {
        document.documentElement.lang = user.language.substring(0,2).toLowerCase();
    }, [user.language]);

    const renderContent = () => {
        if (!user.isAuthenticated) {
            return <AuthPage />;
        }
        if (user.isAuthenticated && !user.mode) {
            return <ModeSelectionPage />;
        }
        return <MainApp />;
    }

    return (
        <UserDataContext.Provider value={userData}>
            {renderContent()}
        </UserDataContext.Provider>
    );
};

export default App;
