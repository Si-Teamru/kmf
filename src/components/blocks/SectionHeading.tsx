import { cn } from '@/components/ui'

import { StepDivider } from './StepDivider'

/**
 * Section Heading (Desktop 17:138 / Mobile 17:147). Один DOM, раскладка — grid-template-areas.
 * Mobile: номер (text_numeral 40) + h2 в строку, gap 16; через 24 — Step Divider (красная 210).
 * xl: номер в колонке 160 + Step Divider (красная 497) в строку высотой 80, через 8 — h2 392
 * с отступом 158 (h2 на 48 ниже линии).
 * `step` — номер на линии: у карусели преимуществ он меняется вместе с активным пунктом.
 */
export function SectionHeading({
  number,
  title,
  step,
  className,
}: {
  number: string
  title: string
  step?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        'grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-6 px-3 [grid-template-areas:"num_title"_"line_line"] xl:grid-cols-[160px_1fr] xl:gap-x-0 xl:gap-y-2 xl:px-0 xl:[grid-template-areas:"num_line"_"._title"]',
        className,
      )}
    >
      <span className="text-numeral-type text-text-numeral [grid-area:num]" aria-hidden>
        {number}
      </span>
      <StepDivider step={step} className="-mr-3 flex [grid-area:line] xl:mr-0 xl:h-20" />
      <h2 className="w-[270px] max-w-full text-h2 text-text-heading uppercase [grid-area:title] xl:-ml-0.5 xl:w-[392px]">
        {title}
      </h2>
    </div>
  )
}
