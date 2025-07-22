// src/app/example/page.tsx
'use client'                           // needed because the button handles onClick

import { PrimaryButton } from '@/components/ui/primary-button'

export default function ExamplePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-muted">
      <h1 className="text-2xl font-semibold text-foreground">
        Primary Button Demo
      </h1>

      <PrimaryButton onClick={() => console.log('clicked')}>
        Save changes
      </PrimaryButton>
    </main>
  )
}
