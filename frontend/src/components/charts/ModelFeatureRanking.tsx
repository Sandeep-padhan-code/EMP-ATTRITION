import React from 'react';
import { ModelFactor } from '../../types';

interface Props {
  factors: ModelFactor[];
}

export const ModelFeatureRanking: React.FC<Props> = ({ factors }) => {
  const topFactors = factors.slice(0, 7);
  const maxVal = Math.max(...topFactors.map((f) => f.importance), 10);

  // Friendly human readable feature mapping
  const featureNames: Record<string, { label: string; desc: string }> = {
    MonthlyIncome: { label: 'Monthly Compensation', desc: 'Base earnings relative to peer band' },
    Age: { label: 'Employee Age Cohort', desc: 'Demographic career progression stage' },
    TotalWorkingYears: { label: 'Total Career Tenure', desc: 'Cumulative professional experience' },
    OverTime: { label: 'Overtime Workload Status', desc: 'Active frequent overtime commitments' },
    DailyRate: { label: 'Daily Compensation Rate', desc: 'Contractual rate structure' },
    MonthlyRate: { label: 'Monthly Billing Rate', desc: 'Operational billing index' },
    DistanceFromHome: { label: 'Commute Distance', desc: 'Miles between residence and office' },
    YearsAtCompany: { label: 'Tenure at Company', desc: 'Consecutive years in organization' },
    HourlyRate: { label: 'Hourly Compensation Rate', desc: 'Standardized hourly rate' },
    YearsWithCurrManager: { label: 'Manager Relationship Tenure', desc: 'Duration reporting to manager' },
    PercentSalaryHike: { label: 'Recent Salary Increase %', desc: 'Annual compensation growth movement' },
    NumCompaniesWorked: { label: 'Prior Employer Count', desc: 'Historical career mobility index' },
  };

  return (
    <div className="space-y-3.5">
      {topFactors.map((item, idx) => {
        const info = featureNames[item.feature] || {
          label: item.feature,
          desc: 'Model input signal',
        };
        const percentage = ((item.importance / maxVal) * 100).toFixed(0);

        return (
          <div key={item.feature} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-600 font-mono text-[10px] flex items-center justify-center font-semibold">
                  {idx + 1}
                </span>
                <span className="font-medium text-slate-800">{info.label}</span>
              </div>
              <span className="font-mono font-semibold text-brand-600 text-xs">
                {item.importance.toFixed(1)}% weight
              </span>
            </div>
            
            {/* Visual Bar */}
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-brand-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500">{info.desc}</p>
          </div>
        );
      })}
    </div>
  );
};
