'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  ChevronRight, 
  Home, 
  FolderOpen,
  FileText,
  Settings,
  BarChart3
} from 'lucide-react';

export interface BreadcrumbItem {
  id: string;
  label: string;
  href?: string;
  icon?: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  maxItems?: number;
  showIcons?: boolean;
  className?: string;
}

export function Breadcrumbs({
  items,
  maxItems = 5,
  showIcons = true,
  className = ''
}: BreadcrumbsProps) {
  // Get default icon for breadcrumb item
  const getDefaultIcon = (id: string) => {
    if (id === 'home') return <Home className="w-4 h-4" />;
    if (id === 'service-desk') return <FolderOpen className="w-4 h-4" />;
    if (id.includes('data') || id.includes('team') || id.includes('scale')) return <FileText className="w-4 h-4" />;
    if (id.includes('taxes') || id.includes('variables') || id.includes('costs')) return <Settings className="w-4 h-4" />;
    if (id.includes('budget') || id.includes('result') || id.includes('analysis')) return <BarChart3 className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  // Truncate items if needed
  const displayItems = items.length > maxItems 
    ? [
        items[0], // Always show first item (home)
        { id: 'ellipsis', label: '...', isActive: false },
        ...items.slice(-(maxItems - 2)) // Show last items
      ]
    : items;

  return (
    <nav className={`flex items-center space-x-1 text-sm ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1">
        {displayItems.map((item, index) => {
          const isLast = index === displayItems.length - 1;
          const isEllipsis = item.id === 'ellipsis';
          
          return (
            <li key={item.id} className="flex items-center">
              {/* Separator */}
              {index > 0 && (
                <ChevronRight className="w-4 h-4 text-muted-foreground mx-1" />
              )}
              
              {/* Breadcrumb Item */}
              {isEllipsis ? (
                <span className="text-muted-foreground px-2">...</span>
              ) : item.onClick ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={item.onClick}
                  className={`
                    h-auto p-1 font-normal
                    ${item.isActive || isLast 
                      ? 'text-foreground font-medium' 
                      : 'text-muted-foreground hover:text-foreground'
                    }
                  `}
                  disabled={item.isActive || isLast}
                >
                  <div className="flex items-center space-x-1">
                    {showIcons && (
                      <span className="flex-shrink-0">
                        {item.icon || getDefaultIcon(item.id)}
                      </span>
                    )}
                    <span className="truncate max-w-32">{item.label}</span>
                  </div>
                </Button>
              ) : (
                <span 
                  className={`
                    flex items-center space-x-1 px-1
                    ${item.isActive || isLast 
                      ? 'text-foreground font-medium' 
                      : 'text-muted-foreground'
                    }
                  `}
                >
                  {showIcons && (
                    <span className="flex-shrink-0">
                      {item.icon || getDefaultIcon(item.id)}
                    </span>
                  )}
                  <span className="truncate max-w-32">{item.label}</span>
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// Helper function to create breadcrumb items for service desk tabs
export function createServiceDeskBreadcrumbs(
  activeTabId: string,
  tabLabel: string,
  onNavigateHome?: () => void,
  onNavigateToServiceDesk?: () => void,
  projectName?: string
): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [
    {
      id: 'home',
      label: 'Início',
      icon: <Home className="w-4 h-4" />,
      onClick: onNavigateHome
    },
    {
      id: 'service-desk',
      label: 'Service Desk Pricing',
      icon: <FolderOpen className="w-4 h-4" />,
      onClick: onNavigateToServiceDesk
    }
  ];

  // Add project name if available
  if (projectName) {
    items.push({
      id: 'project',
      label: projectName,
      icon: <FileText className="w-4 h-4" />,
      onClick: onNavigateToServiceDesk
    });
  }

  // Add current tab
  items.push({
    id: activeTabId,
    label: tabLabel,
    isActive: true
  });

  return items;
}

// Helper function to create enhanced breadcrumbs with navigation path
export function createEnhancedServiceDeskBreadcrumbs(
  activeTabId: string,
  tabLabel: string,
  navigationPath: string[],
  tabConfigs: Array<{ id: string; label: string }>,
  onNavigateToTab?: (tabId: string) => void,
  onNavigateHome?: () => void,
  projectName?: string
): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [
    {
      id: 'home',
      label: 'Início',
      icon: <Home className="w-4 h-4" />,
      onClick: onNavigateHome
    },
    {
      id: 'service-desk',
      label: 'Service Desk Pricing',
      icon: <FolderOpen className="w-4 h-4" />,
      onClick: () => onNavigateToTab?.('data')
    }
  ];

  // Add project name if available
  if (projectName) {
    items.push({
      id: 'project',
      label: projectName,
      icon: <FileText className="w-4 h-4" />,
      onClick: () => onNavigateToTab?.('data')
    });
  }

  // Add navigation path (last 2-3 tabs visited)
  const recentTabs = navigationPath.slice(-3, -1); // Exclude current tab
  recentTabs.forEach(tabId => {
    const tabConfig = tabConfigs.find(t => t.id === tabId);
    if (tabConfig && tabId !== activeTabId) {
      items.push({
        id: tabId,
        label: tabConfig.label,
        onClick: () => onNavigateToTab?.(tabId)
      });
    }
  });

  // Add current tab
  items.push({
    id: activeTabId,
    label: tabLabel,
    isActive: true
  });

  return items;
}