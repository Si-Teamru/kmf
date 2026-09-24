'use client'

import { AnimatePresence, LayoutGroup, motion, useMotionValueEvent, useScroll } from 'motion/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, type ReactNode } from 'react'

import { ArrowSquare, cn, Icon, NavLink } from '@/components/ui'
import { site } from '@/data/site'

/**
 * Шапка сворачивается, когда верх элемента с `data-header-compact` доходит до верха экрана
 * (на странице проекта — секция галереи: к этому моменту intro и план уже прокручены).
 * На страницах без маркера — после скролла на высоту полной шапки.
 */
const COMPACT_AFTER = 80
/** Гистерезис, чтобы шапка не дёргалась на границе порога. */
const HYSTERESIS = 40

/** Сколько пикселей осталось проскроллить до сворачивания (≤ 0 — порог пройден). */
function distanceToCompact(scrollY: number) {
  const marker = document.querySelector('[data-header-compact]')
  return marker ? marker.getBoundingClientRect().top : COMPACT_AFTER - scrollY
}
const transition = { type: 'spring', stiffness: 380, damping: 36 } as const
const fade = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }

/**
 * Header / Desktop (16:77) ↔ Header / Compact (16:106), плавный переход по скроллу.
 *
 * Полная: 75px, белый фон, px 24 / py 12; слева логотип 51 + «Проекты», «Контакты» (gap 24),
 * справа телефон + CTA-пилюля + красная стрелка (gap 24).
 * Компактная (как compact-bar в aside галереи, 23:121): от x = container-padding + 6,
 * ширина 454, без фона; логотип 41 + красная стрелка (gap 15) слева, Icon/Burger Desktop справа.
 * Логотип и стрелка — общие элементы (`layoutId`), поэтому они переезжают, а не появляются заново.
 */
export function HeaderDesktop() {
  const home = usePathname() === '/'
  const [compact, setCompact] = useState(false)
  const { scrollY } = useScroll()
  useMotionValueEvent(scrollY, 'change', (y) => {
    const distance = distanceToCompact(y)
    if (!compact && distance <= 0) setCompact(true)
    else if (compact && distance > HYSTERESIS) setCompact(false)
  })

  const logo = (
    <motion.div layoutId="header-logo" transition={transition} className="shrink-0">
      <Link href="/" aria-label="KMF — на главную" className="block">
        <Icon name="logo-desktop-51" className={compact && !home ? 'size-[41px]' : undefined} />
      </Link>
    </motion.div>
  )

  const arrow = (
    <motion.div layoutId="header-arrow" transition={transition} className="shrink-0">
      <Link href={site.cta.href} aria-label={site.cta.label} className="group block">
        <ArrowSquare variant="red" />
      </Link>
    </motion.div>
  )

  if (home) {
    return (
      <div className="pointer-events-none fixed inset-x-0 top-0 z-50 hidden md:block">
        <HomeBar compact={compact} logo={logo} arrow={arrow} />
      </div>
    )
  }

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
              : 'absolute inset-x-0 top-0 h-[75px] bg-bg-white px-6 py-3',
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
                      className="inline-flex h-[41px] items-center justify-center rounded-full border-[1.2px] border-text-button px-7 text-button-type whitespace-nowrap text-text-button transition-colors duration-200 group-hover:border-accent-red group-hover:bg-accent-red group-hover:text-text-inverse"
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

/** Пункты меню и телефон уезжают к центру (в иконку меню) — сдвиг по x. */
const toCenter = (dx: number) => ({
  initial: { opacity: 0, x: dx },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: dx },
  transition: { duration: 0.35, ease: 'easeInOut' as const },
})

/**
 * Шапка главной (111:7 → compact-bar 112:77). Прозрачная, поверх первого экрана: лого на 30 от верха.
 * При прокрутке лого и кнопка остаются по краям (от кнопки остаётся красная стрелка), а «Проекты»,
 * «Контакты» и телефон съезжаются в центр, исчезают и превращаются в иконку меню (Icon/Burger Desktop).
 */
function HomeBar({
  compact,
  logo,
  arrow,
}: {
  compact: boolean
  logo: ReactNode
  arrow: ReactNode
}) {
  return (
    <div className="pointer-events-auto absolute inset-x-6 top-[30px] flex h-[51px] items-center justify-between">
      <div className="flex items-center gap-6">
        {logo}
        <AnimatePresence initial={false}>
          {!compact &&
            site.nav.map((item) => (
              <motion.div key={item.href} {...toCenter(160)}>
                <NavLink href={item.href}>{item.label}</NavLink>
              </motion.div>
            ))}
        </AnimatePresence>
      </div>

      <AnimatePresence initial={false}>
        {compact && (
          <motion.button
            key="menu"
            type="button"
            aria-label="Меню"
            className="absolute left-1/2 flex h-10 -translate-x-1/2 items-center"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.25, delay: 0.2 }}
          >
            <Icon name="burger-desktop" />
          </motion.button>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-6">
        <AnimatePresence initial={false}>
          {!compact && (
            <motion.div key="phone" {...toCenter(-160)}>
              <NavLink href={site.phone.href}>{site.phone.label}</NavLink>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="group flex items-center">
          <AnimatePresence initial={false}>
            {!compact && (
              <motion.div key="cta" {...toCenter(-120)}>
                <Link
                  href={site.cta.href}
                  className="inline-flex h-[41px] items-center justify-center rounded-full border-[1.2px] border-text-button px-7 text-button-type whitespace-nowrap text-text-button transition-colors duration-200 group-hover:border-accent-red group-hover:bg-accent-red group-hover:text-text-inverse"
                >
                  {site.cta.label}
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
          {arrow}
        </div>
      </div>
    </div>
  )
}
