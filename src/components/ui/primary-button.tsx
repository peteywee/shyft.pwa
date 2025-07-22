// src/components/ui/primary-button.tsx
'use client'

import type { ButtonHTMLAttributes, ReactNode } from 'react'
import clsx from 'clsx'

export type PrimaryButtonProps = {
  /** Button label or nested markup */
  children: ReactNode
  /** Extra Tailwind/clsx classes, e.g. `w-full` */
  className?: string
} & ButtonHTMLAttributes<HTMLButtonElement>

/**
 * Business‑palette primary button.
 * Uses semantic Tailwind tokens defined in src/styles/theme.css
 */
export function PrimaryButton({
  children,
  className,
  ...rest
}: PrimaryButtonProps) {
  return (
    <button
      {...rest}
      className={clsx(
        'bg-primary text-on-primary hover:bg-blue-600 px-4 py-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
        className,
      )}
    >
      {children}
    </button>
  )
}
