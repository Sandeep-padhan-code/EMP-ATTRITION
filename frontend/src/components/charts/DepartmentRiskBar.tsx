import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { DepartmentAnalytics } from '../../types';

interface Props {
  data: DepartmentAnalytics[];
  onSelectDepartment?: (dept: string) => void;
}

export const DepartmentRiskBar: React.FC<Props> = ({ data, onSelectDepartment }) => {
  const chartData = data.map((d) => ({
    name: d.department,
    headcount: d.headcount,
    atRisk: d.at_risk_count,
    riskRate: d.risk_rate,
    avgIncome: d.avg_monthly_income,
  }));

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 20, left: 10, bottom: 25 }}
          onClick={(state: any) => {
            if (state && state.activePayload && state.activePayload.length && onSelectDepartment) {
              onSelectDepartment(state.activePayload[0].payload.name);
            }
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: '#64748b', fontSize: 11 }}
            axisLine={{ stroke: '#e2e8f0' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#64748b', fontSize: 11 }}
            axisLine={{ stroke: '#e2e8f0' }}
            tickLine={false}
          />
          <Tooltip
            content={({ active, payload }: any) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                return (
                  <div className="bg-slate-900 text-white text-xs px-3 py-2.5 rounded-lg shadow-xl border border-slate-700">
                    <p className="font-bold text-slate-100 mb-1">{item.name}</p>
                    <p className="text-slate-300">Total Headcount: <span className="text-white font-medium">{item.headcount}</span></p>
                    <p className="text-amber-300">At-Risk Segment: <span className="font-semibold">{item.atRisk}</span> ({item.riskRate}%)</p>
                    <p className="text-slate-400 mt-1">Avg Compensation: ${item.avgIncome.toLocaleString()}/mo</p>
                    <p className="text-[10px] text-brand-400 mt-1 italic">Click bar to filter employee table</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="headcount" name="Total Headcount" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
          <Bar dataKey="atRisk" name="At-Risk" fill="#ef4444" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
