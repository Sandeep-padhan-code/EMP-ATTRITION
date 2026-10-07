import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  MessageSquare,
  RefreshCw,
  SlidersHorizontal,
  DollarSign,
  Briefcase,
  Layers,
} from 'lucide-react';
import { employeeService, messageService } from '../../services';
import { Employee, Pagination } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { RiskBadge } from '../../components/ui/Badge';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { Modal } from '../../components/ui/Modal';

export const HREmployees: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Filter States
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [department, setDepartment] = useState(searchParams.get('dept') || 'All');
  const [jobRole, setJobRole] = useState(searchParams.get('role') || 'All');
  const [riskTier, setRiskTier] = useState(searchParams.get('risk') || 'All');
  const [sortBy, setSortBy] = useState('riskProbability');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Data State
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Message Modal State
  const [messagingEmp, setMessagingEmp] = useState<Employee | null>(null);
  const [messageContent, setMessageContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  const fetchEmployees = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await employeeService.getEmployees({
        department: department === 'All' ? undefined : department,
        job_role: jobRole === 'All' ? undefined : jobRole,
        risk_tier: riskTier === 'All' ? undefined : riskTier,
        search: search.trim() || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
        page,
        page_size: pageSize,
      });
      setEmployees(data.employees);
      setPagination(data.pagination);
    } catch (err: any) {
      setError(err.message || 'Unable to load employee records from backend');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [department, jobRole, riskTier, sortBy, sortOrder, page, pageSize]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchEmployees();
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  const handleOpenMessage = (emp: Employee) => {
    setMessagingEmp(emp);
    setMessageContent(
      `Hi ${emp.name.split(' ')[0]}, I wanted to schedule a brief touchpoint this week regarding your recent workload and growth objectives. Please let me know what day works best for you.`
    );
    setSendSuccess(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messagingEmp || !messageContent.trim()) return;

    setIsSending(true);
    try {
      await messageService.sendMessage({
        recipient_employee_number: messagingEmp.id,
        content: messageContent.trim(),
        category: 'Retention Check-in',
        title: `Retention Sync with ${messagingEmp.name}`,
      });
      setSendSuccess(true);
      setTimeout(() => {
        setMessagingEmp(null);
        setSendSuccess(false);
      }, 1200);
    } catch (err: any) {
      alert(err.message || 'Failed to dispatch message');
    } finally {
      setIsSending(false);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setDepartment('All');
    setJobRole('All');
    setRiskTier('All');
    setSortBy('riskProbability');
    setSortOrder('desc');
    setPage(1);
  };

  const departmentList = [
    'All',
    'Research & Development',
    'Sales',
    'Human Resources',
  ];

  const roleList = [
    'All',
    'Sales Executive',
    'Research Scientist',
    'Laboratory Technician',
    'Manufacturing Director',
    'Healthcare Representative',
    'Manager',
    'Sales Representative',
    'Research Director',
    'Human Resources',
  ];

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Employees</h1>
            {pagination && (
              <span className="rounded-full bg-slate-100 text-slate-700 px-2.5 py-0.5 text-xs font-semibold">
                {pagination.total.toLocaleString()} records
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Dynamic workforce directory backed by IBM HR Analytics dataset and real-time Random Forest predictions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchEmployees}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetFilters}
          >
            Reset Filters
          </Button>
        </div>
      </div>

      {/* Filter and Search Controls Bar */}
      <Card className="p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {/* Search Input */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, ID number, role, department..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={department}
              onChange={(e) => {
                setDepartment(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-700 bg-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            >
              <option value="All">All Departments</option>
              {departmentList.filter((d) => d !== 'All').map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Job Role Filter */}
          <div>
            <select
              value={jobRole}
              onChange={(e) => {
                setJobRole(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-700 bg-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            >
              <option value="All">All Job Roles</option>
              {roleList.filter((r) => r !== 'All').map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Risk Tier Filter */}
          <div>
            <select
              value={riskTier}
              onChange={(e) => {
                setRiskTier(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-700 bg-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 font-medium"
            >
              <option value="All">All Risk Tiers</option>
              <option value="High">Elevated Risk (≥65%)</option>
              <option value="Medium">Medium Risk (35-65%)</option>
              <option value="Low">Low Risk (&lt;35%)</option>
            </select>
          </div>
        </div>

        {/* Sorting & Results summary bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent font-medium text-slate-800 border-none focus:ring-0 cursor-pointer text-xs"
            >
              <option value="riskProbability">Predicted Risk Probability</option>
              <option value="monthlyIncome">Monthly Income</option>
              <option value="yearsAtCompany">Years at Company</option>
              <option value="age">Age</option>
              <option value="employeeNumber">Employee ID</option>
              <option value="jobSatisfaction">Job Satisfaction</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-1 rounded hover:bg-slate-100 text-slate-600 transition-colors"
              title="Toggle Sort Direction"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="bg-transparent font-medium text-slate-800 border-none focus:ring-0 cursor-pointer text-xs"
            >
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Employee Data Table */}
      <Card className="p-0 overflow-hidden shadow-subtle border border-slate-200/90">
        {isLoading ? (
          <TableSkeleton rows={8} cols={7} />
        ) : error ? (
          <div className="p-12 text-center space-y-3">
            <p className="text-sm font-semibold text-red-600">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchEmployees}>
              Retry
            </Button>
          </div>
        ) : employees.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <p className="text-sm font-semibold text-slate-700">No employees match the current filters.</p>
            <p className="text-xs text-slate-500">
              Try adjusting your search query, department filter, or risk tier selection.
            </p>
            <Button variant="outline" size="sm" onClick={handleResetFilters}>
              Clear All Filters
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-5">Employee</th>
                  <th className="py-3 px-4">Department & Role</th>
                  <th className="py-3 px-4">Compensation</th>
                  <th className="py-3 px-4">Tenure</th>
                  <th className="py-3 px-4">Workload</th>
                  <th className="py-3 px-4">Risk Probability</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.map((emp) => (
                  <tr
                    key={emp.id}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => navigate(`/hr/employees/${emp.id}`)}
                  >
                    <td className="py-3.5 px-5 font-medium text-slate-900">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs shrink-0">
                          {emp.name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-900 block group-hover:text-brand-600 transition-colors">
                            {emp.name}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            #{emp.employeeNumber} • Age {emp.age}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <p className="font-medium text-slate-800">{emp.jobRole}</p>
                      <p className="text-[11px] text-slate-400">{emp.department}</p>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-800">
                      ${emp.monthlyIncome.toLocaleString()}/mo
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <p className="font-medium text-slate-800">{emp.yearsAtCompany} yrs at co</p>
                      <p className="text-[11px] text-slate-400">{emp.totalWorkingYears} yrs total</p>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                          emp.overTime === 'Yes'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {emp.overTime === 'Yes' ? 'Overtime Active' : 'Standard'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <RiskBadge tier={emp.attritionRisk} probability={emp.riskProbability} />
                    </td>
                    <td
                      className="py-3.5 px-5 text-right space-x-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/hr/employees/${emp.id}`)}
                      >
                        Profile
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenMessage(emp)}
                        icon={<MessageSquare className="w-3.5 h-3.5" />}
                        className="text-brand-600 hover:bg-brand-50"
                      >
                        Message
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {pagination && pagination.total_pages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50/80 border-t border-slate-200 text-xs text-slate-600">
            <div>
              Showing <span className="font-semibold text-slate-800">{(page - 1) * pageSize + 1}</span> to{' '}
              <span className="font-semibold text-slate-800">
                {Math.min(page * pageSize, pagination.total)}
              </span>{' '}
              of <span className="font-semibold text-slate-800">{pagination.total.toLocaleString()}</span> employees
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.has_prev}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                icon={<ChevronLeft className="w-3.5 h-3.5" />}
              >
                Previous
              </Button>
              <span className="px-3 py-1 font-mono text-slate-700 font-semibold">
                {page} / {pagination.total_pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.has_next}
                onClick={() => setPage((p) => p + 1)}
                icon={<ChevronRight className="w-3.5 h-3.5" />}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Message Modal */}
      {messagingEmp && (
        <Modal
          isOpen={!!messagingEmp}
          onClose={() => setMessagingEmp(null)}
          title={`Message: ${messagingEmp.name}`}
          subtitle={`Employee #${messagingEmp.id} • ${messagingEmp.jobRole} (${messagingEmp.department})`}
        >
          {sendSuccess ? (
            <div className="py-8 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-xl font-bold">
                ✓
              </div>
              <h4 className="text-sm font-bold text-slate-900">Direct Message Sent</h4>
              <p className="text-xs text-slate-500">
                {messagingEmp.name} will receive a notification and can reply from their employee workspace.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSendMessage} className="space-y-4">
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
                  onClick={() => setMessagingEmp(null)}
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
                  Send Message
                </Button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
};
