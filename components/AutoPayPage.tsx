
import React from 'react';
import { useUser } from '../hooks/useUserData';
import { MOCK_BUSINESS_EMIS, MOCK_PERSONAL_EMIS } from '../constants';
import { AppMode, EmiDetails } from '../types';
import { PageHeader } from './SharedUI';

const EmiList: React.FC<{ emis: EmiDetails[], t: (key: string) => string }> = ({ emis, t }) => (
    <div className="space-y-4 mt-6">
        {emis.map(emi => (
            <div key={emi.id} className="bg-white dark:bg-dhan-dark p-4 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-dhan-lightest dark:bg-dhan-darkest p-2 rounded-full">
                            {emi.bankLogo}
                        </div>
                        <div>
                            <p className="font-bold text-dhan-darkest dark:text-dhan-lightest">{emi.loanName}</p>
                            <p className="text-xs text-dhan-mid">Total: ₹{emi.totalAmount.toLocaleString('en-IN')}</p>
                        </div>
                    </div>
                    <p className="text-lg font-bold text-dhan-darkest dark:text-dhan-lightest">₹{emi.emiAmount.toLocaleString('en-IN')}</p>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center text-sm">
                    <div>
                        <p className="text-xs text-dhan-mid">{t('principal')}</p>
                        <p className="font-semibold text-dhan-dark dark:text-dhan-lightest">₹{emi.principal.toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                        <p className="text-xs text-dhan-mid">{t('interest')}</p>
                        <p className="font-semibold text-dhan-dark dark:text-dhan-lightest">{emi.interestRate}%</p>
                    </div>
                    <div>
                        <p className="text-xs text-dhan-mid">{t('tenure')}</p>
                        <p className="font-semibold text-dhan-dark dark:text-dhan-lightest">{emi.tenureMonths} mo</p>
                    </div>
                </div>
                    <div className="mt-4 pt-3 border-t border-dhan-light/50 dark:border-dhan-mid/20 flex justify-between items-center">
                    <p className="text-sm text-dhan-mid">{t('nextDueDate')}: <span className="font-semibold text-dhan-darkest dark:text-dhan-lightest">{emi.nextDueDate}</span></p>
                    <button className="text-xs bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-3 rounded-full transition-colors">
                        Pay Now
                    </button>
                </div>
            </div>
        ))}
    </div>
);

const AutoPayPage: React.FC = () => {
  const { t, user } = useUser();
  const isBusiness = user.mode === AppMode.BUSINESS;
  // Ensure the page title reflects EMI, not AutoPay
  const pageTitle = t('emi');

  return (
    <>
      <PageHeader title={pageTitle} t={t} />
      <div className="p-4 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-dhan-darkest dark:text-dhan-lightest">{t('emiDashboard')}</h1>
          <button className="text-sm bg-dhan-dark hover:bg-dhan-darkest dark:bg-dhan-light dark:hover:bg-dhan-lightest text-white dark:text-dhan-darkest font-bold py-2 px-4 rounded-lg transition-colors">
            {t('addNew')}
          </button>
        </div>

        <EmiList emis={isBusiness ? MOCK_BUSINESS_EMIS : MOCK_PERSONAL_EMIS} t={t} />
      </div>
    </>
  );
};

export default AutoPayPage;
