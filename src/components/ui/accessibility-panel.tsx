'use client';

import { useState } from 'react';
import { Settings, Eye, Type, Volume2, X } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Label } from './label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Switch } from './switch';
import { useAccessibility } from '../providers/accessibility-provider';
import { HighContrastToggle } from './high-contrast-toggle';

export function AccessibilityPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    isHighContrast, 
    toggleHighContrast, 
    announceToScreenReader,
    prefersReducedMotion,
    fontSize,
    setFontSize 
  } = useAccessibility();

  const handleFontSizeChange = (value: string) => {
    const size = value as 'normal' | 'large' | 'extra-large';
    setFontSize(size);
  };

  const testScreenReader = () => {
    announceToScreenReader('Screen reader test: This is a test announcement for accessibility verification.');
  };

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-50"
        aria-label="Open accessibility settings"
      >
        <Settings className="h-4 w-4" />
        <span className="ml-2 hidden sm:inline">Accessibility</span>
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-sm">
      <Card className="border-primary bg-background/95 backdrop-blur">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Settings className="h-4 w-4" />
              Accessibility Settings
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-6 w-6 p-0"
              aria-label="Close accessibility settings"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* High Contrast Toggle */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Visual Contrast
            </Label>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                High contrast mode
              </span>
              <Switch
                checked={isHighContrast}
                onCheckedChange={toggleHighContrast}
                aria-label="Toggle high contrast mode"
              />
            </div>
            <div className="text-xs text-muted-foreground">
              {isHighContrast ? 'Enabled' : 'Disabled'} - Improves text readability
            </div>
          </div>

          {/* Font Size Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Type className="h-4 w-4" />
              Text Size
            </Label>
            <Select value={fontSize} onValueChange={handleFontSizeChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select font size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal (100%)</SelectItem>
                <SelectItem value="large">Large (112.5%)</SelectItem>
                <SelectItem value="extra-large">Extra Large (125%)</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-xs text-muted-foreground">
              Current: {fontSize === 'normal' ? 'Normal' : fontSize === 'large' ? 'Large' : 'Extra Large'}
            </div>
          </div>

          {/* Motion Preferences */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Motion Settings</Label>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Reduced motion
              </span>
              <span className="text-xs px-2 py-1 rounded bg-muted">
                {prefersReducedMotion ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              {prefersReducedMotion 
                ? 'System preference detected - animations are reduced' 
                : 'Normal animations enabled'
              }
            </div>
          </div>

          {/* Screen Reader Test */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              Screen Reader
            </Label>
            <Button
              variant="outline"
              size="sm"
              onClick={testScreenReader}
              className="w-full"
              aria-label="Test screen reader announcement"
            >
              Test Announcement
            </Button>
            <div className="text-xs text-muted-foreground">
              Click to test screen reader functionality
            </div>
          </div>

          {/* Quick Access */}
          <div className="pt-2 border-t">
            <div className="text-xs text-muted-foreground mb-2">Quick Access:</div>
            <div className="flex gap-2">
              <HighContrastToggle />
            </div>
          </div>

          {/* Keyboard Shortcuts Info */}
          <div className="pt-2 border-t">
            <div className="text-xs text-muted-foreground">
              <div className="font-medium mb-1">Keyboard Shortcuts:</div>
              <div>• Tab: Navigate elements</div>
              <div>• Enter/Space: Activate buttons</div>
              <div>• Esc: Close dialogs</div>
              <div>• Arrow keys: Navigate menus</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}