'use client';

import { ThemeToggleButton } from '@/components/ui/theme-toggle-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Paintbrush, Bell, Shield } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto shadow-xl rounded-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-primary">Settings</CardTitle>
          <CardDescription>Manage your application preferences and account settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Paintbrush className="mr-2 h-5 w-5 text-accent" />
              Appearance
            </h3>
            <Separator />
            <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-md">
              <div>
                <p className="font-medium">Theme Mode</p>
                <p className="text-sm text-muted-foreground">Choose between light and dark mode.</p>
              </div>
              <ThemeToggleButton />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Bell className="mr-2 h-5 w-5 text-accent" />
              Notifications (Placeholder)
            </h3>
            <Separator />
            <div className="p-4 bg-secondary/30 rounded-md">
              <p className="text-sm text-muted-foreground">Notification settings will be available here.</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Shield className="mr-2 h-5 w-5 text-accent" />
              Account Security (Placeholder)
            </h3>
            <Separator />
            <div className="p-4 bg-secondary/30 rounded-md">
              <p className="text-sm text-muted-foreground">Password change and other security options will be here.</p>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
