import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BrainCircuit,
  Cpu,
  TrendingDown,
  Clock,
  Briefcase,
  Flame,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  MessageSquare,
  Sparkles,
  BarChart3,
  Layers,
} from 'lucide-react';
import { analyticsService, feedbackService } from '../../services';
import { WorkforceAnalyticsResponse } from '../../types';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge, RiskBadge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { ModelFeatureRanking } from '../../components/charts/ModelFeatureRanking';
import { DepartmentRiskBar } from '../../components/charts/DepartmentRiskBar';

export const HRIntelligence: React.FC = () => {
  const [data, setData] = useState<WorkforceAnalyticsResponse | null>(null);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const fetchIntelligence = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [analyticsRes, feedbackRes] = await Promise.all([
        analyticsService.getOverview(),
        feedbackService.getFeedbackList(),
      ]);
      setData(analyticsRes);
      setFeedback(feedbackRes.feedback || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load intelligence data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIntelligence();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64 mb-2" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6"><Skeleton className="h-72 w-full" /></Card>
          <Card className="p-6"><Skeleton className="h-72 w-full" /></Card>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="py-16 text-center space-y-3">
        <p className="text-sm font-semibold text-red-600">{error || 'Data unavailable'}</p>
        <Button variant="outline" size="sm" onClick={fetchIntelligence}>
          Retry
        </Button>
      </div>
    );
  }

  const { workforce_kpis, top_model_factors, departments, roles, overtime_comparison, model_metadata, tenure_bands } = data;

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Attrition Intelligence</h1>
            <span className="rounded-full bg-brand-100 text-brand-700 px-2.5 py-0.5 text-xs font-semibold">
              Calibrated ML Model
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Structural model feature weights, department risk exposures, and tenure dynamics.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchIntelligence}
          icon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Refresh Analytics
        </Button>
      </div>

      {/* Model Technical Architecture Snapshot */}
      <Card className="p-5 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white border-slate-800">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div className="border-r border-slate-800 pr-4">
            <span className="text-slate-400 block text-[11px] uppercase tracking-wider">Model Architecture</span>
            <span className="text-sm font-bold text-white mt-0.5 block">{model_metadata.algorithm}</span>
            <span className="text-[11px] text-slate-400">Scikit-learn Ensemble</span>
          </div>

          <div className="border-r border-slate-800 pr-4">
            <span className="text-slate-400 block text-[11px] uppercase tracking-wider">Validation Accuracy</span>
            <span className="text-sm font-bold text-emerald-400 mt-0.5 block">{model_metadata.accuracy}</span>
            <span className="text-[11px] text-slate-400">Tested on 20% holdout split</span>
          </div>

          <div className="border-r border-slate-800 pr-4">
            <span className="text-slate-400 block text-[11px] uppercase tracking-wider">Feature Dimension</span>
            <span className="text-sm font-bold text-brand-300 mt-0.5 block">{model_metadata.feature_count} Input Features</span>
            <span className="text-[11px] text-slate-400">Continuous & Categorical</span>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px] uppercase tracking-wider">Dataset Records</span>
            <span className="text-sm font-bold text-white mt-0.5 block">{model_metadata.dataset_records.toLocaleString()} Synchronized</span>
            <span className="text-[11px] text-slate-400">IBM HR Analytics Schema</span>
          </div>
        </div>
      </Card>

      {/* Grid: Global Feature Importance & Department Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Global Feature Ranking */}
        <div className="lg:col-span-6">
          <Card className="h-full">
            <CardHeader
              title="Global Feature Importance Weights"
              subtitle="Trained Random Forest Gini feature importances across workforce"
            />
            <ModelFeatureRanking factors={top_model_factors} />
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
              Weights reflect structural feature significance across all 200 decision trees.
            </div>
          </Card>
        </div>

        {/* Overtime vs Standard Workload Deep-dive */}
        <div className="lg:col-span-6 space-y-6">
          <Card>
            <CardHeader
              title="Workload & Overtime Vulnerability"
              subtitle="Direct correlation between overtime hours and turnover probability"
            />

            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="p-4 rounded-xl bg-red-50/80 border border-red-200 text-xs space-y-1">
                <span className="text-red-700 font-semibold flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-red-600" />
                  OverTime = Yes
                </span>
                <p className="text-2xl font-bold text-red-900 mt-1">
                  {overtime_comparison.overtime_yes.attrition_rate}%
                </p>
                <p className="text-[11px] text-red-700">
                  {overtime_comparison.overtime_yes.headcount} employees logging active overtime
                </p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs space-y-1">
                <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  OverTime = No
                </span>
                <p className="text-2xl font-bold text-emerald-900 mt-1">
                  {overtime_comparison.overtime_no.attrition_rate}%
                </p>
                <p className="text-[11px] text-emerald-700">
                  {overtime_comparison.overtime_no.headcount} standard cadence employees
                </p>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
              <strong className="text-slate-800">Executive Insight:</strong> Employees with continuous overtime exhibit an attrition rate nearly <strong>{workforce_kpis.overtime_risk_multiplier}x higher</strong> than peers with standard schedules.
            </div>
          </Card>

          {/* Tenure Dynamics */}
          <Card>
            <CardHeader
              title="Tenure Risk Bands"
              subtitle="Attrition exposure across company tenure stages"
            />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              {tenure_bands.map((band) => (
                <div key={band.band} className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="font-semibold text-slate-700 block">{band.band}</span>
                  <span className="text-lg font-bold text-slate-900 block mt-1">{band.count}</span>
                  <span className="text-[10px] text-slate-500 font-medium">{band.risk_rate}% avg risk</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Role-Level Exposure Table */}
      <Card>
        <CardHeader
          title="Job Role Risk Exposure Ranking"
          subtitle="Proportion of elevated-risk employees within each professional classification"
        />

        <div className="overflow-x-auto -mx-5 md:-mx-6">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-y border-slate-200 bg-slate-50/75 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-6">Job Role</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Headcount</th>
                <th className="py-3 px-4">Elevated Risk Count</th>
                <th className="py-3 px-4">Role Risk Rate</th>
                <th className="py-3 px-4">Avg Monthly Comp</th>
                <th className="py-3 px-6 text-right">Directory Filter</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {roles.map((role) => (
                <tr key={role.role} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-6 font-semibold text-slate-900">{role.role}</td>
                  <td className="py-3.5 px-4 text-slate-600">{role.department}</td>
                  <td className="py-3.5 px-4 font-mono font-medium text-slate-800">{role.headcount}</td>
                  <td className="py-3.5 px-4 font-mono text-red-600 font-semibold">{role.high_risk_count}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{role.risk_rate}%</td>
                  <td className="py-3.5 px-4 font-mono text-slate-700">${role.avg_income.toLocaleString()}/mo</td>
                  <td className="py-3.5 px-6 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/hr/employees?role=${encodeURIComponent(role.role)}`)}
                      className="text-brand-600"
                    >
                      View Role
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Employee Confidential Sentiment Submissions (Feedback) */}
      {feedback.length > 0 && (
        <Card>
          <CardHeader
            title="Employee Sentiment & Feedback Signals"
            subtitle="Confidential pulse submissions submitted via employee workspace"
          />
          <div className="space-y-3 mt-2">
            {feedback.map((f: any) => (
              <div
                key={f.id}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-semibold text-slate-800">
                    <span>{f.category}</span>
                    <span className="text-slate-400 font-normal">• from {f.employee_name}</span>
                  </div>
                  <Badge
                    variant={
                      f.sentiment === 'Positive'
                        ? 'emerald'
                        : f.sentiment === 'Concerned'
                        ? 'red'
                        : 'amber'
                    }
                  >
                    {f.sentiment} Sentiment
                  </Badge>
                </div>
                <p className="text-slate-600">{f.message}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
