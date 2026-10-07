import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers,
  ArrowRight,
  ShieldCheck,
  BrainCircuit,
  MessageSquare,
  Users,
  TrendingDown,
  Clock,
  Sparkles,
  ChevronRight,
  Lock,
  BarChart3,
  UserCheck,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { RiskBadge } from '../../components/ui/Badge';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'detect' | 'understand' | 'engage'>('detect');

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        {/* Subtle Ambient Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-brand-600/10 blur-[120px] pointer-events-none rounded-full" />
        <div className="absolute top-40 right-10 w-80 h-80 bg-blue-500/10 blur-[100px] pointer-events-none rounded-full" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3.5 py-1 text-xs font-medium text-brand-400 mb-8 animate-in fade-in duration-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Calibrated Machine Learning • Decision Support Architecture</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15] max-w-4xl mx-auto">
            Understand attrition before it becomes turnover.
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            AI-powered workforce intelligence that helps HR teams identify retention risks, understand workforce patterns, and engage employees earlier.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/login')}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Get started
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                const el = document.getElementById('preview');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-slate-900/80 text-slate-200 border-slate-700 hover:bg-slate-800"
            >
              Explore platform
            </Button>
          </div>

          {/* Social Proof / Accuracy Metric strip */}
          <div className="mt-12 pt-8 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-6 text-left max-w-3xl mx-auto text-xs text-slate-400">
            <div>
              <p className="font-mono text-xl font-bold text-white">1,470</p>
              <p className="text-slate-500 mt-0.5">Dataset Employees</p>
            </div>
            <div>
              <p className="font-mono text-xl font-bold text-brand-400">88.10%</p>
              <p className="text-slate-500 mt-0.5">Model Accuracy</p>
            </div>
            <div>
              <p className="font-mono text-xl font-bold text-emerald-400">200</p>
              <p className="text-slate-500 mt-0.5">Estimator Trees</p>
            </div>
            <div>
              <p className="font-mono text-xl font-bold text-white">RBAC</p>
              <p className="text-slate-500 mt-0.5">Enterprise Privacy</p>
            </div>
          </div>
        </div>

        {/* Hero Product Preview */}
        <div id="preview" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl p-4 sm:p-6 backdrop-blur-xl relative overflow-hidden">
            {/* Top Mock Window Bar */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 font-mono text-[11px] text-slate-500">app.workforce-intelligence.internal/hr/overview</span>
              </div>
              <span className="text-[11px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">Live Production Preview</span>
            </div>

            {/* Dashboard Mock Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-left">
              <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/50">
                <p className="text-xs text-slate-400">Workforce Headcount</p>
                <p className="text-2xl font-bold text-white mt-1">1,470</p>
                <p className="text-[11px] text-emerald-400 mt-1">Across 3 core divisions</p>
              </div>
              <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/50">
                <p className="text-xs text-slate-400">Employees at Risk</p>
                <p className="text-2xl font-bold text-amber-400 mt-1">221 <span className="text-xs font-normal text-slate-400">(15.0%)</span></p>
                <p className="text-[11px] text-slate-400 mt-1">33 Medium • 188 High</p>
              </div>
              <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/50">
                <p className="text-xs text-slate-400">Overtime Pressure</p>
                <p className="text-2xl font-bold text-red-400 mt-1">2.9x</p>
                <p className="text-[11px] text-slate-400 mt-1">Attrition multiplier</p>
              </div>
              <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/50">
                <p className="text-xs text-slate-400">Average Retention</p>
                <p className="text-2xl font-bold text-emerald-400 mt-1">82.9%</p>
                <p className="text-[11px] text-slate-400 mt-1">Healthy organizational index</p>
              </div>
            </div>

            {/* Priority Queue Preview Table */}
            <div className="mt-4 bg-slate-800/40 rounded-xl border border-slate-700/40 p-4 text-left">
              <div className="flex items-center justify-between mb-3 text-xs">
                <span className="font-semibold text-slate-200">Priority Retention Queue</span>
                <span className="text-brand-400 font-medium">Auto-Ranked by Random Forest</span>
              </div>
              <div className="space-y-2 text-xs">
                {[
                  { name: 'Mary Davis', role: 'Sales Executive', dept: 'Sales', risk: '80.0%', tier: 'High' as const, factor: 'Mandatory Overtime + Low Comp Ratio' },
                  { name: 'James Miller', role: 'Research Scientist', dept: 'R&D', risk: '76.0%', tier: 'High' as const, factor: 'Work Environment Friction (1/4)' },
                  { name: 'Patricia Wilson', role: 'Laboratory Technician', dept: 'R&D', risk: '72.5%', tier: 'High' as const, factor: 'Stagnant Promotion Tenure (4 yrs)' },
                ].map((row, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/70 border border-slate-700/30">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-slate-700 text-slate-300 font-bold flex items-center justify-center text-[11px]">
                        {row.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-200">{row.name}</p>
                        <p className="text-[11px] text-slate-400">{row.role} • {row.dept}</p>
                      </div>
                    </div>
                    <div className="hidden sm:block text-[11px] text-slate-400">
                      <span className="text-slate-500">Driver:</span> {row.factor}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-red-400 font-bold">{row.risk}</span>
                      <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 text-[10px] font-semibold">Elevated</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works: Detect, Understand, Engage */}
      <section id="features" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            The Three Pillars of Proactive Retention
          </h2>
          <p className="text-sm text-slate-400 mt-3">
            A cohesive intelligence workflow connecting data signals directly to employee conversations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          {/* Pillar 1 */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4 hover:border-slate-700 transition-all">
            <div className="w-10 h-10 rounded-xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">1. Detect</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Evaluate 30 individual employee features across workload, compensation, satisfaction, and tenure using our calibrated Random Forest model.
            </p>
            <ul className="text-xs text-slate-400 space-y-2 pt-2 border-t border-slate-800">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                <span>Statistical risk probability scoring</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                <span>Real-time department risk concentrations</span>
              </li>
            </ul>
          </div>

          {/* Pillar 2 */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4 hover:border-slate-700 transition-all">
            <div className="w-10 h-10 rounded-xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">2. Understand</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Inspect explainable model contributing factors. Understand why the model flagged specific risk without relying on black-box assumptions.
            </p>
            <ul className="text-xs text-slate-400 space-y-2 pt-2 border-t border-slate-800">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>Factor signal weights (Overtime, Comp, Satisfaction)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>Peer cohort benchmarking</span>
              </li>
            </ul>
          </div>

          {/* Pillar 3 */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4 hover:border-slate-700 transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">3. Engage</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Equip HR leaders with targeted check-in suggestions, 1-on-1 message outreach, and tailored retention action plans.
            </p>
            <ul className="text-xs text-slate-400 space-y-2 pt-2 border-t border-slate-800">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Direct HR ↔ Employee messaging</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Retention action plan tracking</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Intelligence Showcase */}
      <section id="intelligence" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-8 sm:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center text-left">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-brand-400 uppercase tracking-wider">
                <BrainCircuit className="w-4 h-4" />
                <span>Explainable AI Layer</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Not just a score. Transparent reasons and contextual actions.
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Traditional attrition models output disconnected probabilities that HR teams cannot act on. Our platform bridges the gap by decomposing predictions into actionable workplace drivers.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">✓</div>
                  <p className="text-xs text-slate-400"><strong className="text-slate-200">Workload Signals:</strong> Measures overtime intensity and work-life balance pressure.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">✓</div>
                  <p className="text-xs text-slate-400"><strong className="text-slate-200">Compensation Calibration:</strong> Compares salary bands against job level and market peers.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">✓</div>
                  <p className="text-xs text-slate-400"><strong className="text-slate-200">Growth Velocity:</strong> Tracks tenure without promotional movement or recognition.</p>
                </div>
              </div>
            </div>

            {/* Visual Factor Card Preview */}
            <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-semibold text-white">Model Contributing Factors (Sample)</span>
                <span className="text-[10px] bg-red-500/20 text-red-300 px-2 py-0.5 rounded font-medium">80.0% Risk</span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-slate-200">Mandatory / Frequent Overtime</span>
                    <span className="text-red-400 font-bold text-[11px]">High Signal</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Non-overtime peers show 68% lower baseline attrition.</p>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-slate-200">Compensation Ratio for Level 2</span>
                    <span className="text-amber-400 font-bold text-[11px]">Moderate Signal</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Monthly compensation ($5,993) is in lower quartile for sales role.</p>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-slate-200">Low Job Satisfaction (2.0/4.0)</span>
                    <span className="text-amber-400 font-bold text-[11px]">Moderate Signal</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Reported dissatisfaction with day-to-day engagement.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Governance */}
      <section id="security" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              <Lock className="w-4 h-4" />
              <span>Enterprise Trust & Privacy</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Strict role-based isolation. No deterministic labels.
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Workforce intelligence requires absolute ethical responsibility. Predictions are never exposed as certainty and employees are strictly partitioned from organization-wide risk analytics.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h4 className="font-bold text-slate-200">Backend RBAC</h4>
              <p className="text-slate-400 text-[11px]">Independent server-side token authorization rejects unauthorized queries at the API layer.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <UserCheck className="w-5 h-5 text-brand-400" />
              <h4 className="font-bold text-slate-200">Employee Partition</h4>
              <p className="text-slate-400 text-[11px]">Employees only access personal profile, messages, and confidential feedback submissions.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              <h4 className="font-bold text-slate-200">Decision Support Only</h4>
              <p className="text-slate-400 text-[11px]">Model predictions are framed responsibly to assist HR discussions, not make automated decisions.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <FileCheck className="w-5 h-5 text-blue-400" />
              <h4 className="font-bold text-slate-200">Audit & Reports</h4>
              <p className="text-slate-400 text-[11px]">Exportable CSV reports and action plan audit logs for internal talent committees.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-8">
        <div className="rounded-3xl border border-brand-500/30 bg-gradient-to-b from-brand-950/40 to-slate-900/90 p-10 sm:p-14 shadow-2xl space-y-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Turn workforce data into better retention decisions.
          </h2>
          <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Experience the complete Employee Attrition Intelligence Platform with real dataset records, trained ML inference, and proactive HR workflows.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-4">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/login')}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Get started now
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
