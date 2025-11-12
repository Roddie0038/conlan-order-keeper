import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Bell, Volume2, Clock, RotateCcw } from 'lucide-react';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';

export function NotificationPreferences() {
  const { preferences, updatePreferences, updateEnabledTypes, resetToDefaults } = useNotificationPreferences();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <CardTitle>Notification Types</CardTitle>
          </div>
          <CardDescription>
            Choose which notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="order-updates" className="flex flex-col gap-1 cursor-pointer">
              <span className="font-medium">Order Updates</span>
              <span className="text-sm text-muted-foreground">Status changes and order confirmations</span>
            </Label>
            <Switch
              id="order-updates"
              checked={preferences.enabledTypes.orderUpdates}
              onCheckedChange={(checked) => updateEnabledTypes('orderUpdates', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="order-messages" className="flex flex-col gap-1 cursor-pointer">
              <span className="font-medium">Order Messages</span>
              <span className="text-sm text-muted-foreground">New messages about your orders</span>
            </Label>
            <Switch
              id="order-messages"
              checked={preferences.enabledTypes.orderMessages}
              onCheckedChange={(checked) => updateEnabledTypes('orderMessages', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="system-alerts" className="flex flex-col gap-1 cursor-pointer">
              <span className="font-medium">System Alerts</span>
              <span className="text-sm text-muted-foreground">Important system notifications</span>
            </Label>
            <Switch
              id="system-alerts"
              checked={preferences.enabledTypes.systemAlerts}
              onCheckedChange={(checked) => updateEnabledTypes('systemAlerts', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Volume2 className="h-5 w-5 text-primary" />
            <CardTitle>Sound Settings</CardTitle>
          </div>
          <CardDescription>
            Control notification sound and volume
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="enable-sound" className="cursor-pointer">
              <span className="font-medium">Enable Notification Sound</span>
            </Label>
            <Switch
              id="enable-sound"
              checked={preferences.enableSound}
              onCheckedChange={(checked) => updatePreferences({ enableSound: checked })}
            />
          </div>

          {preferences.enableSound && (
            <div className="space-y-3">
              <Label htmlFor="sound-volume">
                Sound Volume: {Math.round(preferences.soundVolume * 100)}%
              </Label>
              <Slider
                id="sound-volume"
                min={0}
                max={100}
                step={5}
                value={[preferences.soundVolume * 100]}
                onValueChange={([value]) => updatePreferences({ soundVolume: value / 100 })}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <CardTitle>Display Settings</CardTitle>
          </div>
          <CardDescription>
            Control how long desktop notifications stay visible
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="enable-desktop" className="cursor-pointer">
              <span className="font-medium">Enable Desktop Notifications</span>
            </Label>
            <Switch
              id="enable-desktop"
              checked={preferences.enableDesktop}
              onCheckedChange={(checked) => updatePreferences({ enableDesktop: checked })}
            />
          </div>

          {preferences.enableDesktop && (
            <div className="space-y-3">
              <Label htmlFor="display-duration">
                Display Duration: {(preferences.displayDuration / 1000).toFixed(1)}s
              </Label>
              <Slider
                id="display-duration"
                min={2000}
                max={10000}
                step={500}
                value={[preferences.displayDuration]}
                onValueChange={([value]) => updatePreferences({ displayDuration: value })}
              />
              <p className="text-xs text-muted-foreground">
                How long desktop notifications remain visible before auto-closing
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Button
            variant="outline"
            onClick={resetToDefaults}
            className="w-full gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset to Default Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
