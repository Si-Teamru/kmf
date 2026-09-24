import type { CSSProperties, ReactNode, Ref } from 'react'

import { cn } from './cn'
import { Icon } from './Icon'
import { LinkCapsPlus } from './links'

/**
 * Info Chip (15:65): параметр проекта «Тип проекта / КВАРТИРА».
 * Desktop — прозрачный фон с рамкой color_gray-200; Mobile — фон color_gray-300 без рамки.
 * Ширину задаёт родитель: колонка 121px (desktop) или сетка 2×2 (mobile).
 */
export function InfoChip({
  label,
  value,
  className,
}: {
  label: ReactNode
  value: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-start gap-[7px] rounded-sm border border-transparent bg-gray-300 p-1 text-text-primary md:border-gray-200 md:bg-transparent',
        className,
      )}
    >
      <span className="rounded-xs bg-gray-chip px-1.5 pt-0.5 pb-1 text-chip-label">{label}</span>
      <span className="pl-1.5 text-chip-value uppercase">{value}</span>
    </div>
  )
}

/** Номер пункта «01»: активный — color_accent-red, остальные — color_accent-beige 80%. */
export function StepNumber({
  active = false,
  children,
}: {
  active?: boolean
  children: ReactNode
}) {
  return (
    <span className={cn('text-step-number', active ? 'text-accent-red' : 'text-accent-beige/80')}>
      {children}
    </span>
  )
}

/**
 * Feature Item (15:70): пункт преимуществ. Неактивный — color_text-muted (40%).
 * Desktop: text_feature-title + text_body-l, gap 12; Mobile: text_body-m, gap 8.
 */
export function FeatureItem({
  title,
  children,
  active = true,
  className,
}: {
  title: ReactNode
  children: ReactNode
  active?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-2 transition-colors duration-200 md:gap-3',
        active ? 'text-text-primary' : 'text-text-muted',
        className,
      )}
    >
      <p className="text-feature-title">{title}</p>
      <p className="text-body-m md:text-body-l">{children}</p>
    </div>
  )
}

/** Text Block (15:90): заголовок h5 + абзац body-l, gap 16 (mobile 8) — «Задача», «Решение». */
export function TextBlock({
  title,
  children,
  className,
}: {
  title: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-col gap-2 text-text-primary md:gap-4', className)}>
      <h3 className="text-h5">{title}</h3>
      <p className="text-body-l">{children}</p>
    </div>
  )
}

/**
 * Review (15:113): «ОТЗЫВ» (text_overline) → цитата (text_quote, части SemiBold) → подвал:
 * автор (text_author, капс) + роль (text_caption, 60%) слева, «Весь отзыв +» справа. Gap 16.
 * `lines` — обрезать цитату до N строк (многоточие); `more` — своя ссылка вместо «Весь отзыв +»
 * (`null` — без ссылки); `quoteRef` — чтобы снаружи проверить, обрезан ли текст.
 */
export function Review({
  text,
  author,
  role,
  href,
  lines,
  more,
  quoteRef,
  className,
}: {
  text: Array<{ text: string; strong?: boolean }>
  author: ReactNode
  role: ReactNode
  href?: string
  lines?: number
  more?: ReactNode
  quoteRef?: Ref<HTMLQuoteElement>
  className?: string
}) {
  return (
    <figure className={cn('flex flex-col gap-4 text-text-primary', className)}>
      <figcaption className="text-overline uppercase">Отзыв</figcaption>
      <blockquote
        ref={quoteRef}
        className={cn('text-quote', lines !== undefined && 'line-clamp-(--lines)')}
        style={lines ? ({ '--lines': lines } as CSSProperties) : undefined}
      >
        {text.map((part, i) =>
          part.strong ? (
            <strong key={i} className="font-semibold">
              {part.text}
            </strong>
          ) : (
            <span key={i}>{part.text}</span>
          ),
        )}
      </blockquote>
      <div className="flex items-end justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-author uppercase">{author}</span>
          <span className="text-caption opacity-60">{role}</span>
        </div>
        {more === undefined ? (
          <LinkCapsPlus {...(href ? { href } : {})}>Весь отзыв</LinkCapsPlus>
        ) : (
          more
        )}
      </div>
    </figure>
  )
}

export type SocialNetwork = 'telegram' | 'whatsapp' | 'instagram'

const socialLabels: Record<SocialNetwork, string> = {
  telegram: 'Telegram',
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
}

/** Social/* (доска 04): квадратная иконка соцсети 22 или 36px на фоне color_bg-stone-light. */
export function SocialLink({
  network,
  href,
  size = 36,
  className,
}: {
  network: SocialNetwork
  href: string
  size?: 22 | 36
  className?: string
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={socialLabels[network]}
      className={cn('inline-flex transition-opacity duration-200 hover:opacity-70', className)}
    >
      <Icon name={`${network}-${size}`} />
    </a>
  )
}

/** Designer Line (15:93): «Дизайнер Анна Иванова» + иконки соцсетей 22px, gap 8. */
export function DesignerLine({
  name,
  socials = [],
  className,
}: {
  name: ReactNode
  socials?: Array<{ network: SocialNetwork; href: string }>
  className?: string
}) {
  return (
    <div className={cn('flex items-center gap-2 text-body-static text-text-primary', className)}>
      <span>Дизайнер {name}</span>
      {socials.map((s) => (
        <SocialLink key={s.href} network={s.network} href={s.href} size={22} />
      ))}
    </div>
  )
}
