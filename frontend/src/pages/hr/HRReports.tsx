import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Building,
  RefreshCw,
  Users,
} from 'lucide-react';
import { reportService } from '../../services';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge, RiskBadge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';

export const HRReports: React.FC = () => {
  const [report, setReport] = useState<any | null>(null);
  const [actionPlans, setActionPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [summaryRes, plansRes] = await Promise.all([
        reportService.getSummary(),
        reportService.getActionPlans(),
      ]);
      setReport(summaryRes);
      setActionPlans(plansRes.action_plans || []);
    } catch (err: any) {
      setError(err.message || 'Unable to generate report from backend');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handleExportCsv = () => {
    const token = localStorage.getItem('auth_token');
    const url = `/api/reports/export-csv`;
    
    // Create an invisible anchor tag to trigger real CSV download with token
    fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.blob())
      .then((blob) => {
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `workforce_attrition_report_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch((err) => alert('CSV export failed: ' + err.message));
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64 mb-2" />
        <Card className="p-6"><Skeleton className="h-48 w-full" /></Card>
        <Card className="p-6"><Skeleton className="h-64 w-full" /></Card>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="py-16 text-center space-y-3">
        <p className="text-sm font-semibold text-red-600">{error || 'Failed to generate report'}</p>
        <Button variant="outline" size="sm" onClick={fetchReport}>
          Retry
        </Button>
      </div>
    );
  }

  const { generated_at, generated_by, executive_takeaways, kpis, departments, priority_action_roster, model_metadata } = report;

  return (
    <div className="space-y-6 text-left">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Executive Retention Report</h1>
          <p className="text-xs text-slate-500 mt-1">
            Generated {generated_at} for {generated_by} • Machine Learning Decision Support.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            icon={<Printer className="w-3.5 h-3.5" />}
          >
            Print / PDF
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleExportCsv}
            icon={<Download className="w-3.5 h-3.5" />}
          >
            Export Full Dataset CSV
          </Button>
        </div>
      </div>

      {/* Printable Report Document Card */}
      <Card className="p-8 space-y-8 border-slate-300 shadow-sm print:border-none print:shadow-none">
        {/* Report Document Header */}
        <div className="border-b border-slate-200 pb-6 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-600" />
              <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
                Workforce Intelligence Suite
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
              Annual Workforce Attrition & Retention Intelligence Audit
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              IBM HR Analytics Dataset • Model Accuracy: {model_metadata.accuracy} ({model_metadata.algorithm})
            </p>
          </div>

          <div className="text-right text-xs text-slate-400 font-mono">
            <p>Generated: {generated_at}</p>
            <p className="text-slate-600 font-semibold">{generated_by}</p>
          </div>
        </div>

        {/* Executive Takeaways */}
        <div className="p-5 rounded-2xl bg-brand-50/60 border border-brand-100 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-brand-900 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-brand-600" />
            <span>Executive Findings & Highlights</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-700">
            {executive_takeaways.map((takeaway: string, idx: number) => (
              <div key={idx} className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{takeaway}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Macro Summary Metrics */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
            1. Macro Workforce Risk Parameters
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 text-[11px] block">Total Workforce</span>
              <span className="text-2xl font-bold text-slate-900 block mt-1">
                {kpis.total_employees.toLocaleString()}
              </span>
              <span className="text-slate-400 text-[11px]">Synchronized Records</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 text-[11px] block">At-Risk Population</span>
              <span className="text-2xl font-bold text-amber-600 block mt-1">
                {kpis.at_risk_count} ({kpis.at_risk_rate}%)
              </span>
              <span className="text-slate-400 text-[11px]">{kpis.high_risk_count} Elevated</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 text-[11px] block">Retention Index</span>
              <span className="text-2xl font-bold text-emerald-600 block mt-1">
                {kpis.average_retention_rate}%
              </span>
              <span className="text-slate-400 text-[11px]">Baseline Benchmark</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 text-[11px] block">Overtime Risk Factor</span>
              <span className="text-2xl font-bold text-red-600 block mt-1">
                {kpis.overtime_risk_multiplier}x
              </span>
              <span className="text-slate-400 text-[11px]">Multiplier vs Standard</span>
            </div>
          </div>
        </div>

        {/* Department Breakdown Table */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
            2. Department Attrition Matrix
          </h3>
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[11px]">
                  <th className="py-2.5 px-4">Department</th>
                  <th className="py-2.5 px-3">Headcount</th>
                  <th className="py-2.5 px-3">At-Risk Count</th>
                  <th className="py-2.5 px-3">Attrition Risk %</th>
                  <th className="py-2.5 px-3">Overtime %</th>
                  <th className="py-2.5 px-3">Avg Monthly Comp</th>
                  <th className="py-2.5 px-4 text-right">Avg Satisfaction</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {departments.map((d: any) => (
                  <tr key={d.department} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-semibold text-slate-900">{d.department}</td>
                    <td className="py-3 px-3 font-mono">{d.headcount}</td>
                    <td className="py-3 px-3 font-mono text-amber-600 font-semibold">{d.at_risk_count}</td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">{d.risk_rate}%</td>
                    <td className="py-3 px-3 font-mono text-slate-600">{d.overtime_rate}%</td>
                    <td className="py-3 px-3 font-mono text-slate-700">${d.avg_monthly_income.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right font-mono font-medium">{d.avg_satisfaction} / 4.0</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Priority Action Roster */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
            3. Highest-Priority Retention Action Roster
          </h3>
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[11px]">
                  <th className="py-2.5 px-4">Employee</th>
                  <th className="py-2.5 px-3">Department & Role</th>
                  <th className="py-2.5 px-3">Risk Probability</th>
                  <th className="py-2.5 px-3">Primary Risk Driver</th>
                  <th className="py-2.5 px-3">OverTime</th>
                  <th className="py-2.5 px-4 text-right">Target Action Window</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {priority_action_roster.map((p: any) => (
                  <tr key={p.id}>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {p.name} <span className="text-[11px] text-slate-400 font-mono">#{p.id}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {p.jobRole} ({p.department})
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-red-600">
                      {p.riskProbability}%
                    </td>
                    <td className="py-3 px-3 text-slate-700 font-medium">
                      {p.topDriver}
                    </td>
                    <td className="py-3 px-3">
                      <span className={p.overTime === 'Yes' ? 'text-red-600 font-semibold' : 'text-slate-600'}>
                        {p.overTime}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-red-600 font-medium font-mono">
                      {p.actionTimeframe}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Logged Action Plans */}
        {actionPlans.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
              4. Logged Retention Action Plans
            </h3>
            <div className="space-y-2">
              {actionPlans.map((plan: any) => (
                <div key={plan.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 font-semibold text-slate-800">
                      <span>{plan.employee_name}</span>
                      <span className="text-slate-400 font-normal">#{plan.employee_number}</span>
                      <Badge variant="blue">{plan.action_type}</Badge>
                    </div>
                    <p className="text-slate-600 mt-1">{plan.notes}</p>
                  </div>
                  <div className="text-right shrink-0 font-mono text-[11px] text-slate-400">
                    <Badge variant={plan.status === 'Completed' ? 'emerald' : 'amber'}>
                      {plan.status}
                    </Badge>
                    <p className="mt-1">Target: {plan.target_date || 'Ongoing'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
