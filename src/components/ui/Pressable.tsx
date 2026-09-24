import Link from 'next/link'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'

import { cn } from './cn'

type AnchorProps = { href: string } & Omit<ComponentPropsWithoutRef<typeof Link>, 'href'>
type ButtonProps = { href?: undefined } & ComponentPropsWithoutRef<'button'>

export type PressableProps = (AnchorProps | ButtonProps) & { children?: ReactNode }

/**
 * Ссылка, если передан `href` (внешние — в новой вкладке), иначе `<button type="button">`.
 * У `<button>` курсор-указатель (Tailwind preflight ставит кнопкам default), у disabled — обычный.
 */
export function Pressable(props: PressableProps) {
  if (props.href !== undefined) {
    const { href, ...rest } = props
    const external = /^(https?:|mailto:|tel:)/.test(href)
    if (external) {
      const isWeb = href.startsWith('http')
      return (
        <a
          href={href}
          {...(isWeb ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          {...(rest as ComponentPropsWithoutRef<'a'>)}
        />
      )
    }
    return <Link href={href} {...rest} />
  }
  const { type = 'button', className, ...rest } = props
  return (
    <button
      type={type}
      className={cn('cursor-pointer disabled:cursor-default', className)}
      {...rest}
    />
  )
}
