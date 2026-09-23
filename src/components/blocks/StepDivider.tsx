import { cn } from '@/components/ui'

/**
 * Step Divider (Desktop 17:130 / Mobile 17:183): flex, gap 12, min-h 16.
 * Слева серая линия (flex-1): точка ⌀5.33 в начале, линия 1px color_bg-stone 92%, стрелка 5×5.77 в конце.
 * Номер шага (text_step-number, accent-red) — опционально.
 * Справа красная линия 1px accent-red с точкой ⌀5.33: 497px (desktop) / 210px (mobile).
 * Сделано на CSS, а не растянутым SVG, чтобы точки и стрелка не искажались.
 */
export function StepDivider({ step, className }: { step?: string; className?: string }) {
  return (
    <div className={cn('flex min-h-4 w-full items-center gap-3', className)} aria-hidden>
      <span className="relative h-px flex-1 bg-bg-stone/92">
        <span className="absolute top-1/2 left-0 size-[5.33px] -translate-y-1/2 rounded-full bg-bg-stone/92" />
        <span className="absolute top-1/2 right-0 h-0 w-0 -translate-y-1/2 border-y-[2.887px] border-l-[5px] border-y-transparent border-l-bg-stone/92" />
      </span>
      {step && <span className="text-step-number text-accent-red">{step}</span>}
      <span className="relative h-px w-[210px] shrink-0 bg-accent-red md:w-[497px]">
        <span className="absolute top-1/2 left-0 size-[5.33px] -translate-y-1/2 rounded-full bg-accent-red" />
      </span>
    </div>
  )
}
