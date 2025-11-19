
import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Transaction, AppMode } from '../types';
import { answerTransactionQuestion } from '../services/geminiService';
import { PageHeader } from './SharedUI';
import { useUser } from '../hooks/useUserData';
import { Icons, getCategoriesForMode } from '../constants';

const COLORS = ['#c9ada7', '#9a8c98', '#4a4e69', '#f2e9e4', '#22223b'];

interface SpendingChartProps {
  data: Transaction[];
  t: (key: string) => string;
}

export const SpendingChart: React.FC<SpendingChartProps> = ({ data, t }) => {
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
    <div className="h-64 text-dhan-darkest dark:text-dhan-lightest">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(34, 34, 59, 0.9)', /* dhan-darkest */
              borderColor: '#9a8c98', /* dhan-mid */
              borderRadius: '0.5rem',
              color: '#f2e9e4' /* dhan-lightest */
            }}
          />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};


export const RememberSection: React.FC = () => {
    const { user, t } = useUser();
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleAskQuestion = async () => {
        if (!question.trim() || !user.mode) return;
        setIsLoading(true);
        setAnswer('');
        try {
            const result = await answerTransactionQuestion(question, user.transactions, user.mode);
            setAnswer(result);
        } catch (error) {
            setAnswer('Sorry, I had trouble finding an answer.');
        } finally {
            setIsLoading(false);
            setQuestion('');
        }
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-dhan-darkest dark:text-dhan-lightest">{t('remember')}</h3>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder={t('rememberPlaceholder')}
                    className="flex-grow bg-dhan-lightest dark:bg-dhan-dark border border-dhan-light dark:border-dhan-mid rounded-lg p-2 text-dhan-darkest dark:text-dhan-lightest placeholder-dhan-mid focus:ring-2 focus:ring-dhan-light focus:outline-none"
                />
                <button
                    onClick={handleAskQuestion}
                    disabled={isLoading}
                    className="bg-dhan-dark hover:bg-dhan-darkest dark:bg-dhan-light dark:hover:bg-dhan-lightest text-white dark:text-dhan-darkest font-bold py-2 px-4 rounded-lg disabled:opacity-50 transition-colors"
                >
                    {isLoading ? '...' : t('ask')}
                </button>
            </div>
            {answer && (
                <div className="bg-white dark:bg-dhan-dark p-4 rounded-lg border border-dhan-light dark:border-dhan-mid">
                    <p className="text-dhan-darkest dark:text-dhan-lightest whitespace-pre-wrap">{answer}</p>
                </div>
            )}
        </div>
    )
}

interface HistoryPageProps {
  transactions: Transaction[];
  handleCategorize: (id: number) => void;
  t: (key: string) => string;
}

const HistoryPage: React.FC<HistoryPageProps> = ({ transactions, handleCategorize, t }) => {
  const { addRuleAndRecategorize, user } = useUser();
  const [editingTx, setEditingTx] = useState<number | null>(null);
  const [newCategory, setNewCategory] = useState('');
  const [isRule, setIsRule] = useState(false);

  const categories = user.mode ? getCategoriesForMode(user.mode) : [];

  const startEditing = (tx: Transaction) => {
    setEditingTx(tx.id);
    setNewCategory(tx.category || categories[0]);
    setIsRule(false);
  };

  const saveCorrection = () => {
    if (editingTx) {
      addRuleAndRecategorize(editingTx, newCategory, isRule);
      setEditingTx(null);
    }
  };

  return (
    <>
      <PageHeader title={t('transactionHistory')} t={t} />
      <div className="p-4 space-y-6">
        <div className="bg-white dark:bg-dhan-dark rounded-xl shadow-md p-4">
          <h2 className="text-xl font-bold text-dhan-darkest dark:text-dhan-lightest mb-4">{t('spendingSummary')}</h2>
          <SpendingChart data={transactions} t={t} />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-dhan-darkest dark:text-dhan-lightest">{t('transactionHistory')}</h2>
          {transactions.map(tx => (
            <div key={tx.id} className="bg-white dark:bg-dhan-dark p-4 rounded-lg shadow-sm">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-dhan-darkest dark:text-dhan-lightest">{tx.description}</p>
                  <p className="text-sm text-dhan-mid">{tx.date}</p>
                </div>
                <p className={`font-semibold ${tx.type === 'debit' ? 'text-red-500' : 'text-green-500'}`}>
                  {tx.type === 'debit' ? '-' : '+'}₹{tx.amount.toLocaleString('en-IN')}
                </p>
              </div>
              
               {editingTx === tx.id ? (
                 <div className="mt-3 p-3 bg-dhan-lightest dark:bg-dhan-deep-dark rounded-lg border border-dhan-mid">
                   <label className="block text-xs font-bold text-dhan-dark mb-1">{t('correctCategory')}</label>
                   <select 
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full p-2 rounded mb-2 bg-white dark:bg-dhan-dark dark:text-dhan-lightest"
                   >
                     {categories.map(c => <option key={c} value={c}>{c}</option>)}
                   </select>
                   
                   <div className="flex items-center gap-2 mb-3">
                     <input 
                        type="checkbox" 
                        id={`rule-${tx.id}`} 
                        checked={isRule} 
                        onChange={(e) => setIsRule(e.target.checked)}
                        className="rounded"
                     />
                     <label htmlFor={`rule-${tx.id}`} className="text-sm text-dhan-dark dark:text-dhan-lightest">
                        {t('alwaysCategorize')} <strong>{tx.description}</strong> {t('as')} <strong>{newCategory}</strong>
                     </label>
                   </div>
                   
                   <div className="flex gap-2">
                     <button onClick={saveCorrection} className="text-xs bg-dhan-dark text-white px-3 py-1 rounded">{t('submitCorrection')}</button>
                     <button onClick={() => setEditingTx(null)} className="text-xs text-dhan-mid px-3 py-1">{t('close')}</button>
                   </div>
                 </div>
               ) : tx.category ? (
                <div className="mt-2 bg-dhan-lightest dark:bg-dhan-darkest p-2 rounded-md">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-dhan-dark/80 dark:text-dhan-lightest/80"><span className="font-semibold">{t('category')}:</span> {tx.category}</p>
                      {tx.explanation && <p className="text-xs text-dhan-mid italic mt-1">"{tx.explanation}"</p>}
                    </div>
                    <div className="flex gap-2 ml-2">
                         {/* FinAdapt Feedback */}
                         <button 
                           onClick={() => {/* Liked logic could go here, maybe reinforcing AI */}} 
                           className="text-green-600 hover:bg-green-100 p-1 rounded transition-colors"
                           title="Correct"
                         >
                           {Icons.thumbsUp}
                         </button>
                         <button 
                           onClick={() => startEditing(tx)} 
                           className="text-red-500 hover:bg-red-100 p-1 rounded transition-colors"
                           title="Incorrect"
                         >
                           {Icons.thumbsDown}
                         </button>
                    </div>
                  </div>
                </div>
              ) : (
                 <div className="mt-2">
                  <button
                    onClick={() => handleCategorize(tx.id)}
                    className="text-xs bg-dhan-mid hover:bg-dhan-dark text-white font-bold py-1 px-3 rounded-full transition-colors"
                  >
                    {t('categorize')}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default HistoryPage;
