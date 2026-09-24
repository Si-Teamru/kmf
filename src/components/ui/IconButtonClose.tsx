import type { ComponentPropsWithoutRef } from 'react'

import { cn } from './cn'

/**
 * Icon Button / Close (79:455): хит-зона 40×40, крестик 20×20, линия 1.2.
 * Light — color_text-primary на светлом фоне, Inverse — color_text-inverse на тёмном.
 * Hover по киту — opacity 70%.
 */
export function IconButtonClose({
  tone = 'light',
  className,
  ...props
}: { tone?: 'light' | 'inverse' } & Omit<ComponentPropsWithoutRef<'button'>, 'children'>) {
  return (
    <button
      type="button"
      aria-label="Закрыть"
      {...props}
      className={cn(
        'flex size-10 shrink-0 cursor-pointer items-center justify-center transition-opacity duration-200 hover:opacity-70',
        tone === 'light' ? 'text-text-primary' : 'text-text-inverse',
        className,
      )}
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
        <path d="M1 1l18 18M19 1 1 19" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    </button>
  )
}
