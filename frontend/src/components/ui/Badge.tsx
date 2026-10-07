import React from 'react';
import { clsx } from 'clsx';
import { RiskTier } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'emerald' | 'amber' | 'red' | 'blue' | 'slate' | 'purple';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'slate',
  size = 'sm',
  className,
}) => {
  const variantStyles = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1 font-medium',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-md border font-medium transition-colors',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  );
};

export const RiskBadge: React.FC<{ tier: RiskTier; probability?: number; className?: string }> = ({
  tier,
  probability,
  className,
}) => {
  const config = {
    Low: { variant: 'emerald' as const, label: 'Low Risk', dot: 'bg-emerald-500' },
    Medium: { variant: 'amber' as const, label: 'Medium Risk', dot: 'bg-amber-500' },
    High: { variant: 'red' as const, label: 'Elevated Risk', dot: 'bg-red-500' },
  }[tier] || { variant: 'slate' as const, label: tier, dot: 'bg-slate-400' };

  return (
    <Badge variant={config.variant} size="md" className={clsx('gap-1.5', className)}>
      <span className={clsx('w-1.5 h-1.5 rounded-full', config.dot)} />
      <span>{config.label}</span>
      {probability !== undefined && (
        <span className="opacity-75 font-mono text-[11px]">({probability.toFixed(1)}%)</span>
      )}
    </Badge>
  );
};
