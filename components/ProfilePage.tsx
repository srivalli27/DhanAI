
import React, { useMemo, useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { RememberSection } from './HistoryPage';
import { useUser } from '../hooks/useUserData';
import { Transaction, AppMode } from '../types';
import { PageHeader } from './SharedUI';
import { getSmeLedgerSummary } from '../services/geminiService';
import { MOCK_AUTOPAY_MANDATES } from '../constants';

const COLORS = ['#c9ada7', '#9a8c98', '#4a4e69', '#f2e9e4', '#22223b'];

const AutoPayList: React.FC<{ mandates: typeof MOCK_AUTOPAY_MANDATES, t: (key: string) => string }> = ({ mandates, t }) => (
    <div className="space-y-4">
        {mandates.map(mandate => (
            <div key={mandate.id} className="bg-white dark:bg-dhan-dark p-4 rounded-xl shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="bg-dhan-lightest dark:bg-dhan-darkest p-3 rounded-full">
                        {mandate.logo}
                    </div>
                    <div>
                        <p className="font-semibold text-dhan-darkest dark:text-dhan-lightest">{mandate.vendor}</p>
                        <p className="text-sm text-dhan-mid">₹{mandate.amount.toLocaleString('en-IN')} / {mandate.frequency}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-sm font-semibold text-dhan-darkest dark:text-dhan-lightest">{t('nextPayment')}</p>
                    <p className="text-xs text-dhan-mid">{mandate.nextPaymentDate}</p>
                </div>
            </div>
        ))}
    </div>
);

interface SpendingBarChartProps {
  data: Transaction[];
  t: (key: string) => string;
}

const SpendingBarChart: React.FC<SpendingBarChartProps> = ({ data, t }) => {
  const chartData = useMemo(() => {
    const categoryTotals = data
      .filter(t => t.type === 'debit' && t.category)
      .reduce((acc, curr) => {
        if (curr.category) {
          acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
        }
        return acc;
      }, {} as { [key: string]: number });

    return Object.entries(categoryTotals).map(([name, value]) => ({ name, value }));
  }, [data]);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-white dark:bg-dhan-dark rounded-lg">
        <p className="text-dhan-mid">{t('noSpendingData')}</p>
      </div>
    );
  }

  return (
    <div className="h-80 text-dhan-darkest dark:text-dhan-lightest">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{
            top: 5,
            right: 20,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
          <XAxis type="number" tickFormatter={(value) => `₹${value}`} />
          <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} />
          <Tooltip
            cursor={{ fill: 'rgba(154, 140, 152, 0.2)' }}
            contentStyle={{
              backgroundColor: 'rgba(34, 34, 59, 0.9)',
              borderColor: '#9a8c98',
              borderRadius: '0.5rem',
              color: '#f2e9e4'
            }}
          />
          <Bar dataKey="value" name="Spent" barSize={20}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const SmeLedgerSection: React.FC<{ transactions: Transaction[]; t: (key: string) => string }> = ({ transactions, t }) => {
    const [summary, setSummary] = useState<string>('Generating ledger analysis...');
    
    useEffect(() => {
        const fetchSummary = async () => {
            const result = await getSmeLedgerSummary(transactions);
            setSummary(result);
        };
        fetchSummary();
    }, [transactions]);

    return (
        <div className="bg-dhan-deep-dark p-4 rounded-xl shadow-md text-dhan-lightest">
             <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                 <span className="bg-white/20 p-1 rounded">AI</span> 
                 {t('smeLedger')}
             </h3>
             <div className="text-sm whitespace-pre-wrap leading-relaxed opacity-90">
                 {summary}
             </div>
        </div>
    );
};

const ProfilePage: React.FC = () => {
  const { user, t } = useUser();
  
  return (
    <>
      <PageHeader title={t('profile')} t={t} />
      <div className="p-4 space-y-6">
         <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-dhan-mid flex items-center justify-center text-white font-bold text-3xl">
                {user.userName.charAt(0)}
            </div>
            <div>
                <h1 className="text-2xl font-bold text-dhan-darkest dark:text-dhan-lightest">{user.userName}</h1>
                <p className="text-dhan-mid">{user.phoneNumber}</p>
            </div>
         </div>
         
        {/* Business Mode specific feature */}
        {user.mode === AppMode.BUSINESS && (
            <SmeLedgerSection transactions={user.transactions} t={t} />
        )}

        {/* Personal Mode: AutoPay List */}
        {user.mode === AppMode.PERSONAL && (
            <div className="bg-white dark:bg-dhan-dark rounded-xl shadow-md p-4">
                 <h2 className="text-xl font-bold text-dhan-darkest dark:text-dhan-lightest mb-4">{t('autoPay')}</h2>
                <AutoPayList mandates={MOCK_AUTOPAY_MANDATES} t={t} />
            </div>
        )}

        <div className="bg-white dark:bg-dhan-dark rounded-xl shadow-md p-4">
          <h2 className="text-xl font-bold text-dhan-darkest dark:text-dhan-lightest mb-4">{t('spendingSummary')}</h2>
          <SpendingBarChart data={user.transactions} t={t} />
        </div>

        <div className="bg-white dark:bg-dhan-dark rounded-xl shadow-md p-4">
          <RememberSection />
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
