import Link from 'next/link'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'

type AnchorProps = { href: string } & Omit<ComponentPropsWithoutRef<typeof Link>, 'href'>
type ButtonProps = { href?: undefined } & ComponentPropsWithoutRef<'button'>

export type PressableProps = (AnchorProps | ButtonProps) & { children?: ReactNode }

/** Ссылка, если передан `href` (внешние — в новой вкладке), иначе `<button type="button">`. */
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
  const { type = 'button', ...rest } = props
  return <button type={type} {...rest} />
}
