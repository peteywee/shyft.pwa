'use client'

import { usePWAInstall } from '@/hooks/use-pwa-install'
import { Button } from '@/components/ui/button'

export function PWAInstallButton() {
  const { installable, install } = usePWAInstall()

  if (!installable) return null

  return (
    <Button onClick={install} variant="outline" size="sm">
      Install App
    </Button>
  )
}
