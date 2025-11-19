import React from 'react';

export enum AppMode {
  PERSONAL = 'Personal',
  BUSINESS = 'Business',
}

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
}

export enum Language {
  ENGLISH = 'English',
  HINDI = 'Hindi',
  TELUGU = 'Telugu',
  TAMIL = 'Tamil',
}

export type Transaction = {
  id: number;
  description: string;
  amount: number;
  date: string;
  type: 'debit' | 'credit';
  category?: string;
  explanation?: string;
  isUserCategorized?: boolean;
};

export type Message = {
    sender: 'user' | 'ai';
    text: string;
};

export type AutoPayMandate = {
  id: number;
  vendor: string;
  logo: React.ReactNode;
  amount: number;
  frequency: string;
  nextPaymentDate: string;
};

export type EmiDetails = {
  id: number;
  loanName: string;
  bankLogo: React.ReactNode;
  totalAmount: number;
  principal: number;
  interestRate: number;
  tenureMonths: number;
  emiAmount: number;
  nextDueDate: string;
};

export type CategorizationRule = {
  keyword: string;
  category: string;
};

export type UserData = {
  isAuthenticated: boolean;
  phoneNumber: string;
  userName: string;
  mode: AppMode | null;
  theme: Theme;
  language: Language;
  transactions: Transaction[];
  rules: CategorizationRule[];
}

export enum AuthStep {
    PHONE_INPUT,
    OTP_INPUT,
    CAPTCHA_INPUT,
}