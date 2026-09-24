import { cn } from '@/components/ui'

/**
 * Серая линия со стрелкой (Vector 64 в Step Divider и Slider Nav): точка ⌀5.33 в начале,
 * линия 1px color_bg-stone 92%, стрелка 5×5.77 в конце. Ширину задаёт className.
 * Сделано на CSS, а не растянутым SVG, чтобы точка и стрелка не искажались.
 */
export function ArrowLine({ className }: { className?: string }) {
  return (
    <span className={cn('relative h-px bg-bg-stone/92', className)} aria-hidden>
      <span className="absolute top-1/2 left-0 size-[5.33px] -translate-y-1/2 rounded-full bg-bg-stone/92" />
      <span className="absolute top-1/2 right-0 h-0 w-0 -translate-y-1/2 border-y-[2.887px] border-l-[5px] border-y-transparent border-l-bg-stone/92" />
    </span>
  )
}

/**
 * Step Divider (Desktop 17:130 / Mobile 17:183): flex, gap 12, min-h 16.
 * Слева серая линия (flex-1), затем номер шага (text_step-number, accent-red) — опционально,
 * справа красная линия 1px accent-red с точкой ⌀5.33: 497px (desktop) / 210px (mobile).
 */
export function StepDivider({
  step,
  stepHidden = false,
  short = false,
  className = 'flex w-full',
}: {
  step?: string
  /** Номер только держит место на линии — его рисует снаружи, например пункт карусели, приезжающий на линию. */
  stepHidden?: boolean
  /** Вариант Mobile (красная линия 210px) — и на десктопе, как в aside галереи (23:187). */
  short?: boolean
  /** Задаёт display и ширину (по умолчанию `flex w-full`). */
  className?: string
}) {
  return (
    <div className={cn('min-h-4 items-center gap-3', className)} aria-hidden>
      <ArrowLine className="flex-1" />
      {step && (
        <span className={cn('text-step-number text-accent-red', stepHidden && 'invisible')}>
          {step}
        </span>
      )}
      <span
        className={cn('relative h-px w-[210px] shrink-0 bg-accent-red', !short && 'md:w-[497px]')}
      >
        <span className="absolute top-1/2 left-0 size-[5.33px] -translate-y-1/2 rounded-full bg-accent-red" />
      </span>
    </div>
  )
}
