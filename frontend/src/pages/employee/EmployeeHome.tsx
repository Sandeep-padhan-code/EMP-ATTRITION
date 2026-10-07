import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HeartHandshake,
  MessageSquare,
  Sparkles,
  Send,
  CheckCircle2,
  Calendar,
  Briefcase,
  Building,
  Clock,
  ArrowRight,
  ShieldCheck,
  Smile,
  Meh,
  Frown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { employeeService, messageService, feedbackService } from '../../services';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';

export const EmployeeHome: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<any | null>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Confidential Feedback Submission Form State
  const [feedbackCategory, setFeedbackCategory] = useState('Workload & Cadence');
  const [sentiment, setSentiment] = useState('Neutral');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [profRes, convRes] = await Promise.all([
          employeeService.getMyProfile(),
          messageService.getConversations(),
        ]);
        setProfile(profRes.profile);
        setConversations(convRes.conversations);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackMessage.trim()) return;

    setIsSubmittingFeedback(true);
    try {
      await feedbackService.submitFeedback({
        category: feedbackCategory,
        sentiment,
        message: feedbackMessage.trim(),
        is_anonymous: isAnonymous,
      });
      setFeedbackSuccess(true);
      setFeedbackMessage('');
      setTimeout(() => setFeedbackSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to submit feedback');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Card className="p-6"><Skeleton className="h-32 w-full" /></Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6"><Skeleton className="h-48 w-full" /></Card>
          <Card className="p-6"><Skeleton className="h-48 w-full" /></Card>
        </div>
      </div>
    );
  }

  const activeConv = conversations[0];

  return (
    <div className="space-y-6 text-left">
      {/* Welcome Hero Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-850 to-brand-950 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-500/20 border border-brand-500/30 px-3 py-1 text-xs text-brand-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Employee Self-Service Workspace</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Good morning, {user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Welcome to your people portal. View your team alignment, stay in touch with HR leadership, and share confidential feedback.
          </p>
        </div>
      </div>

      {/* Grid: Profile Snapshot & Active HR Messages */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Card */}
        <Card className="flex flex-col justify-between">
          <div>
            <CardHeader
              title="Your Profile Overview"
              subtitle="Current organizational role and tenure assignment"
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/employee/profile')}
                  icon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Full Profile
                </Button>
              }
            />

            <div className="grid grid-cols-2 gap-3 text-xs mt-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 text-[11px] block">Role Classification</span>
                <span className="font-semibold text-slate-800 block mt-0.5">{profile?.jobRole || user?.job_role}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 text-[11px] block">Department</span>
                <span className="font-semibold text-slate-800 block mt-0.5">{profile?.department || user?.department}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 text-[11px] block">Company Tenure</span>
                <span className="font-semibold text-slate-800 block mt-0.5">{profile?.yearsAtCompany || 1} years</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 text-[11px] block">Work Pattern</span>
                <span className="font-semibold text-slate-800 block mt-0.5">
                  {profile?.overTime === 'Yes' ? 'Active Overtime' : 'Standard Cadence'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Corporate ID #{profile?.employeeNumber || user?.employee_number}</span>
            <span className="text-emerald-600 font-medium">Active Status</span>
          </div>
        </Card>

        {/* HR Communication Card */}
        <Card className="flex flex-col justify-between">
          <div>
            <CardHeader
              title="People & Talent Team Touchpoints"
              subtitle="Direct communication channel with your HR partner"
              action={
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/employee/messages')}
                  icon={<MessageSquare className="w-3.5 h-3.5" />}
                >
                  Open Chat
                </Button>
              }
            />

            {activeConv ? (
              <div className="p-4 rounded-xl bg-brand-50/60 border border-brand-100 space-y-2 text-xs text-left mt-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{activeConv.title}</span>
                  <Badge variant="blue">{activeConv.topic}</Badge>
                </div>
                <p className="text-slate-600 italic">
                  "{activeConv.last_message_preview}"
                </p>
                <p className="text-[10px] text-slate-400 pt-1">
                  Last updated {new Date(activeConv.last_message_at).toLocaleDateString()}
                </p>
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-400">
                No active conversations yet. You can message HR directly anytime.
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Messages are confidential and restricted to People Leadership.</span>
          </div>
        </Card>
      </div>

      {/* Confidential Sentiment & Feedback Form */}
      <Card>
        <CardHeader
          title="Share Confidential Feedback & Sentiment"
          subtitle="Let People Leadership know how your workload, team dynamics, or career growth are going"
        />

        {feedbackSuccess ? (
          <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <h4 className="text-sm font-bold text-slate-900">Thank you for your feedback!</h4>
            <p className="text-xs text-slate-600">
              Your input has been submitted confidentially to the HR Leadership team.
            </p>
          </div>
        ) : (
          <form onSubmit={handleFeedbackSubmit} className="space-y-4 text-xs">
            {/* Sentiment Selector */}
            <div>
              <label className="block font-medium text-slate-700 mb-1.5">
                How are you feeling about your current work experience?
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Positive', icon: Smile, color: 'text-emerald-600 border-emerald-300 bg-emerald-50/50' },
                  { label: 'Neutral', icon: Meh, color: 'text-amber-600 border-amber-300 bg-amber-50/50' },
                  { label: 'Concerned', icon: Frown, color: 'text-red-600 border-red-300 bg-red-50/50' },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = sentiment === item.label;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => setSentiment(item.label)}
                      className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-medium transition-all ${
                        isSelected ? item.color + ' ring-2 ring-brand-500 shadow-xs' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Feedback Category</label>
                <select
                  value={feedbackCategory}
                  onChange={(e) => setFeedbackCategory(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900"
                >
                  <option value="Workload & Cadence">Workload & Cadence</option>
                  <option value="Career & Promotion Path">Career & Promotion Path</option>
                  <option value="Team Culture & Collaboration">Team Culture & Collaboration</option>
                  <option value="Compensation & Recognition">Compensation & Recognition</option>
                  <option value="General Suggestion">General Suggestion</option>
                </select>
              </div>

              <div className="flex items-center pt-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span className="font-medium text-slate-700">Submit anonymously</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Your Thoughts & Comments</label>
              <textarea
                rows={3}
                required
                value={feedbackMessage}
                onChange={(e) => setFeedbackMessage(e.target.value)}
                placeholder="Share any challenges, suggestions, or reflections regarding your day-to-day experience..."
                className="w-full rounded-lg border border-slate-300 p-3 text-xs text-slate-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div className="flex justify-end pt-1">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isSubmittingFeedback}
                icon={<Send className="w-3.5 h-3.5" />}
              >
                Submit Feedback
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
};
