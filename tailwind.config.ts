
import type { Config } from 'tailwindcss'

export default {
  content: [
    './src/**/*.{ts,tsx}',
    './node_modules/@shadcn/**/*.{js,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        border:      'hsl(var(--border))',
        background:  'hsl(var(--background))',
        foreground:  'hsl(var(--foreground))',
        primary:     'hsl(var(--primary))',
        secondary:   'hsl(var(--secondary))'
      }
    }
  },
  plugins: []
} satisfies Config
