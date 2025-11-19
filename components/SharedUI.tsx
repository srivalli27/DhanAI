
import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Icons, APP_LOGO_URI } from '../constants';
import { AppMode, Theme, Language, Message } from '../types';
import { getFinancialAdvice } from '../services/geminiService';
import { GenerateContentResponse } from '@google/genai';

// Add types to the global Window interface
declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

interface TranslationProps {
    t: (key: string) => string;
}

// Page Header Component
interface PageHeaderProps extends TranslationProps {
    title: string;
}
export const PageHeader: React.FC<PageHeaderProps> = ({ title, t }) => {
    const navigate = useNavigate();
    return (
        <header className="sticky top-0 z-10 bg-dhan-lightest/80 dark:bg-dhan-deep-dark/80 backdrop-blur-sm p-4 flex items-center border-b border-dhan-light/50 dark:border-dhan-mid/20">
            <button onClick={() => navigate(-1)} className="text-dhan-darkest dark:text-dhan-lightest mr-4">
                {Icons.backArrow}
            </button>
            <h1 className="text-xl font-bold text-dhan-darkest dark:text-dhan-lightest">{title}</h1>
        </header>
    );
};


// BottomNav Component
interface BottomNavProps extends TranslationProps {
    mode: AppMode | null;
    onAddClick: () => void;
}
export const BottomNav: React.FC<BottomNavProps> = ({ t, mode, onAddClick }) => {
    // EMI is shown in Bottom Nav for both modes
    const navItems = [
        { path: '/', icon: Icons.home, label: t('home') },
        { path: '/history', icon: Icons.history, label: t('history') },
        { id: 'add', icon: <div className="bg-gradient-to-r from-dhan-dark to-dhan-darkest dark:from-dhan-light dark:to-dhan-mid text-white rounded-full p-4 -mt-8 shadow-lg shadow-dhan-dark/30 dark:shadow-dhan-light/20">{Icons.scan}</div>, label: '' },
        { path: '/autopay', icon: Icons.emi, label: t('emi') }, // Renders AutoPayPage which is EMI dashboard
        { path: '/advisor', icon: Icons.advisor, label: t('advisor') },
    ];

    const activeLinkClass = "text-dhan-darkest dark:text-dhan-lightest";
    const inactiveLinkClass = "text-dhan-mid";

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-dhan-darkest/80 backdrop-blur-lg border-t border-dhan-light/50 dark:border-dhan-mid/20 z-50">
            <div className="flex justify-around items-center h-16 max-w-md mx-auto">
                {navItems.map((item) => (
                    item.label === '' ? (
                         <button key={item.id} onClick={onAddClick} className="flex-shrink-0">{item.icon}</button>
                    ) : (
                    <NavLink
                        key={item.label}
                        to={item.path!}
                        className={({ isActive }) => `${isActive ? activeLinkClass : inactiveLinkClass} flex flex-col items-center justify-center w-full hover:text-dhan-darkest dark:hover:text-dhan-lightest transition-colors`}
                    >
                        {item.icon}
                        <span className="text-xs mt-1">{item.label}</span>
                    </NavLink>
                )))}
            </div>
        </nav>
    );
};


// Drawer Component
interface DrawerProps extends TranslationProps {
    isOpen: boolean;
    onClose: () => void;
    currentMode: AppMode | null;
    onModeChange: (mode: AppMode) => void;
    onSettingsClick: () => void;
    onLogout: () => void;
    userName: string;
    userPhone: string;
}
export const Drawer: React.FC<DrawerProps> = ({ isOpen, onClose, currentMode, onModeChange, onSettingsClick, onLogout, userName, userPhone, t }) => {
    return (
        <>
            <div
                className={`fixed inset-0 bg-black/60 z-30 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            ></div>
            <div
                className={`fixed top-0 left-0 h-full w-80 bg-dhan-lightest dark:bg-dhan-deep-dark z-40 shadow-xl transform transition-transform flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="p-4 border-b border-dhan-light/50 dark:border-dhan-mid/20">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-dhan-mid flex items-center justify-center text-white font-bold text-xl">
                            {userName.charAt(0)}
                        </div>
                        <div>
                            <h2 className="font-bold text-dhan-darkest dark:text-dhan-lightest">{userName}</h2>
                            <p className="text-sm text-dhan-mid">{userPhone}</p>
                        </div>
                    </div>
                </div>
                <div className="flex-grow p-4 space-y-2">
                    <p className="text-sm font-semibold text-dhan-mid px-3 pb-2">{t('switchMode')}</p>
                    <button
                        onClick={() => onModeChange(AppMode.PERSONAL)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${currentMode === AppMode.PERSONAL ? 'bg-dhan-light/40 dark:bg-dhan-dark/80 text-dhan-darkest dark:text-dhan-lightest' : 'hover:bg-dhan-light/20 dark:hover:bg-dhan-dark/40'}`}
                    >
                        {Icons.user}
                        <span>{t('personal')}</span>
                    </button>
                    <button
                        onClick={() => onModeChange(AppMode.BUSINESS)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${currentMode === AppMode.BUSINESS ? 'bg-dhan-light/40 dark:bg-dhan-dark/80 text-dhan-darkest dark:text-dhan-lightest' : 'hover:bg-dhan-light/20 dark:hover:bg-dhan-dark/40'}`}
                    >
                        {Icons.business}
                        <span>{t('business')}</span>
                    </button>
                    <div className="border-t border-dhan-light/50 dark:border-dhan-mid/20 my-4"></div>

                     <NavLink
                        to="/profile"
                        onClick={onClose}
                        className={({isActive}) => `w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${isActive ? 'bg-dhan-light/40 dark:bg-dhan-dark/80 text-dhan-darkest dark:text-dhan-lightest' : 'hover:bg-dhan-light/20 dark:hover:bg-dhan-dark/40'}`}
                    >
                        {Icons.profile}
                        <span>{t('profile')}</span>
                    </NavLink>
                    <button
                        onClick={() => { onSettingsClick(); onClose(); }}
                        className="w-full flex items-center gap-3 p-3 rounded-lg text-left hover:bg-dhan-light/20 dark:hover:bg-dhan-dark/40"
                    >
                        {Icons.settings}
                        <span>{t('settings')}</span>
                    </button>
                </div>
                <div className="p-4 mt-auto border-t border-dhan-light/50 dark:border-dhan-mid/20">
                     <button
                        onClick={onLogout}
                        className="w-full flex items-center gap-3 p-3 rounded-lg text-left text-red-500 font-semibold hover:bg-red-500/10 transition-colors"
                    >
                        {Icons.logout}
                        <span>{t('logout')}</span>
                    </button>
                </div>
            </div>
        </>
    );
};


// AI Advisor Modal
interface AiAdvisorModalProps extends TranslationProps {
    isOpen: boolean;
    onClose: () => void;
    mode: AppMode | null;
}
export const AiAdvisorModal: React.FC<AiAdvisorModalProps> = ({ isOpen, onClose, t, mode }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [speakingMessage, setSpeakingMessage] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<any>(null);

    // Text-to-speech function
    const speak = (msg: Message) => {
        if (speechSynthesis.speaking && speakingMessage === msg.text) {
            speechSynthesis.cancel();
            setSpeakingMessage(null);
        } else {
            speechSynthesis.cancel(); // Stop any other speech before starting new
            const utterance = new SpeechSynthesisUtterance(msg.text);
            utterance.onend = () => setSpeakingMessage(null);
            utterance.onerror = () => setSpeakingMessage(null);
            speechSynthesis.speak(utterance);
            setSpeakingMessage(msg.text);
        }
    };

    // Speech-to-text setup
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-IN';

            recognition.onresult = (event: any) => {
                const transcript = event.results[event.results.length - 1][0].transcript.trim();
                setInput(transcript);
            };
            recognition.onend = () => {
                setIsListening(false);
            };
            recognitionRef.current = recognition;
        }
    }, []);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            recognitionRef.current?.start();
        }
        setIsListening(!isListening);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if(isOpen && messages.length === 0) {
            setMessages([{ sender: 'ai', text: t('aiGreeting')}]);
        }
        // When modal is closed, stop any speech
        return () => {
            speechSynthesis.cancel();
            setSpeakingMessage(null);
        }
    }, [isOpen, t, messages.length]);

    useEffect(() => {
      scrollToBottom();
    }, [messages]);


    const handleSend = async () => {
        if (!input.trim() || !mode) return;

        const userMessage: Message = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        const aiMessage: Message = { sender: 'ai', text: '' };
        setMessages(prev => [...prev, aiMessage]);

        try {
            const chatHistory = messages.map(m => ({
                role: m.sender === 'user' ? 'user' : 'model',
                parts: [{ text: m.text }]
            }));
            const stream = await getFinancialAdvice([...chatHistory, {role: 'user', parts: [{text: input}]}], mode);
            
            let fullResponse = '';
            for await (const chunk of stream) {
                const chunkText = (chunk as GenerateContentResponse).text;
                if (chunkText) {
                    fullResponse += chunkText;
                    setMessages(prev => {
                        const newMessages = [...prev];
                        newMessages[newMessages.length - 1].text = fullResponse;
                        return newMessages;
                    });
                }
            }
        } catch (error) {
            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1].text = "Sorry, something went wrong. Please try again.";
                return newMessages;
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 dark:bg-dhan-darkest/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-dhan-lightest/80 dark:bg-dhan-deep-dark/80 backdrop-blur-2xl border border-white/20 dark:border-dhan-mid/20 rounded-2xl shadow-xl w-full max-w-lg h-[80vh] flex flex-col">
                <div className="p-4 border-b border-dhan-light dark:border-dhan-mid/20 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-dhan-darkest dark:text-dhan-lightest">{t('aiAdvisor')}</h3>
                    <button onClick={onClose} className="text-dhan-darkest dark:text-dhan-lightest">{Icons.close}</button>
                </div>
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex gap-2 items-end ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-xl relative ${msg.sender === 'user' ? 'bg-dhan-light text-dhan-darkest rounded-br-none' : 'bg-white dark:bg-dhan-dark text-dhan-darkest dark:text-dhan-lightest rounded-bl-none'}`}>
                                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                                {msg.sender === 'ai' && msg.text && (
                                    <button onClick={() => speak(msg)} className="absolute -bottom-2 -right-2 text-dhan-mid hover:text-dhan-dark dark:hover:text-dhan-lightest p-1 bg-dhan-lightest dark:bg-dhan-darkest rounded-full shadow">
                                        {speakingMessage === msg.text ? Icons.stop : Icons.speaker}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                     {isLoading && messages.length > 0 && messages[messages.length-1].sender === 'ai' && (
                        <div className="flex justify-start">
                            <div className="p-3 rounded-lg bg-white dark:bg-dhan-dark">
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 rounded-full bg-dhan-mid animate-pulse"></div>
                                    <div className="w-2 h-2 rounded-full bg-dhan-mid animate-pulse [animation-delay:0.2s]"></div>
                                    <div className="w-2 h-2 rounded-full bg-dhan-mid animate-pulse [animation-delay:0.4s]"></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                <div className="p-4 border-t border-dhan-light dark:border-dhan-mid/20">
                    <div className="flex items-center gap-2">
                         <button onClick={toggleListening} disabled={!recognitionRef.current} className={`p-2 rounded-lg transition-colors ${isListening ? 'bg-red-500 text-white' : 'bg-dhan-mid text-white'}`}>
                           {Icons.microphone}
                        </button>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                            placeholder={isListening ? t('listening') : t('askAdvicePlaceholder')}
                            className="flex-grow bg-white dark:bg-dhan-dark border border-dhan-light dark:border-dhan-mid/50 rounded-lg p-2 focus:ring-2 focus:ring-dhan-mid focus:outline-none text-dhan-darkest dark:text-dhan-lightest"
                            disabled={isLoading}
                        />
                        <button onClick={handleSend} disabled={isLoading} className="bg-dhan-dark dark:bg-dhan-light text-white dark:text-dhan-darkest p-2 rounded-lg disabled:opacity-50 transition-colors">
                            {Icons.send}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Add Transaction Modal
interface AddTransactionModalProps extends TranslationProps {
    isOpen: boolean;
    onClose: () => void;
    onAddTransaction: (details: { description: string; amount: number; type: 'debit' | 'credit' }) => Promise<void>;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ isOpen, onClose, onAddTransaction, t }) => {
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<'debit' | 'credit'>('debit');
    const [isLoading, setIsLoading] = useState(false);

    const handleClose = () => {
        setAmount('');
        setDescription('');
        setType('debit');
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !description || isNaN(parseFloat(amount))) return;
        setIsLoading(true);
        try {
            await onAddTransaction({ description, amount: parseFloat(amount), type });
            handleClose();
        } catch (error) {
            console.error("Failed to add transaction:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 dark:bg-dhan-darkest/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-dhan-lightest/80 dark:bg-dhan-deep-dark/80 backdrop-blur-2xl border border-white/20 dark:border-dhan-mid/20 rounded-2xl shadow-xl w-full max-w-md">
                <div className="p-4 border-b border-dhan-light dark:border-dhan-mid/20 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-dhan-darkest dark:text-dhan-lightest">{t('addTransaction')}</h3>
                    <button onClick={handleClose} className="text-dhan-darkest dark:text-dhan-lightest">{Icons.close}</button>
                </div>
                <form onSubmit={handleSubmit} className="p-4 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-dhan-dark dark:text-dhan-lightest mb-2">{t('transactionType')}</label>
                        <div className="flex items-center gap-2 rounded-lg bg-dhan-light/30 dark:bg-dhan-dark/50 p-1">
                            <button type="button" onClick={() => setType('debit')} className={`w-full p-2 rounded-md text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${type === 'debit' ? 'bg-white dark:bg-dhan-light shadow text-dhan-darkest' : 'text-dhan-dark dark:text-dhan-lightest'}`}>{t('expense')}</button>
                            <button type="button" onClick={() => setType('credit')} className={`w-full p-2 rounded-md text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${type === 'credit' ? 'bg-dhan-darkest shadow text-dhan-lightest' : 'text-dhan-dark dark:text-dhan-lightest'}`}>{t('income')}</button>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-dhan-dark dark:text-dhan-lightest mb-2">{t('amount')}</label>
                        <input
                            id="amount"
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full bg-white dark:bg-dhan-dark border border-dhan-light dark:border-dhan-mid/50 rounded-lg p-3 focus:ring-2 focus:ring-dhan-mid focus:outline-none text-dhan-darkest dark:text-dhan-lightest"
                            required
                        />
                    </div>
                     <div>
                        <label htmlFor="description" className="block text-sm font-medium text-dhan-dark dark:text-dhan-lightest mb-2">{t('vendorDescription')}</label>
                        <input
                            id="description"
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="e.g., Coffee with friends"
                            className="w-full bg-white dark:bg-dhan-dark border border-dhan-light dark:border-dhan-mid/50 rounded-lg p-3 focus:ring-2 focus:ring-dhan-mid focus:outline-none text-dhan-darkest dark:text-dhan-lightest"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-dhan-dark hover:bg-dhan-darkest text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
                    >
                        {isLoading ? 'Saving...' : t('save')}
                    </button>
                </form>
            </div>
        </div>
    );
};

// Settings Modal
interface SettingsModalProps extends TranslationProps {
    isOpen: boolean;
    onClose: () => void;
    theme: Theme;
    onThemeChange: (theme: Theme) => void;
    language: Language;
    onLanguageChange: (lang: Language) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, theme, onThemeChange, language, onLanguageChange, t }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 dark:bg-dhan-darkest/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
             <div className="bg-dhan-lightest/80 dark:bg-dhan-deep-dark/80 backdrop-blur-2xl border border-white/20 dark:border-dhan-mid/20 rounded-2xl shadow-xl w-full max-w-md">
                <div className="p-4 border-b border-dhan-light dark:border-dhan-mid/20 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-dhan-darkest dark:text-dhan-lightest">{t('settings')}</h3>
                    <button onClick={onClose} className="text-dhan-darkest dark:text-dhan-lightest">{Icons.close}</button>
                </div>
                <div className="p-4 space-y-6">
                    <div>
                        <h4 className="font-semibold text-dhan-darkest dark:text-dhan-lightest mb-3">{t('theme')}</h4>
                        <div className="flex gap-3">
                            <button
                                onClick={() => onThemeChange(Theme.LIGHT)}
                                className={`flex-1 p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${theme === Theme.LIGHT ? 'border-dhan-dark bg-dhan-light/20' : 'border-transparent bg-white dark:bg-dhan-dark'}`}
                            >
                                {Icons.sun}
                                <span className="text-sm">{t('light')}</span>
                            </button>
                             <button
                                onClick={() => onThemeChange(Theme.DARK)}
                                className={`flex-1 p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${theme === Theme.DARK ? 'border-dhan-light bg-dhan-dark/40' : 'border-transparent bg-white dark:bg-dhan-dark'}`}
                            >
                                {Icons.moon}
                                <span className="text-sm">{t('dark')}</span>
                            </button>
                        </div>
                    </div>
                     <div>
                        <h4 className="font-semibold text-dhan-darkest dark:text-dhan-lightest mb-3">{t('language')}</h4>
                        <div className="grid grid-cols-2 gap-3">
                            {Object.values(Language).map((lang) => (
                                <button
                                    key={lang}
                                    onClick={() => onLanguageChange(lang)}
                                    className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${language === lang ? 'border-dhan-dark dark:border-dhan-light bg-dhan-light/20 dark:bg-dhan-dark/40' : 'border-transparent bg-white dark:bg-dhan-dark'}`}
                                >
                                    {lang}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
             </div>
        </div>
    );
};
