import React, { useState, useEffect } from 'react';
import {
  User,
  Briefcase,
  Building,
  Calendar,
  Heart,
  Compass,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { employeeService } from '../../services';
import { Card, CardHeader } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { Badge } from '../../components/ui/Badge';

export const EmployeeProfile: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await employeeService.getMyProfile();
        setProfile(res.profile);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card className="p-6"><Skeleton className="h-48 w-full" /></Card>
        <Card className="p-6"><Skeleton className="h-48 w-full" /></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      {/* Profile Header */}
      <Card className="p-6 border-slate-200">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold text-2xl shadow-xs">
            {profile?.name ? profile.name.split(' ').map((n: string) => n[0]).join('') : 'E'}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{profile?.name || user?.name}</h1>
              <span className="text-xs font-mono text-slate-400">ID #{profile?.employeeNumber || user?.employee_number}</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {profile?.jobRole || user?.job_role} • {profile?.department || user?.department}
            </p>
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Full-time Regular Employee</span>
              <span>•</span>
              <span>Corporate Internal Directory</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Grouped Information Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Employment & Organizational Placement */}
        <Card>
          <CardHeader
            title={
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-brand-600" />
                <span>Employment Details</span>
              </div>
            }
          />
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[11px]">Department</span>
              <span className="font-semibold text-slate-800">{profile?.department}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[11px]">Job Title</span>
              <span className="font-semibold text-slate-800">{profile?.jobRole}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[11px]">Years at Company</span>
              <span className="font-semibold text-slate-800">{profile?.yearsAtCompany} years</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[11px]">Total Career Experience</span>
              <span className="font-semibold text-slate-800">{profile?.totalWorkingYears} years</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[11px]">Years in Current Role</span>
              <span className="font-semibold text-slate-800">{profile?.yearsInCurrentRole || 0} years</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[11px]">Reporting Tenure</span>
              <span className="font-semibold text-slate-800">{profile?.yearsWithCurrManager || 0} years</span>
            </div>
          </div>
        </Card>

        {/* Work Logistics & Education */}
        <Card>
          <CardHeader
            title={
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-blue-500" />
                <span>Work Patterns & Background</span>
              </div>
            }
          />
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[11px]">OverTime Schedule</span>
              <span className="font-semibold text-slate-800">{profile?.overTime}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[11px]">Business Travel</span>
              <span className="font-semibold text-slate-800">{profile?.businessTravel}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[11px]">Education Field</span>
              <span className="font-semibold text-slate-800">{profile?.educationField || 'Professional'}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[11px]">Gender</span>
              <span className="font-semibold text-slate-800">{profile?.gender || 'N/A'}</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-slate-500 shrink-0" />
        <span>This information is managed by your HR systems. Contact your talent business partner to update details.</span>
      </div>
    </div>
  );
};
