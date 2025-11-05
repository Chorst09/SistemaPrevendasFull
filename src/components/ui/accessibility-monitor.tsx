'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, X } from 'lucide-react';
import { getColorPaletteReport } from '@/lib/utils/accessibility';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';

interface AccessibilityMonitorProps {
  showInProduction?: boolean;
}

export function AccessibilityMonitor({ showInProduction = false }: AccessibilityMonitorProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [report, setReport] = useState<ReturnType<typeof getColorPaletteReport>>([]);

  useEffect(() => {
    // Only show in development unless explicitly enabled for production
    if (process.env.NODE_ENV === 'development' || showInProduction) {
      const paletteReport = getColorPaletteReport();
      setReport(paletteReport);
      
      // Show monitor if there are accessibility issues
      const hasIssues = paletteReport.some(r => !r.isAccessible);
      if (hasIssues) {
        setIsVisible(true);
      }
    }
  }, [showInProduction]);

  if (!isVisible || report.length === 0) {
    return null;
  }

  const failedCombinations = report.filter(r => !r.isAccessible);
  const passedCombinations = report.filter(r => r.isAccessible);

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <Card className="border-orange-500 bg-background/95 backdrop-blur">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              Accessibility Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>{passedCombinations.length} combinations pass WCAG AA</span>
          </div>
          
          {failedCombinations.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <span>{failedCombinations.length} combinations need attention</span>
              </div>
              
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {failedCombinations.slice(0, 3).map((result, index) => (
                  <div key={index} className="text-xs space-y-1">
                    <div className="font-medium">{result.combination}</div>
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive" className="text-xs">
                        {result.level}
                      </Badge>
                      <span className="text-muted-foreground">
                        Ratio: {result.ratio}
                      </span>
                    </div>
                  </div>
                ))}
                {failedCombinations.length > 3 && (
                  <div className="text-xs text-muted-foreground">
                    +{failedCombinations.length - 3} more issues
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="text-xs text-muted-foreground">
            This monitor only appears in development mode
          </div>
        </CardContent>
      </Card>
    </div>
  );
}