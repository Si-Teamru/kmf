import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import Link from 'next/link'

import { cn } from './cn'

/**
 * Form / Field (13:29): подпись + поле. Desktop поле 40px, Mobile 36px; gap 9.
 * Поле: белый фон, 1px color_bg-sand, без скругления, паддинг слева 9.
 * Фокус в макете не задан — по рекомендации кита обводка color_text-primary.
 */
export function FormField({
  label,
  className,
  id,
  name,
  ...inputProps
}: { label: ReactNode } & ComponentPropsWithoutRef<'input'>) {
  const inputId = id ?? name
  return (
    <div className={cn('flex w-full flex-col gap-[9px]', className)}>
      <label htmlFor={inputId} className="text-form-label text-text-primary">
        {label}
      </label>
      <input
        id={inputId}
        name={name}
        className="h-9 w-full border border-bg-sand bg-bg-white pr-1.5 pl-[9px] text-input text-text-primary transition-colors duration-200 outline-none placeholder:text-text-primary focus:border-text-primary md:h-10"
        {...inputProps}
      />
    </div>
  )
}

/**
 * Form / Upload (13:33): зона загрузки 98px, пунктир 1.5px color_bg-sand, фон color_gray-50.
 * Нативный input[type=file] растянут на всю зону — работает и клик, и перетаскивание файла.
 */
export function FormUpload({
  label,
  hint = 'Перетащите файл сюда',
  className,
  id,
  name,
  ...inputProps
}: { label: ReactNode; hint?: ReactNode } & Omit<ComponentPropsWithoutRef<'input'>, 'type'>) {
  const inputId = id ?? name
  return (
    <div className={cn('flex w-full flex-col gap-[9px]', className)}>
      <label htmlFor={inputId} className="text-form-label text-text-primary">
        {label}
      </label>
      <div className="relative flex h-[98px] w-full items-center justify-center border-[1.5px] border-dashed border-bg-sand bg-gray-50 transition-colors duration-200 focus-within:border-text-primary hover:border-text-primary">
        <span className="text-input text-text-primary">{hint}</span>
        <input
          id={inputId}
          name={name}
          type="file"
          className="absolute inset-0 cursor-pointer opacity-0"
          {...inputProps}
        />
      </div>
    </div>
  )
}

/**
 * Form / Consent (13:37): чекбокс 12×12 (обводка 1.5px color_border-checkbox) + текст 12px,
 * «обработку данных» — ссылка с подчёркиванием.
 */
export function FormConsent({
  policyHref = '/privacy',
  className,
  id = 'consent',
  ...inputProps
}: { policyHref?: string } & Omit<ComponentPropsWithoutRef<'input'>, 'type'>) {
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <input
        id={id}
        type="checkbox"
        className="size-3 shrink-0 cursor-pointer appearance-none border-[1.5px] border-border-checkbox bg-bg-white checked:bg-text-primary checked:shadow-[inset_0_0_0_1.5px_var(--bg-white)] focus-visible:outline focus-visible:outline-text-primary"
        {...inputProps}
      />
      <label htmlFor={id} className="cursor-pointer text-checkbox text-text-primary">
        Даю согласие на{' '}
        <Link
          href={policyHref}
          className="underline transition-opacity duration-200 hover:opacity-70"
        >
          обработку данных
        </Link>
      </label>
    </div>
  )
}
