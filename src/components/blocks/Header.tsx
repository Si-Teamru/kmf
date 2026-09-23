import Link from 'next/link'

import { ButtonCta, Icon, NavLink } from '@/components/ui'
import { site } from '@/data/site'

/**
 * Header / Desktop (16:77): 111px, белый фон, px 24 / py 30, justify-between;
 * слева логотип 51 + пункты меню, справа телефон + CTA, gap 24 в обеих группах.
 * Header / Mobile (16:97): 62px, px 12 / py 19, логотип 24 + бургер 24.
 */
export function Header() {
  return (
    <header className="bg-bg-white">
      <div className="hidden h-[111px] items-center justify-between px-6 py-[30px] md:flex">
        <div className="flex items-center gap-6">
          <Link href="/" aria-label="KMF — на главную" className="shrink-0">
            <Icon name="logo-desktop-51" />
          </Link>
          {site.nav.map((item) => (
            <NavLink key={item.href} href={item.href}>
              {item.label}
            </NavLink>
          ))}
        </div>
        <div className="flex items-center gap-6">
          <NavLink href={site.phone.href}>{site.phone.label}</NavLink>
          <ButtonCta href={site.cta.href}>{site.cta.label}</ButtonCta>
        </div>
      </div>

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
