
import type { Metadata, Viewport } from 'next';
import { Inter, Poppins } from 'next/font/google';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/auth-context';

import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-headline',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://shyftmain-53739509.web.app'),
  title: 'Shyft Scheduler',
  description: 'Shyft is a powerful and intuitive staff scheduling and management application designed to streamline workforce management for businesses of all sizes.',
  generator: 'Next.js',
  manifest: '/manifest.webmanifest',
  keywords: ['nextjs', 'pwa', 'next-pwa', 'staff scheduling', 'workforce management'],
  authors: [{ name: 'Shyft Team' }],
  icons: [
    { rel: 'apple-touch-icon', url: 'icons/icon-128x128.png' },
    { rel: 'icon', url: 'icons/icon-128x128.png' },
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Shyft Scheduler',
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "msapplication-config": "/icons/browserconfig.xml",
    "msapplication-TileColor": "#2B5797",
    "msapplication-tap-highlight": "no",
  }
}

export const viewport: Viewport = {
  initialScale: 1,
  width: 'device-width',
  viewportFit: 'cover',
  themeColor: '#0f172a',
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn('min-h-screen bg-background font-sans antialiased', inter.variable, poppins.variable)}>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
