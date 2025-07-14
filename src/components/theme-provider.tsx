'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes';

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // To prevent hydration mismatch, we'll render nothing on the server.
    // The real content will appear once the component is mounted on the client.
    return null;
  }
  
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
