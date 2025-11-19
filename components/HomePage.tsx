import React from 'react';
import { Icons, APP_LOGO_URI } from '../constants';
import { Transaction } from '../types';

interface HeaderProps {
    onMenuClick: () => void;
}
const Header: React.FC<HeaderProps> = ({ onMenuClick }) => (
    <header className="sticky top-0 z-10 bg-dhan-lightest/80 dark:bg-dhan-deep-dark/80 backdrop-blur-sm p-4 flex justify-between items-center border-b border-dhan-light/50 dark:border-dhan-mid/20">
        <div className="flex items-center gap-2">
            <img src={APP_LOGO_URI} alt="DhanAI Logo" className="h-8 w-8" />
            <span className="text-xl font-bold text-dhan-darkest dark:text-dhan-lightest">DhanAI</span>
        </div>
        <button onClick={onMenuClick} className="text-dhan-darkest dark:text-dhan-lightest">
            {Icons.menu}
        </button>
    </header>
);

interface HomePageProps {
  userName: string;
  recentTransactions: Transaction[];
  balance: number;
  t: (key: string) => string;
  onMenuClick: () => void;
}

const ServiceButton: React.FC<{ icon: React.ReactNode; label: string }> = ({ icon, label }) => (
  <button className="flex flex-col items-center space-y-2 text-center text-dhan-dark dark:text-dhan-lightest hover:text-dhan-darkest dark:hover:text-white transition-colors group">
    <div className="bg-dhan-light/20 dark:bg-dhan-dark/50 rounded-2xl p-3 text-dhan-dark dark:text-dhan-lightest group-hover:bg-dhan-light/40 dark:group-hover:bg-dhan-dark transition-colors">
      {icon}
    </div>
    <span className="text-xs font-medium">{label}</span>
  </button>
);

const HomePage: React.FC<HomePageProps> = ({ userName, recentTransactions, balance, t, onMenuClick }) => {
  return (
    <div className="text-dhan-darkest dark:text-dhan-lightest">
      <Header onMenuClick={onMenuClick} />
      {/* Header section */}
       <div className="p-4 pt-6">
        <div className="flex justify-between items-center">
            <div>
                <p className="text-md text-dhan-mid">{t('welcomeBack')}</p>
                <h1 className="text-2xl font-bold">{userName}</h1>
            </div>
            <div className="w-12 h-12 rounded-full bg-dhan-mid flex items-center justify-center text-white font-bold text-xl">
                {userName.charAt(0)}
            </div>
        </div>
      </div>

      {/* Balance Card */}
      <div className="px-4">
        <div className="bg-gradient-to-br from-dhan-dark to-dhan-darkest text-white p-6 rounded-2xl shadow-lg">
            <p className="text-sm text-dhan-light opacity-80">{t('totalBalance')}</p>
            <p className="text-3xl font-bold mt-1">₹{balance.toLocaleString('en-IN')}</p>
        </div>
      </div>


      {/* Services Grid */}
      <div className="p-4 mt-4">
        <div className="bg-white dark:bg-dhan-dark p-4 rounded-2xl shadow-sm">
            <div className="grid grid-cols-4 gap-4">
            <ServiceButton icon={Icons.bill} label={t('payBills')} />
            <ServiceButton icon={Icons.recharge} label={t('recharge')} />
            <ServiceButton icon={Icons.ticket} label={t('tickets')} />
            <ServiceButton icon={Icons.more} label={t('more')} />
            </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="p-4 mt-2">
        <h2 className="text-lg font-bold mb-3">{t('recentTransactions')}</h2>
        <div className="space-y-3">
          {recentTransactions.slice(0, 3).map((tx) => (
            <div key={tx.id} className="flex items-center justify-between bg-white dark:bg-dhan-dark p-3 rounded-xl shadow-sm">
              <div className="flex items-center gap-4">
                 <div className={`p-3 rounded-full ${tx.type === 'debit' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                   {tx.type === 'debit' ? 
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17l-5-5 5-5m-5 5h12" /></svg>
                     :
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 7l5 5-5 5m5-5H6" /></svg>
                   }
                </div>
                <div>
                  <p className="font-semibold text-sm">{tx.description}</p>
                  <p className="text-xs text-dhan-mid">{tx.date}</p>
                </div>
              </div>
              <p className={`font-bold text-sm ${tx.type === 'debit' ? 'text-red-500' : 'text-green-500'}`}>
                {tx.type === 'debit' ? '-' : '+'}₹{tx.amount.toLocaleString('en-IN')}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;