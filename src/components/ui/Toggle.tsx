import type { ComponentPropsWithoutRef } from 'react'

import { cn } from './cn'

/**
 * Toggle (94:486): переключатель 36×20, ручка 16. Off — дорожка color_bg-stone,
 * On — color_accent-red, ручка белая. Переход 0.2s, фокус — обводка color_text-primary.
 * Нативный checkbox с role="switch", подпись передаётся через aria-label / aria-labelledby.
 */
export function Toggle({
  className,
  ...props
}: Omit<ComponentPropsWithoutRef<'input'>, 'type' | 'role'>) {
  return (
    <span className={cn('relative inline-flex h-5 w-9 shrink-0', className)}>
      <input
        type="checkbox"
        role="switch"
        className="peer absolute inset-0 z-10 cursor-pointer appearance-none rounded-full focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-text-primary"
        {...props}
      />
      <span className="absolute inset-0 rounded-full bg-bg-stone transition-colors duration-200 peer-checked:bg-accent-red" />
      <span className="absolute top-0.5 left-0.5 size-4 rounded-full bg-bg-white transition-transform duration-200 peer-checked:translate-x-4" />
    </span>
  )
}
