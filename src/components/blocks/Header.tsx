import Link from 'next/link'

import { Icon } from '@/components/ui'

import { HeaderDesktop } from './HeaderDesktop'

/**
 * Шапка сайта.
 * Desktop — `HeaderDesktop` (16:77 → Header / Compact 16:106 при скролле), фиксированная;
 * в потоке оставлено место 75px.
 * Header / Mobile (16:97): 56px, px 12 / py 12, логотип 32 + бургер 32.
 */
export function Header() {
  return (
    <header className="bg-bg-white md:h-[75px]">
      <HeaderDesktop />

      <div className="flex h-14 items-center justify-between p-3 md:hidden">
        <Link href="/" aria-label="KMF — на главную" className="shrink-0">
          <Icon name="logo-mobile-24" className="size-8" />
        </Link>
        {/* Раскрытое меню в макете не нарисовано — кнопка без панели до появления дизайна. */}
        <button type="button" aria-label="Меню" className="shrink-0">
          <Icon name="burger-mobile" className="size-8" />
        </button>
      </div>
    </header>
  )
}
