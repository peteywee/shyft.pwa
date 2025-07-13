
import { WifiOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <WifiOff className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">You're Currently Offline</CardTitle>
          <CardDescription>
            It looks like your internet connection is unavailable. Some features may be limited, but you can still view previously loaded data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Please check your network connection. Once you're back online, the app will sync any pending changes.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
