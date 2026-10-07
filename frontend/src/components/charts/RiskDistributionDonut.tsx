import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { RiskDistributionItem } from '../../types';

interface Props {
  data: RiskDistributionItem[];
  totalEmployees: number;
}

export const RiskDistributionDonut: React.FC<Props> = ({ data, totalEmployees }) => {
  const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="w-full flex flex-col items-center">
      <div className="h-48 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as RiskDistributionItem;
                  return (
                    <div className="bg-slate-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg border border-slate-700">
                      <p className="font-semibold">{item.tier}</p>
                      <p className="text-slate-300">
                        {item.count} employees ({item.percentage}%)
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Pie
              data={data}
              innerRadius={58}
              outerRadius={80}
              paddingAngle={3}
              dataKey="count"
              stroke="#ffffff"
              strokeWidth={2}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Headcount Summary */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold text-slate-900 tracking-tight">{totalEmployees.toLocaleString()}</span>
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Total Headcount</span>
        </div>
      </div>

      {/* Custom Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
        {data.map((item, idx) => (
          <div key={item.tier} className="flex items-center gap-1.5 text-xs text-slate-600">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: COLORS[idx % COLORS.length] }}
            />
            <span className="font-medium text-slate-800">{item.tier}:</span>
            <span>{item.count} ({item.percentage}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
};
