
import React from 'react';
import { useUser } from '../hooks/useUserData';
import { AppMode } from '../types';
import { Icons, APP_LOGO_URI, BACKGROUND_IMAGE_URL } from '../constants';

const ModeSelectionPage: React.FC = () => {
    const { selectMode, t, user } = useUser();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4" style={{ background: BACKGROUND_IMAGE_URL }}>
            <div className="bg-black/30 absolute inset-0"></div>
            <div className="relative z-10 w-full max-w-sm text-center">
                <div className="bg-dhan-lightest/80 dark:bg-dhan-deep-dark/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/20 dark:border-dhan-mid/20">
                    <img src={APP_LOGO_URI} alt="DhanAI Logo" className="h-16 w-16 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-dhan-darkest dark:text-dhan-lightest mb-2">{t('welcomeTo')}</h1>
                    <p className="text-dhan-mid mb-8">{t('modePrompt')}</p>

                    <div className="space-y-4">
                        <button 
                            onClick={() => selectMode(AppMode.PERSONAL)}
                            className="w-full flex items-center justify-center gap-4 text-left p-6 rounded-lg bg-white/50 dark:bg-dhan-dark/50 hover:bg-white/80 dark:hover:bg-dhan-dark/80 transition-all transform hover:scale-105"
                        >
                            <span className="text-dhan-dark dark:text-dhan-lightest">{Icons.user}</span>
                            <div>
                                <h2 className="font-bold text-lg text-dhan-darkest dark:text-dhan-lightest">{t('personal')}</h2>
                                <p className="text-sm text-dhan-mid">Manage your daily expenses.</p>
                            </div>
                        </button>
                         <button 
                            onClick={() => selectMode(AppMode.BUSINESS)}
                            className="w-full flex items-center justify-center gap-4 text-left p-6 rounded-lg bg-white/50 dark:bg-dhan-dark/50 hover:bg-white/80 dark:hover:bg-dhan-dark/80 transition-all transform hover:scale-105"
                        >
                            <span className="text-dhan-dark dark:text-dhan-lightest">{Icons.business}</span>
                            <div>
                                <h2 className="font-bold text-lg text-dhan-darkest dark:text-dhan-lightest">{t('business')}</h2>
                                <p className="text-sm text-dhan-mid">Track your business finances.</p>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModeSelectionPage;
