import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  AlertTriangle,
  Flame,
  ShieldCheck,
  TrendingDown,
  Clock,
  ArrowRight,
  RefreshCw,
  MessageSquare,
  Sparkles,
  DollarSign,
} from 'lucide-react';
import { analyticsService, messageService } from '../../services';
import { WorkforceAnalyticsResponse, PriorityQueueEmployee } from '../../types';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge, RiskBadge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { RiskDistributionDonut } from '../../components/charts/RiskDistributionDonut';
import { DepartmentRiskBar } from '../../components/charts/DepartmentRiskBar';
import { ModelFeatureRanking } from '../../components/charts/ModelFeatureRanking';
import { Modal } from '../../components/ui/Modal';

export const HROverview: React.FC = () => {
  const [data, setData] = useState<WorkforceAnalyticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Quick Outreach Modal State
  const [selectedEmp, setSelectedEmp] = useState<PriorityQueueEmployee | null>(null);
  const [messageContent, setMessageContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  const navigate = useNavigate();

  const fetchAnalytics = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await analyticsService.getOverview();
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Unable to load workforce analytics from backend');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleOpenOutreach = (emp: PriorityQueueEmployee) => {
    setSelectedEmp(emp);
    setMessageContent(
      `Hi ${emp.name.split(' ')[0]}, I wanted to check in regarding your current project pace and ensure you have the support you need. Would you have 15 minutes this week for a quick 1-on-1 sync?`
    );
    setSendSuccess(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp || !messageContent.trim()) return;

    setIsSending(true);
    try {
      await messageService.sendMessage({
        recipient_employee_number: selectedEmp.id,
        content: messageContent.trim(),
        category: 'Workload Check-in',
        title: `Retention Check-in with ${selectedEmp.name}`,
      });
      setSendSuccess(true);
      setTimeout(() => {
        setSelectedEmp(null);
        setSendSuccess(false);
      }, 1200);
    } catch (err: any) {
      alert(err.message || 'Failed to send outreach');
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-9 w-28" />
        </div>

        {/* KPI Skeletons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-5">
              <Skeleton className="h-4 w-28 mb-3" />
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-3 w-36" />
            </Card>
          ))}
        </div>

        {/* Charts skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 p-5"><Skeleton className="h-64 w-full" /></Card>
          <Card className="lg:col-span-2 p-5"><Skeleton className="h-64 w-full" /></Card>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="py-16 text-center">
        <div className="max-w-md mx-auto p-8 rounded-2xl bg-white border border-red-200 shadow-sm space-y-4">
          <AlertTriangle className="w-10 h-10 text-red-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">Workforce Analytics Unavailable</h3>
          <p className="text-xs text-slate-500">{error}</p>
          <Button variant="primary" size="sm" onClick={fetchAnalytics} icon={<RefreshCw className="w-4 h-4" />}>
            Retry Request
          </Button>
        </div>
      </div>
    );
  }

  const { workforce_kpis, risk_distribution, departments, top_model_factors, priority_action_queue } = data;

  return (
    <div className="space-y-6 text-left">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Workforce Overview</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time attrition intelligence across {workforce_kpis.total_employees.toLocaleString()} employees calibrated by Random Forest ML.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAnalytics}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh Data
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/hr/reports')}
            icon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Generate Report
          </Button>
        </div>
      </div>

      {/* Restrained KPI Area */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Employees */}
        <Card className="p-5 border-l-4 border-l-brand-600">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Total Workforce</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {workforce_kpis.total_employees.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Across {departments.length} corporate departments
          </p>
        </Card>

        {/* Metric 2: At-Risk Count */}
        <Card className="p-5 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>At-Risk Population</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {workforce_kpis.at_risk_count}{' '}
            <span className="text-xs font-semibold text-amber-600">
              ({workforce_kpis.at_risk_rate}%)
            </span>
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            {workforce_kpis.medium_risk_count} Medium • {workforce_kpis.high_risk_count} Elevated
          </p>
        </Card>

        {/* Metric 3: Overtime Pressure */}
        <Card className="p-5 border-l-4 border-l-red-500">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Overtime Multiplier</span>
            <Flame className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {workforce_kpis.overtime_risk_multiplier}x
          </p>
          <p className="text-[11px] text-red-600 font-medium mt-1">
            {workforce_kpis.overtime_workforce_pct}% of workforce logs overtime
          </p>
        </Card>

        {/* Metric 4: Average Retention Index */}
        <Card className="p-5 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Retention Stability</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {workforce_kpis.average_retention_rate}%
          </p>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">
            Median comp ${workforce_kpis.average_monthly_income.toLocaleString()}/mo
          </p>
        </Card>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Risk Distribution Donut */}
        <div className="lg:col-span-5">
          <Card className="h-full flex flex-col justify-between">
            <CardHeader
              title="Workforce Risk Distribution"
              subtitle="Calibrated statistical probability segmentation"
            />
            <RiskDistributionDonut
              data={risk_distribution}
              totalEmployees={workforce_kpis.total_employees}
            />
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Decision Support Model</span>
              <span className="font-mono text-emerald-600 font-medium">88.1% Validation Accuracy</span>
            </div>
          </Card>
        </div>

        {/* Department Comparison Bar */}
        <div className="lg:col-span-7">
          <Card className="h-full flex flex-col justify-between">
            <CardHeader
              title="Department Risk Concentrations"
              subtitle="Total headcount vs. elevated attrition risk cohort"
              action={
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/hr/intelligence')}
                  className="text-xs text-brand-600"
                >
                  View Details
                </Button>
              }
            />
            <DepartmentRiskBar
              data={departments}
              onSelectDepartment={(dept) => navigate(`/hr/employees?dept=${encodeURIComponent(dept)}`)}
            />
            <div className="mt-2 text-[11px] text-slate-400">
              💡 Tip: Click any department bar to filter the employee directory.
            </div>
          </Card>
        </div>
      </div>

      {/* Priority Retention Action Queue */}
      <Card>
        <CardHeader
          title="Priority Attention Queue"
          subtitle="Employees exhibiting highest cumulative risk signals needing proactive outreach"
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/hr/employees?risk=High')}
              icon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              View All High Risk ({workforce_kpis.high_risk_count})
            </Button>
          }
        />

        <div className="overflow-x-auto -mx-5 md:-mx-6">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-y border-slate-200 bg-slate-50/75 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-6">Employee</th>
                <th className="py-3 px-4">Role & Dept</th>
                <th className="py-3 px-4">Predicted Risk</th>
                <th className="py-3 px-4">Primary Driver</th>
                <th className="py-3 px-4">Satisfaction</th>
                <th className="py-3 px-4">Action Window</th>
                <th className="py-3 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {priority_action_queue.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="py-3.5 px-6 font-medium text-slate-900">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs shrink-0">
                        {emp.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-900 block group-hover:text-brand-600">
                          {emp.name}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">#{emp.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    <p className="font-medium text-slate-800">{emp.jobRole}</p>
                    <p className="text-[11px] text-slate-400">{emp.department}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <RiskBadge tier={emp.riskTier} probability={emp.riskProbability} />
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px]">
                      {emp.topDriver}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">
                    <span className={emp.jobSatisfaction <= 2 ? 'text-amber-600' : 'text-slate-700'}>
                      {emp.jobSatisfaction} / 4.0
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 font-medium">
                    <div className="flex items-center gap-1.5 text-red-600 text-[11px]">
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span>{emp.actionTimeframe}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-6 text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/hr/employees/${emp.id}`)}
                    >
                      Profile
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleOpenOutreach(emp)}
                      icon={<MessageSquare className="w-3.5 h-3.5" />}
                    >
                      Outreach
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Quick Outreach Modal */}
      {selectedEmp && (
        <Modal
          isOpen={!!selectedEmp}
          onClose={() => setSelectedEmp(null)}
          title={`Initiate Retention Check-in: ${selectedEmp.name}`}
          subtitle={`Employee #${selectedEmp.id} • ${selectedEmp.jobRole} (${selectedEmp.department}) • ${selectedEmp.riskProbability}% Risk`}
        >
          {sendSuccess ? (
            <div className="py-8 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-xl font-bold">
                ✓
              </div>
              <h4 className="text-sm font-bold text-slate-900">Check-in Message Dispatched</h4>
              <p className="text-xs text-slate-500">
                A confidential message and notification have been sent to {selectedEmp.name}.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSendMessage} className="space-y-4">
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-xs text-amber-800 space-y-1">
                <p className="font-semibold">💡 Recommended Focus Area:</p>
                <p>{selectedEmp.topDriver}. Frame conversations supportively around workload and career alignment.</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Confidential Message Content
                </label>
                <textarea
                  rows={4}
                  required
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-3 text-xs text-slate-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedEmp(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isSending}
                  icon={<MessageSquare className="w-3.5 h-3.5" />}
                >
                  Send Outreach Message
                </Button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
};
