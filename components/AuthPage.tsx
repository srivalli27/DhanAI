
import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '../hooks/useUserData';
import { AppMode, AuthStep } from '../types';
import { APP_LOGO_URI, BACKGROUND_IMAGE_URL } from '../constants';

const Captcha: React.FC<{ onRefresh: () => string }> = ({ onRefresh }) => {
    const [captchaText, setCaptchaText] = useState('');

    useEffect(() => {
        setCaptchaText(onRefresh());
    }, [onRefresh]);

    return (
        <div className="flex items-center justify-center p-2 rounded-lg bg-dhan-light dark:bg-dhan-darkest border-2 border-dhan-mid/50 select-none">
            <span className="text-2xl font-bold tracking-widest text-dhan-darkest dark:text-dhan-lightest" style={{ textDecoration: 'line-through', fontStyle: 'italic' }}>
                {captchaText}
            </span>
        </div>
    );
};

const AuthPage: React.FC = () => {
    const { login, t } = useUser();
    const [step, setStep] = useState<AuthStep>(AuthStep.PHONE_INPUT);
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [captchaInput, setCaptchaInput] = useState('');
    const [captchaKey, setCaptchaKey] = useState('');
    const [error, setError] = useState('');

    const generateCaptcha = useCallback(() => {
        const key = Math.random().toString(36).substring(2, 8).toUpperCase();
        setCaptchaKey(key);
        return key;
    }, []);

    const handlePhoneSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (/^\d{10}$/.test(phone)) {
            setError('');
            setStep(AuthStep.OTP_INPUT);
        } else {
            setError(t('invalidPhoneNumber'));
        }
    };

    const handleOtpSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Relaxed OTP check: Accept anything that is not empty
        if (otp.trim().length > 0) {
            setError('');
            setStep(AuthStep.CAPTCHA_INPUT);
        } else {
            setError(t('invalidOtp'));
        }
    };

    const handleCaptchaSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (captchaInput.toUpperCase() === captchaKey) {
            setError('');
            login(phone);
        } else {
            setError(t('invalidCaptcha'));
            setCaptchaInput('');
            generateCaptcha();
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4" style={{ background: BACKGROUND_IMAGE_URL }}>
            <div className="bg-black/30 absolute inset-0"></div>
            <div className="relative z-10 w-full max-w-sm">
                <div className="bg-dhan-lightest/80 dark:bg-dhan-deep-dark/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/20 dark:border-dhan-mid/20">
                    <div className="flex flex-col items-center mb-6">
                        <img src={APP_LOGO_URI} alt="DhanAI Logo" className="h-16 w-16 mb-4" />
                        <h1 className="text-2xl font-bold text-dhan-darkest dark:text-dhan-lightest">{t('signIn')}</h1>
                    </div>
                    
                    {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

                    {step === AuthStep.PHONE_INPUT && (
                        <form onSubmit={handlePhoneSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-dhan-dark dark:text-dhan-lightest mb-2">{t('phoneNumber')}</label>
                                <input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder={t('enterPhoneNumber')} className="w-full bg-white dark:bg-dhan-dark border border-dhan-light dark:border-dhan-mid/50 rounded-lg p-3 focus:ring-2 focus:ring-dhan-mid focus:outline-none text-dhan-darkest dark:text-dhan-lightest" />
                            </div>
                            <button type="submit" className="w-full bg-dhan-dark hover:bg-dhan-darkest text-white font-bold py-3 px-4 rounded-lg transition-colors">{t('sendOtp')}</button>
                        </form>
                    )}

                    {step === AuthStep.OTP_INPUT && (
                        <form onSubmit={handleOtpSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="otp" className="block text-sm font-medium text-dhan-dark dark:text-dhan-lightest mb-2">{t('enterOtp')}</label>
                                <input id="otp" type="text" value={otp} onChange={e => setOtp(e.target.value)} placeholder="Any digits" className="w-full bg-white dark:bg-dhan-dark border border-dhan-light dark:border-dhan-mid/50 rounded-lg p-3 text-center tracking-[0.5em] focus:ring-2 focus:ring-dhan-mid focus:outline-none text-dhan-darkest dark:text-dhan-lightest" />
                            </div>
                            <button type="submit" className="w-full bg-dhan-dark hover:bg-dhan-darkest text-white font-bold py-3 px-4 rounded-lg transition-colors">{t('verifyOtp')}</button>
                        </form>
                    )}

                    {step === AuthStep.CAPTCHA_INPUT && (
                        <form onSubmit={handleCaptchaSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="captcha" className="block text-sm font-medium text-dhan-dark dark:text-dhan-lightest mb-2">{t('captcha')}</label>
                                <Captcha onRefresh={generateCaptcha} />
                                <input id="captcha" type="text" value={captchaInput} onChange={e => setCaptchaInput(e.target.value)} placeholder={t('enterCaptcha')} className="mt-4 w-full bg-white dark:bg-dhan-dark border border-dhan-light dark:border-dhan-mid/50 rounded-lg p-3 focus:ring-2 focus:ring-dhan-mid focus:outline-none text-dhan-darkest dark:text-dhan-lightest" />
                            </div>
                            <button type="submit" className="w-full bg-dhan-dark hover:bg-dhan-darkest text-white font-bold py-3 px-4 rounded-lg transition-colors">{t('verify')}</button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
