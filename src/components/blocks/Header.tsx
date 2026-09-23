import Link from 'next/link'

import { Icon } from '@/components/ui'

import { HeaderDesktop } from './HeaderDesktop'

/**
 * Шапка сайта.
 * Desktop — `HeaderDesktop` (16:77 → Header / Compact 16:106 при скролле), фиксированная;
 * в потоке оставлено место 111px.
 * Header / Mobile (16:97): 62px, px 12 / py 19, логотип 24 + бургер 24.
 */
export function Header() {
  return (
    <header className="bg-bg-white md:h-[111px]">
      <HeaderDesktop />

      <div className="flex h-[62px] items-center justify-between px-3 py-[19px] md:hidden">
        <Link href="/" aria-label="KMF — на главную" className="shrink-0">
          <Icon name="logo-mobile-24" />
        </Link>
        {/* Раскрытое меню в макете не нарисовано — кнопка без панели до появления дизайна. */}
        <button type="button" aria-label="Меню" className="shrink-0">
          <Icon name="burger-mobile" />
        </button>
      </div>
    </header>
  )
}
