import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MessageSquare,
  FileCheck,
  BrainCircuit,
  AlertTriangle,
  Clock,
  Sparkles,
  TrendingDown,
  Building,
  Briefcase,
  DollarSign,
  Heart,
  Compass,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { employeeService, messageService, reportService } from '../../services';
import { EmployeeDetail, ActionPlan } from '../../types';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { RiskBadge, Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { Modal } from '../../components/ui/Modal';

export const HREmployeeDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState<EmployeeDetail | null>(null);
  const [actionPlans, setActionPlans] = useState<ActionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Message Modal
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [messageContent, setMessageContent] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [messageSuccess, setMessageSuccess] = useState(false);

  // Action Plan Modal
  const [isPlanOpen, setIsPlanOpen] = useState(false);
  const [planType, setPlanType] = useState('1-on-1 Check-in');
  const [planPriority, setPlanPriority] = useState('High');
  const [planNotes, setPlanNotes] = useState('');
  const [planDate, setPlanDate] = useState('');
  const [isSavingPlan, setIsSavingPlan] = useState(false);

  const fetchEmployeeData = async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const empData = await employeeService.getEmployee(Number(id));
      setEmployee(empData.employee);

      // Fetch existing action plans
      const plansData = await reportService.getActionPlans(Number(id));
      setActionPlans(plansData.action_plans);
    } catch (err: any) {
      setError(err.message || 'Failed to load employee details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeData();
  }, [id]);

  const handleOpenMessageModal = () => {
    if (!employee) return;
    setMessageContent(
      `Hi ${employee.name.split(' ')[0]}, I wanted to schedule a brief 1-on-1 touchpoint this week regarding your current projects and workload balance. Let me know what time works best for you.`
    );
    setMessageSuccess(false);
    setIsMessageOpen(true);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee || !messageContent.trim()) return;

    setIsSendingMessage(true);
    try {
      await messageService.sendMessage({
        recipient_employee_number: employee.id,
        content: messageContent.trim(),
        category: 'Retention Outreach',
        title: `Retention Outreach with ${employee.name}`,
      });
      setMessageSuccess(true);
      setTimeout(() => {
        setIsMessageOpen(false);
        setMessageSuccess(false);
      }, 1200);
    } catch (err: any) {
      alert(err.message || 'Failed to send message');
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleCreateActionPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee || !planNotes.trim()) return;

    setIsSavingPlan(true);
    try {
      const res = await reportService.createActionPlan({
        employee_number: employee.id,
        employee_name: employee.name,
        action_type: planType,
        priority: planPriority,
        notes: planNotes.trim(),
        target_date: planDate || undefined,
      });
      setActionPlans((prev) => [res.action_plan, ...prev]);
      setIsPlanOpen(false);
      setPlanNotes('');
    } catch (err: any) {
      alert(err.message || 'Failed to create action plan');
    } finally {
      setIsSavingPlan(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-32 mb-4" />
        <Card className="p-6">
          <div className="flex gap-4">
            <Skeleton className="w-16 h-16 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-6 w-64" />
              <Skeleton className="h-4 w-96" />
            </div>
          </div>
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6"><Skeleton className="h-64 w-full" /></Card>
          <Card className="p-6"><Skeleton className="h-64 w-full" /></Card>
        </div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="py-16 text-center space-y-4">
        <p className="text-sm font-semibold text-red-600">{error || 'Employee record not found'}</p>
        <Button variant="outline" size="sm" onClick={() => navigate('/hr/employees')} icon={<ArrowLeft className="w-4 h-4" />}>
          Back to Directory
        </Button>
      </div>
    );
  }

  const { prediction } = employee;

  return (
    <div className="space-y-6 text-left">
      {/* Back Button */}
      <button
        onClick={() => navigate('/hr/employees')}
        className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Employee Directory</span>
      </button>

      {/* Header Profile Banner */}
      <Card className="p-6 border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-brand-50 border border-brand-200 text-brand-700 flex items-center justify-center font-bold text-xl shadow-xs">
              {employee.name.split(' ').map((n) => n[0]).join('')}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{employee.name}</h1>
                <span className="text-xs font-mono text-slate-400">ID #{employee.employeeNumber}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {employee.jobRole} • {employee.department} • Level {employee.jobLevel || 1}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <RiskBadge tier={employee.attritionRisk} probability={employee.riskProbability} />
                <span className="text-slate-300 text-xs">•</span>
                <span className="text-xs text-slate-500">{employee.yearsAtCompany} yrs with company</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPlanOpen(true)}
              icon={<FileCheck className="w-4 h-4" />}
            >
              Add Action Plan
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenMessageModal}
              icon={<MessageSquare className="w-4 h-4" />}
            >
              Initiate Check-in
            </Button>
          </div>
        </div>
      </Card>

      {/* ML Prediction & Intelligence Scorecard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Risk Probability Scorecard */}
        <div className="lg:col-span-5">
          <Card className="h-full flex flex-col justify-between border-l-4 border-l-brand-600">
            <div>
              <CardHeader
                title="Predicted Attrition Risk"
                subtitle="Calibrated inference from 30 workforce features"
              />

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 my-4 text-center">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Model Estimated Risk
                </p>
                <p className="text-4xl font-extrabold text-slate-900 tracking-tight mt-1">
                  {prediction.risk_probability.toFixed(1)}%
                </p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <RiskBadge tier={prediction.risk_tier} />
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs font-medium text-emerald-600">
                    {prediction.retention_probability.toFixed(1)}% Retention Index
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-600">
                <p className="leading-relaxed">
                  {prediction.risk_tier === 'High'
                    ? 'The model detects multiple elevated stress indicators across workload and compensation. Proactive intervention recommended within 7–14 days.'
                    : prediction.risk_tier === 'Medium'
                    ? 'Moderate risk signals identified. Recommended quarterly check-in to monitor role engagement and growth trajectory.'
                    : 'The employee profile trends strongly toward long-term retention. Maintain regular career development rhythm.'}
                </p>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 text-[11px] text-slate-400 italic">
              {prediction.disclaimer}
            </div>
          </Card>
        </div>

        {/* Contributing Factors */}
        <div className="lg:col-span-7">
          <Card className="h-full">
            <CardHeader
              title="Model Contributing Factors"
              subtitle="Key workplace signals driving this statistical assessment"
            />

            <div className="space-y-3 mt-2">
              {prediction.contributing_factors.map((factor, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">{factor.factor}</span>
                      <span className="text-[10px] text-slate-400">({factor.category})</span>
                    </div>
                    <Badge
                      variant={
                        factor.signal_strength === 'High'
                          ? 'red'
                          : factor.signal_strength === 'Moderate'
                          ? 'amber'
                          : factor.signal_strength === 'Positive'
                          ? 'emerald'
                          : 'slate'
                      }
                    >
                      {factor.signal_strength} Signal
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-600">{factor.description}</p>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 font-mono">
                    <span>Employee: <strong className="text-slate-800">{factor.employee_value}</strong></span>
                    <span>Benchmark: {factor.benchmark}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Retention Recommendations */}
      <Card>
        <CardHeader
          title="Action-Oriented Retention Recommendations"
          subtitle="Suggested next steps to mitigate retention risk and improve alignment"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          {prediction.recommendations.map((rec, i) => (
            <div
              key={i}
              className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 hover:border-slate-300 transition-colors"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-900">{rec.action}</span>
                <Badge variant={rec.impact === 'High' ? 'red' : 'amber'}>
                  {rec.impact} Impact
                </Badge>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{rec.description}</p>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Target: {rec.timeframe}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Intelligently Grouped Profile Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Employment & Tenure */}
        <Card>
          <CardHeader
            title={
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-brand-600" />
                <span>Employment & Tenure</span>
              </div>
            }
          />
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[11px]">Department</span>
              <span className="font-semibold text-slate-800">{employee.department}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[11px]">Job Role</span>
              <span className="font-semibold text-slate-800">{employee.jobRole}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[11px]">Years at Company</span>
              <span className="font-semibold text-slate-800">{employee.yearsAtCompany} years</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[11px]">Years in Current Role</span>
              <span className="font-semibold text-slate-800">{employee.yearsInCurrentRole || 0} years</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[11px]">Years Since Last Promotion</span>
              <span className="font-semibold text-slate-800">{employee.yearsSinceLastPromotion} years</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[11px]">Years with Manager</span>
              <span className="font-semibold text-slate-800">{employee.yearsWithCurrManager} years</span>
            </div>
          </div>
        </Card>

        {/* Compensation & Structure */}
        <Card>
          <CardHeader
            title={
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>Compensation & Structure</span>
              </div>
            }
          />
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[11px]">Monthly Income</span>
              <span className="font-semibold text-slate-800 font-mono">
                ${employee.monthlyIncome.toLocaleString()}/mo
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[11px]">Recent Salary Hike</span>
              <span className="font-semibold text-slate-800">{employee.percentSalaryHike || 0}%</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[11px]">Job Level</span>
              <span className="font-semibold text-slate-800">Tier {employee.jobLevel || 1}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[11px]">Stock Option Level</span>
              <span className="font-semibold text-slate-800">Level {employee.stockOptionLevel || 0}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[11px]">Daily Rate</span>
              <span className="font-semibold text-slate-800 font-mono">${employee.dailyRate || 0}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[11px]">Hourly Rate</span>
              <span className="font-semibold text-slate-800 font-mono">${employee.hourlyRate || 0}/hr</span>
            </div>
          </div>
        </Card>

        {/* Engagement & Sentiment */}
        <Card>
          <CardHeader
            title={
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-500" />
                <span>Satisfaction & Sentiment Signals</span>
              </div>
            }
          />
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[11px]">Job Satisfaction</span>
              <span className="font-semibold text-slate-800">{employee.jobSatisfaction} / 4.0</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[11px]">Environment Satisfaction</span>
              <span className="font-semibold text-slate-800">{employee.environmentSatisfaction} / 4.0</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[11px]">Work-Life Balance</span>
              <span className="font-semibold text-slate-800">{employee.workLifeBalance} / 4.0</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[11px]">Relationship Satisfaction</span>
              <span className="font-semibold text-slate-800">{employee.relationshipSatisfaction || 3} / 4.0</span>
            </div>
          </div>
        </Card>

        {/* Workload & Logistics */}
        <Card>
          <CardHeader
            title={
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-blue-500" />
                <span>Workload & Work Patterns</span>
              </div>
            }
          />
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[11px]">OverTime Active</span>
              <span className={`font-semibold ${employee.overTime === 'Yes' ? 'text-red-600' : 'text-slate-800'}`}>
                {employee.overTime}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[11px]">Business Travel</span>
              <span className="font-semibold text-slate-800">{employee.businessTravel}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[11px]">Commute Distance</span>
              <span className="font-semibold text-slate-800">{employee.distanceFromHome} miles</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[11px]">Training Sessions (Last Year)</span>
              <span className="font-semibold text-slate-800">{employee.trainingTimesLastYear || 0} times</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Active Action Plans / Notes */}
      {actionPlans.length > 0 && (
        <Card>
          <CardHeader
            title="Recorded Action Plans & Notes"
            subtitle="Internal retention check-in milestones for this employee"
          />
          <div className="space-y-3 mt-2">
            {actionPlans.map((plan) => (
              <div
                key={plan.id}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-semibold text-slate-900">
                    <CheckCircle2 className="w-4 h-4 text-brand-600" />
                    <span>{plan.action_type}</span>
                  </div>
                  <Badge variant={plan.status === 'Completed' ? 'emerald' : 'amber'}>
                    {plan.status}
                  </Badge>
                </div>
                <p className="text-slate-600">{plan.notes}</p>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Logged by {plan.created_by_name}</span>
                  <span>Target Date: {plan.target_date || 'Pending'}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Direct Outreach Modal */}
      {isMessageOpen && (
        <Modal
          isOpen={isMessageOpen}
          onClose={() => setIsMessageOpen(false)}
          title={`Direct Retention Outreach: ${employee.name}`}
          subtitle={`Employee #${employee.id} • ${employee.jobRole} (${employee.department})`}
        >
          {messageSuccess ? (
            <div className="py-8 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-xl font-bold">
                ✓
              </div>
              <h4 className="text-sm font-bold text-slate-900">Check-in Message Dispatched</h4>
              <p className="text-xs text-slate-500">
                A confidential message has been placed in {employee.name}'s workspace.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSendMessage} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Message Body
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
                  onClick={() => setIsMessageOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isSendingMessage}
                  icon={<MessageSquare className="w-3.5 h-3.5" />}
                >
                  Send Outreach
                </Button>
              </div>
            </form>
          )}
        </Modal>
      )}

      {/* Create Action Plan Modal */}
      {isPlanOpen && (
        <Modal
          isOpen={isPlanOpen}
          onClose={() => setIsPlanOpen(false)}
          title={`Create Retention Action Plan: ${employee.name}`}
          subtitle="Document targeted support initiatives and milestone dates"
        >
          <form onSubmit={handleCreateActionPlan} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Action Type</label>
                <select
                  value={planType}
                  onChange={(e) => setPlanType(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900"
                >
                  <option value="1-on-1 Check-in">1-on-1 Check-in</option>
                  <option value="Workload Balancing">Workload Balancing</option>
                  <option value="Compensation Review">Compensation Review</option>
                  <option value="Career Growth Milestone">Career Growth Milestone</option>
                  <option value="Manager Alignment Sync">Manager Alignment Sync</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Priority</label>
                <select
                  value={planPriority}
                  onChange={(e) => setPlanPriority(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Action Plan Notes & Commitments</label>
              <textarea
                rows={3}
                required
                value={planNotes}
                onChange={(e) => setPlanNotes(e.target.value)}
                placeholder="e.g. Discuss sprint overtime reduction with team lead; evaluate lateral mentorship path."
                className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Target Completion Date</label>
              <input
                type="date"
                value={planDate}
                onChange={(e) => setPlanDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsPlanOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isSavingPlan}>
                Save Action Plan
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
