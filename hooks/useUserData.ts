
import React, { useState, useEffect, useCallback, useMemo, createContext, useContext } from 'react';
import { AppMode, Theme, Language, Transaction, UserData, CategorizationRule } from '../types';
import { MOCK_TRANSACTIONS_PERSONAL, MOCK_TRANSACTIONS_BUSINESS, translations } from '../constants';
import { categorizeTransaction } from '../services/geminiService';

const DHAN_AI_STORAGE_KEY = 'dhanAiUserData';

const getDefaultUserData = (): UserData => {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return {
        isAuthenticated: false,
        phoneNumber: '',
        userName: 'Aarav',
        mode: null,
        theme: prefersDark ? Theme.DARK : Theme.LIGHT,
        language: Language.ENGLISH,
        transactions: [],
        rules: [],
    };
};

export type UserDataContextType = {
    user: UserData;
    login: (phone: string) => void;
    logout: () => void;
    setTheme: (theme: Theme) => void;
    setLanguage: (language: Language) => void;
    setMode: (mode: AppMode) => void;
    selectMode: (mode: AppMode) => void;
    handleCategorizeTransaction: (id: number) => Promise<void>;
    addTransaction: (details: { description: string; amount: number; type: 'debit' | 'credit' }) => Promise<void>;
    addRuleAndRecategorize: (transactionId: number, newCategory: string, createRule: boolean) => void;
    balance: number;
    t: (key: string) => string;
};

// Create Context
export const UserDataContext = createContext<UserDataContextType | null>(null);

// Export Consumer Hook
export const useUser = () => {
    const context = useContext(UserDataContext);
    if (!context) {
        throw new Error('useUser must be used within a UserDataProvider');
    }
    return context;
};

export const useUserData = (): UserDataContextType => {
    const [user, setUser] = useState<UserData>(() => {
        try {
            const storedData = localStorage.getItem(DHAN_AI_STORAGE_KEY);
            if (storedData) {
                const parsedData = JSON.parse(storedData);
                // Ensure auth state is reset on page load for security
                return { ...parsedData, isAuthenticated: false, mode: null }; 
            }
        } catch (e) {
            console.error("Failed to parse user data from storage", e);
        }
        return getDefaultUserData();
    });

    useEffect(() => {
        try {
            // Persist data but don't persist the authenticated state across reloads
            const dataToStore = { ...user, isAuthenticated: false };
            localStorage.setItem(DHAN_AI_STORAGE_KEY, JSON.stringify(dataToStore));
        } catch (e) {
            console.error("Failed to save user data to storage", e);
        }
    }, [user]);
    
    const login = useCallback((phoneNumber: string) => {
        setUser(prev => ({
            ...prev,
            isAuthenticated: true,
            phoneNumber,
            mode: null, // User will select mode on the next screen
            transactions: [], // Transactions will load after mode selection
        }));
    }, [setUser]);

    const selectMode = useCallback((mode: AppMode) => {
        const initialTransactions = mode === AppMode.PERSONAL ? MOCK_TRANSACTIONS_PERSONAL : MOCK_TRANSACTIONS_BUSINESS;
        setUser(prev => ({
            ...prev,
            mode,
            transactions: initialTransactions,
        }))
    }, [setUser]);

    const logout = useCallback(() => {
        setUser(getDefaultUserData());
        localStorage.removeItem(DHAN_AI_STORAGE_KEY);
    }, [setUser]);

    const setTheme = useCallback((theme: Theme) => {
        setUser(prev => ({ ...prev, theme }));
    }, [setUser]);

    const setLanguage = useCallback((language: Language) => {
        setUser(prev => ({ ...prev, language }));
    }, [setUser]);

    const setMode = useCallback((mode: AppMode) => {
        if (user.mode === mode) return; // Avoid reloading if mode is the same
        const newTransactions = mode === AppMode.PERSONAL ? MOCK_TRANSACTIONS_PERSONAL : MOCK_TRANSACTIONS_BUSINESS;
        setUser(prev => ({ ...prev, mode, transactions: newTransactions }));
    }, [user.mode, setUser]);

    const handleCategorizeTransaction = useCallback(async (id: number) => {
        const tx = user.transactions.find(t => t.id === id);
        if (!tx || !user.mode) return;

        const { category, explanation } = await categorizeTransaction(tx.description, user.mode, user.rules);
        setUser(prev => ({
            ...prev,
            transactions: prev.transactions.map(t =>
                t.id === id ? { ...t, category, explanation } : t
            ),
        }));
    }, [user.transactions, user.mode, user.rules, setUser]);
    
    const addTransaction = useCallback(async ({ description, amount, type }: { description: string; amount: number; type: 'debit' | 'credit' }) => {
        if (!user.mode) return;
        
        // Call AI to categorize the transaction first, passing user rules
        const { category, explanation } = await categorizeTransaction(description, user.mode, user.rules);

        const newTransaction: Transaction = {
            id: Date.now(), // Using timestamp for a unique ID
            description,
            amount,
            type,
            date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
            category,
            explanation,
        };

        setUser(prev => ({
            ...prev,
            transactions: [newTransaction, ...prev.transactions], // Add to the top of the list
        }));

    }, [user.mode, user.rules, setUser]);

    // FinAdapt: Add Rule and Recategorize
    const addRuleAndRecategorize = useCallback((transactionId: number, newCategory: string, createRule: boolean) => {
        setUser(prev => {
            const tx = prev.transactions.find(t => t.id === transactionId);
            if (!tx) return prev;

            let newRules = [...prev.rules];
            if (createRule) {
                // Simple rule: Vendor name (or description prefix) -> Category
                // In a real app, we might want more complex matching
                const keyword = tx.description; 
                // Remove existing rules for this keyword to avoid duplicates
                newRules = newRules.filter(r => r.keyword !== keyword);
                newRules.push({ keyword, category: newCategory });
            }

            return {
                ...prev,
                rules: newRules,
                transactions: prev.transactions.map(t => 
                    t.id === transactionId 
                    ? { ...t, category: newCategory, explanation: `User defined correction: ${createRule ? 'Rule Saved' : 'One-time fix'}.`, isUserCategorized: true } 
                    : t
                )
            };
        });
    }, [setUser]);

    const balance = useMemo(() => {
        return user.transactions.reduce((acc, tx) => {
            return tx.type === 'credit' ? acc + tx.amount : acc - tx.amount;
        }, 0);
    }, [user.transactions]);

    const t = useCallback((key: string): string => {
        const langKey = user.language as keyof typeof translations;
        const keyTyped = key as keyof typeof translations[typeof Language.ENGLISH];
        return translations[langKey]?.[keyTyped] || translations[Language.ENGLISH][keyTyped] || key;
    }, [user.language]);

    return { user, login, logout, setTheme, setLanguage, setMode, selectMode, handleCategorizeTransaction, addTransaction, addRuleAndRecategorize, balance, t };
};
