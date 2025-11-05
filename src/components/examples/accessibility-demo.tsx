'use client';

import { useContrastCheck, useColorPaletteValidation } from '@/hooks/use-accessibility';
import { useAccessibility } from '../providers/accessibility-provider';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { HighContrastToggle } from '../ui/high-contrast-toggle';
import { AccessibilityPanel } from '../ui/accessibility-panel';
import { AccessibilityMonitor } from '../ui/accessibility-monitor';

export function AccessibilityDemo() {
  // Validate color palette on component mount
  useColorPaletteValidation();

  // Check contrast for specific color combinations
  const primaryButtonContrast = useContrastCheck('#FF6B35', '#1a2332', false, 'Primary Button');
  const cardTextContrast = useContrastCheck('#FFFFFF', '#2a3441', false, 'Card Text');
  
  const { announceToScreenReader, fontSize, isHighContrast } = useAccessibility();

  const handleTestAnnouncement = () => {
    announceToScreenReader('This is a test announcement for screen readers!');
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Accessibility Features Demo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Contrast Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Color Contrast Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Primary Button:</span>
                    <Badge variant={primaryButtonContrast.isAccessible ? "default" : "destructive"}>
                      {primaryButtonContrast.level} ({primaryButtonContrast.ratio})
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Card Text:</span>
                    <Badge variant={cardTextContrast.isAccessible ? "default" : "destructive"}>
                      {cardTextContrast.level} ({cardTextContrast.ratio})
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Current Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">High Contrast:</span>
                    <Badge variant={isHighContrast ? "default" : "secondary"}>
                      {isHighContrast ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Font Size:</span>
                    <Badge variant="outline">
                      {fontSize === 'normal' ? 'Normal' : fontSize === 'large' ? 'Large' : 'Extra Large'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Interactive Elements */}
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={handleTestAnnouncement}
                className="btn-primary-modern"
              >
                Test Screen Reader
              </Button>
              <HighContrastToggle />
            </div>

            {/* Color Examples */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className="p-3 rounded bg-primary text-primary-foreground text-center text-sm">
                Primary
              </div>
              <div className="p-3 rounded bg-accent text-accent-foreground text-center text-sm">
                Accent
              </div>
              <div className="p-3 rounded bg-secondary text-secondary-foreground text-center text-sm">
                Secondary
              </div>
              <div className="p-3 rounded bg-muted text-muted-foreground text-center text-sm">
                Muted
              </div>
            </div>
          </div>

          {/* Accessibility Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Accessibility Guidelines</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• WCAG AA requires contrast ratio ≥ 4.5:1 for normal text</li>
                <li>• WCAG AA requires contrast ratio ≥ 3:1 for large text</li>
                <li>• WCAG AAA requires contrast ratio ≥ 7:1 for normal text</li>
                <li>• High contrast mode uses maximum contrast ratios</li>
                <li>• All interactive elements have focus indicators</li>
                <li>• Screen reader announcements provide feedback</li>
              </ul>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Accessibility Panel and Monitor */}
      <AccessibilityPanel />
      <AccessibilityMonitor showInProduction={false} />
    </div>
  );
}