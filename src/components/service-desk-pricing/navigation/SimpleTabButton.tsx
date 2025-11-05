'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  AlertCircle, 
  AlertTriangle, 
  Clock
} from 'lucide-react';

interface SimpleTabButtonProps {
  id: string;
  label: string;
  shortLabel?: string;
  index: number;
  isActive: boolean;
  canAccess: boolean;
  status: 'valid' | 'invalid' | 'warning' | 'pending';
  validationData?: {
    errors: any[];
    warnings: any[];
    completionPercentage: number;
  };
  onClick: () => void;
  tooltip?: string;
}

export function SimpleTabButton({
  id,
  label,
  shortLabel,
  index,
  isActive,
  canAccess,
  status,
  validationData,
  onClick,
  tooltip
}: SimpleTabButtonProps) {
  // Get status icon
  const getStatusIcon = () => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'invalid':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  // Get status badge
  const getStatusBadge = () => {
    switch (status) {
      case 'valid':
        return <Badge variant="default" className="ml-2 bg-green-500 text-white">✓</Badge>;
      case 'invalid':
        return (
          <Badge variant="destructive" className="ml-2">
            {validationData?.errors.length || '!'}
          </Badge>
        );
      case 'warning':
        return (
          <Badge variant="secondary" className="ml-2 bg-yellow-500 text-white">
            {validationData?.warnings.length || '⚠'}
          </Badge>
        );
      default:
        return validationData?.completionPercentage ? (
          <Badge variant="outline" className="ml-2">
            {Math.round(validationData.completionPercentage)}%
          </Badge>
        ) : null;
    }
  };

  const baseClasses = `
    inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium 
    ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 
    focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none 
    disabled:opacity-50 h-9 px-3 flex items-center space-x-2 min-w-0 max-w-48
  `;

  const variantClasses = isActive 
    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
    : 'border border-input bg-background hover:bg-accent hover:text-accent-foreground';

  const statusClasses = `
    ${isActive ? 'ring-2 ring-primary ring-offset-2' : ''}
    ${!canAccess ? 'opacity-50 cursor-not-allowed' : ''}
    ${status === 'invalid' ? 'border-red-300 hover:border-red-400' : ''}
    ${status === 'warning' ? 'border-yellow-300 hover:border-yellow-400' : ''}
    ${status === 'valid' ? 'border-green-300 hover:border-green-400' : ''}
  `;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!canAccess}
      title={tooltip}
      className={`${baseClasses} ${variantClasses} ${statusClasses}`}
    >
      <span className="flex items-center space-x-1">
        <span className="text-xs font-medium">{index + 1}</span>
        {getStatusIcon()}
      </span>
      <span className="truncate text-xs">
        {shortLabel || label}
      </span>
      {getStatusBadge()}
    </button>
  );
}