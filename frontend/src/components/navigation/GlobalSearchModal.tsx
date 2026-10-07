import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, ArrowRight, Loader2, X } from 'lucide-react';
import { employeeService } from '../../services';
import { Employee } from '../../types';
import { RiskBadge } from '../ui/Badge';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const data = await employeeService.getEmployees({
          search: query.trim(),
          page_size: 6,
        });
        setResults(data.employees);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-20">
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative mx-auto max-w-xl transform rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 transition-all overflow-hidden border border-slate-200">
        {/* Search Input */}
        <div className="relative flex items-center border-b border-slate-100 px-4">
          <Search className="w-5 h-5 text-slate-400 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search employees by name, ID, role, or department..."
            className="h-14 w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          {isLoading && <Loader2 className="w-4 h-4 animate-spin text-brand-600 mr-2" />}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2">
          {query.trim() && !isLoading && results.length === 0 && (
            <div className="p-8 text-center text-sm text-slate-500">
              No employees found matching <span className="font-semibold text-slate-700">"{query}"</span>.
            </div>
          )}

          {!query.trim() && (
            <div className="p-6 text-center text-xs text-slate-400">
              Type employee name, ID number, department, or job title...
            </div>
          )}

          {results.map((emp) => (
            <div
              key={emp.id}
              onClick={() => {
                onClose();
                navigate(`/hr/employees/${emp.id}`);
              }}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-semibold text-xs shrink-0">
                  {emp.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-brand-600">
                      {emp.name}
                    </p>
                    <span className="text-xs text-slate-400 font-mono">#{emp.employeeNumber}</span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">
                    {emp.jobRole} • {emp.department}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <RiskBadge tier={emp.attritionRisk} probability={emp.riskProbability} />
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-brand-600 transition-transform group-hover:translate-x-0.5" />
              </div>
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500">
          <span>Search backed by real 1,470 employee dataset</span>
          <span className="font-mono">ESC to close</span>
        </div>
      </div>
    </div>
  );
};
