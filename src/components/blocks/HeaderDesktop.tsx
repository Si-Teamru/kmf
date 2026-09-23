'use client'

import { AnimatePresence, LayoutGroup, motion, useMotionValueEvent, useScroll } from 'motion/react'
import Link from 'next/link'
import { useState } from 'react'

import { cn, Icon, NavLink } from '@/components/ui'
import { site } from '@/data/site'

/** Порог скролла, после которого шапка сворачивается (≈ высота полной шапки). */
const COMPACT_AFTER = 80
const transition = { type: 'spring', stiffness: 380, damping: 36 } as const
const fade = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }

/**
 * Header / Desktop (16:77) ↔ Header / Compact (16:106), плавный переход по скроллу.
 *
 * Полная: 111px, белый фон, px 24 / py 30; слева логотип 51 + «Кейсы», «Контакты» (gap 24),
 * справа телефон + CTA-пилюля + красная стрелка (gap 24).
 * Компактная (как compact-bar в aside галереи, 23:121): от x = container-padding + 6,
 * ширина 454, без фона; логотип 41 + красная стрелка (gap 15) слева, Icon/Burger Desktop справа.
 * Логотип и стрелка — общие элементы (`layoutId`), поэтому они переезжают, а не появляются заново.
 */
export function HeaderDesktop() {
  const [compact, setCompact] = useState(false)
  const { scrollY } = useScroll()
  useMotionValueEvent(scrollY, 'change', (y) => {
    // Гистерезис, чтобы шапка не дёргалась на границе порога.
    if (!compact && y > COMPACT_AFTER) setCompact(true)
    else if (compact && y < COMPACT_AFTER / 2) setCompact(false)
  })

  const logo = (
    <motion.div layoutId="header-logo" transition={transition} className="shrink-0">
      <Link href="/" aria-label="KMF — на главную" className="block">
        <Icon name="logo-desktop-51" className={compact ? 'size-[41px]' : undefined} />
      </Link>
    </motion.div>
  )

  const arrow = (
    <motion.div layoutId="header-arrow" transition={transition} className="shrink-0">
      <Link
        href={site.cta.href}
        aria-label={site.cta.label}
        className="block transition-[filter] duration-200 hover:brightness-90"
      >
        <Icon name="cta-arrow-red" />
      </Link>
    </motion.div>
  )

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 hidden md:block">
      <LayoutGroup>
        <motion.div
          layout
          transition={transition}
          className={cn(
            'pointer-events-auto flex items-center justify-between transition-colors duration-300',
            compact
              ? 'absolute top-[35px] left-[calc(var(--layout-container-padding)+6px)] h-[41px] w-[454px] bg-transparent'
              : 'absolute inset-x-0 top-0 h-[111px] bg-bg-white px-6 py-[30px]',
          )}
        >
          {compact ? (
            <>
              <div className="flex items-center gap-[15px]">
                {logo}
                {arrow}
              </div>
              <motion.button
                type="button"
                aria-label="Меню"
                className="flex h-10 items-center"
                {...fade}
                transition={{ delay: 0.15 }}
              >
                <Icon name="burger-desktop" />
              </motion.button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-6">
                {logo}
                <AnimatePresence>
                  {site.nav.map((item) => (
                    <motion.div key={item.href} {...fade}>
                      <NavLink href={item.href}>{item.label}</NavLink>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              <div className="flex items-center gap-6">
                <motion.div {...fade}>
                  <NavLink href={site.phone.href}>{site.phone.label}</NavLink>
                </motion.div>
                {/* Button / CTA (12:10): пилюля + квадрат; квадрат — общий элемент с компактной шапкой. */}
                <div className="group flex items-center">
                  <motion.div {...fade}>
                    <Link
                      href={site.cta.href}
                      className="inline-flex h-[41px] items-center justify-center rounded-full border-[1.2px] border-text-button px-7 text-button-type whitespace-nowrap text-text-button transition-colors duration-200 hover:bg-text-button hover:text-text-inverse"
                    >
                      {site.cta.label}
                    </Link>
                  </motion.div>
                  {arrow}
                </div>
              </div>
            </>
          )}
        </motion.div>
      </LayoutGroup>
    </div>
  )
}
