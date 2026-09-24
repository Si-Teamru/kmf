'use client'

import Link from 'next/link'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'

import { StepDivider } from '@/components/blocks/StepDivider'
import { ButtonCard, cn, Icon, LinkCapsPlus, Toggle } from '@/components/ui'
import { site } from '@/data/site'
import {
  consentSnapshot,
  readConsent,
  saveConsent,
  subscribeConsent,
  type ConsentCategory,
} from '@/lib/consent'

import { lockScroll } from './lockScroll'

const privacy = site.legal[0]
const filesPolicy = site.legal[2]
const settingsHash = site.consentSettings.href.slice(1)

const categories: Array<{
  key: ConsentCategory | 'necessary'
  title: string
  body: string
}> = [
  {
    key: 'necessary',
    title: 'Основные текстовые файлы',
    body: 'Всегда включены. Необходимы для функционирования сайта, заполнения форм, сохранения настроек конфиденциальности и безопасности. Не могут быть отключены.',
  },
  {
    key: 'analytics',
    title: 'Аналитические текстовые файлы',
    body: 'Помогают понять, как посетители используют сайт, оценить эффективность контента и улучшить работу ресурса. Данные обезличены. Используются российские системы веб-аналитики.',
  },
  {
    key: 'advertising',
    title: 'Рекламные текстовые файлы',
    body: 'Позволяют оценивать эффективность рекламных кампаний и показывать релевантные предложения. Используются только российские рекламные технологии. Информация не передается за пределы РФ.',
  },
]

const policyLink = 'underline transition-opacity duration-200 hover:opacity-70'
/** Срез нижнего правого угла 32×20 (как у мобильной карточки проекта). */
const bevel = 'md:[clip-path:polygon(0_0,100%_0,100%_calc(100%-20px),calc(100%-32px)_100%,0_100%)]'

type Mode = 'closed' | 'banner' | 'settings'
type Choice = Record<ConsentCategory, boolean>

/**
 * Согласие на текстовые файлы данных (секция «Cookie — к вёрстке», страница 22:2).
 * Баннер показывается, пока нет сохранённого выбора (`lib/consent`), и не блокирует страницу.
 * «Принять» — все категории, «Отклонить» — только основные, «Настроить +» — панель настроек.
 * Панель открывается и ссылкой «Настройки текстовых файлов данных» в подвале (`#data-files-settings`).
 */
export function ConsentBanner() {
  // На сервере выбора «нет данных» ('server') — баннер появляется только в браузере, без расхождений гидрации.
  const snapshot = useSyncExternalStore(subscribeConsent, consentSnapshot, () => 'server')
  const decided = snapshot !== '' && readConsent() !== null
  const [panel, setPanel] = useState<Mode>('closed')
  const mode: Mode =
    panel === 'settings' ? 'settings' : snapshot === 'server' || decided ? 'closed' : 'banner'
  const [choice, setChoice] = useState<Choice>({ analytics: false, advertising: false })
  const dialog = useRef<HTMLDialogElement>(null)

  const openSettings = () => {
    const saved = readConsent()
    setChoice({ analytics: saved?.analytics ?? false, advertising: saved?.advertising ?? false })
    setPanel('settings')
  }

  useEffect(() => {
    const frame = location.hash.slice(1) === settingsHash ? requestAnimationFrame(openSettings) : 0
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return
      const a = (e.target as Element).closest?.('a[href]')
      if (!(a instanceof HTMLAnchorElement) || new URL(a.href).hash.slice(1) !== settingsHash)
        return
      // Перехват раньше next/link — хэш в адрес не пишем, просто открываем панель.
      e.preventDefault()
      e.stopPropagation()
      openSettings()
    }
    document.addEventListener('click', onClick, true)
    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('click', onClick, true)
    }
  }, [])

  useEffect(() => {
    const el = dialog.current
    if (!el) return
    const open = mode === 'settings'
    if (open && !el.open) el.showModal()
    else if (!open && el.open) el.close()
    return open ? lockScroll() : undefined
  }, [mode])

  const decide = (value: Choice) => {
    saveConsent(value)
    setPanel('closed')
  }
  const back = () => setPanel('closed')

  return (
    <>
      {mode === 'banner' && (
        <Banner
          onAccept={() => decide({ analytics: true, advertising: true })}
          onReject={() => decide({ analytics: false, advertising: false })}
          onSettings={openSettings}
        />
      )}
      <dialog
        ref={dialog}
        aria-label="Настройки текстовых файлов данных"
        onCancel={(e) => {
          e.preventDefault()
          back()
        }}
        onClick={(e) => e.target === e.currentTarget && back()}
        className="m-0 h-dvh max-h-none w-full max-w-none overflow-y-auto overscroll-contain bg-bg-cream p-0 backdrop:animate-[fade-in_0.3s_ease-out] backdrop:bg-bg-graphite/60 open:flex open:flex-col md:bg-transparent"
      >
        {mode === 'settings' && (
          <Settings
            choice={choice}
            onChange={setChoice}
            onBack={back}
            onSave={() => decide(choice)}
            onAcceptAll={() => decide({ analytics: true, advertising: true })}
            onRejectAll={() => decide({ analytics: false, advertising: false })}
          />
        )}
      </dialog>
    </>
  )
}

/**
 * Баннер. Desktop (md+): слева снизу, 24 от краёв, 560, p 32, gap 24, срез угла, тень 0 8 32 / 12%;
 * текст text_body-m; «Принять» (Dark) + «Отклонить» (Outline) 156, gap 8, «НАСТРОИТЬ +» справа.
 * Mobile: снизу на всю ширину, px 12, pt 16, pb 24, gap 16; текст text_body-l; кнопки делят
 * строку пополам, «НАСТРОИТЬ +» — ниже.
 */
function Banner({
  onAccept,
  onReject,
  onSettings,
}: {
  onAccept: () => void
  onReject: () => void
  onSettings: () => void
}) {
  return (
    <div
      role="region"
      aria-label="Согласие на текстовые файлы данных"
      className="fixed inset-x-0 bottom-0 z-40 animate-[popup-in_0.3s_ease-out] drop-shadow-[0_-4px_24px_rgb(0_0_0/0.12)] md:right-auto md:bottom-6 md:left-6 md:w-[560px] md:drop-shadow-[0_8px_32px_rgb(0_0_0/0.12)]"
    >
      <div className={cn('flex flex-col gap-4 bg-bg-cream px-3 pt-4 pb-6 md:gap-6 md:p-8', bevel)}>
        <p className="text-body-l text-text-primary md:text-body-m">
          Мы используем текстовые файлы данных и аналогичные технологии для обеспечения работы
          сайта, анализа посещаемости и улучшения качества услуг. Нажимая «Принять», вы соглашаетесь
          с обработкой данных в соответствии с{' '}
          <Link href={privacy.href} className={policyLink}>
            Политикой обработки персональных данных
          </Link>{' '}
          и{' '}
          <Link href={filesPolicy.href} className={policyLink}>
            Политикой использования текстовых файлов данных
          </Link>
          . Необязательные файлы можно отклонить или настроить.
        </p>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-4">
          <ButtonCard
            variant="dark"
            size="h-10 flex-1 md:w-[156px] md:flex-none"
            onClick={onAccept}
          >
            Принять
          </ButtonCard>
          <ButtonCard size="h-10 flex-1 md:w-[156px] md:flex-none" onClick={onReject}>
            Отклонить
          </ButtonCard>
          <LinkCapsPlus onClick={onSettings} className="basis-full md:ml-auto md:basis-auto">
            Настроить
          </LinkCapsPlus>
        </div>
      </div>
    </div>
  )
}

/**
 * Панель настроек. Desktop (md+): на месте баннера (слева снизу, 24 от краёв), 560, pt 24, pb 32,
 * px 32, gap 24, max-height 100vh−48 с прокруткой, срез угла; затемнение color_bg-graphite 60%.
 * Mobile: на весь экран, pt 16, px 12, gap 20, кнопки закреплены снизу (pt 16, pb 24, линия сверху):
 * «Принять все» + «Отклонить все» пополам, «Сохранить» на всю ширину.
 */
function Settings({
  choice,
  onChange,
  onBack,
  onSave,
  onAcceptAll,
  onRejectAll,
}: {
  choice: Choice
  onChange: (choice: Choice) => void
  onBack: () => void
  onSave: () => void
  onAcceptAll: () => void
  onRejectAll: () => void
}) {
  const [open, setOpen] = useState<Record<string, boolean>>({
    necessary: true,
    analytics: true,
    advertising: true,
  })
  const btn = 'h-10 w-full md:w-[156px]'
  return (
    <div
      className={cn(
        'flex min-h-full w-full shrink-0 animate-[popup-in_0.3s_ease-out] flex-col gap-5 bg-bg-cream px-3 pt-4 md:mt-auto md:mb-6 md:ml-6 md:max-h-[calc(100dvh-48px)] md:min-h-0 md:w-[560px] md:gap-6 md:overflow-y-auto md:px-8 md:pt-6 md:pb-8',
        bevel,
      )}
    >
      <button
        type="button"
        autoFocus
        onClick={onBack}
        className="flex cursor-pointer items-center gap-2 self-start transition-opacity duration-200 hover:opacity-70"
      >
        <Icon name="back-circle" className="rotate-180" />
        <span className="text-label-caps text-text-primary uppercase">Назад</span>
      </button>
      <h2 className="text-h3 text-text-heading uppercase">Настройки текстовых файлов данных</h2>
      <StepDivider short className="flex w-full" />
      <p className="text-body-l text-text-primary md:text-body-m">
        Текстовые файлы, необходимые для корректной работы сайта, всегда включены. Остальные
        категории можно настроить по вашему усмотрению. Подробная информация — в{' '}
        <Link href={filesPolicy.href} className={policyLink}>
          Политике использования текстовых файлов данных
        </Link>
      </p>
      <div className="border-b border-bg-stone">
        {categories.map(({ key, title, body }) => {
          const required = key === 'necessary'
          const on = required || choice[key]
          const statusId = `consent-${key}-status`
          return (
            <div key={key} className="flex flex-col gap-3 border-t border-bg-stone py-5">
              <button
                type="button"
                aria-expanded={open[key]}
                onClick={() => setOpen({ ...open, [key]: !open[key] })}
                className="flex cursor-pointer items-center gap-3 text-left"
              >
                <Icon name={open[key] ? 'minus-15' : 'plus-15'} />
                <span className="text-accordion-title text-text-primary">{title}</span>
              </button>
              <div className="flex items-center gap-3 pl-[27px]">
                <span id={statusId} className="text-caption text-text-secondary">
                  {required ? 'Всегда разрешено' : on ? 'Разрешено' : 'Запрещено'}
                </span>
                {!required && (
                  <Toggle
                    checked={on}
                    aria-label={title}
                    aria-describedby={statusId}
                    onChange={(e) => onChange({ ...choice, [key]: e.target.checked })}
                  />
                )}
              </div>
              {open[key] && (
                <p className="pl-[27px] text-body-l text-text-primary md:text-body-m">{body}</p>
              )}
            </div>
          )
        })}
      </div>
      <div className="sticky bottom-0 grid grid-cols-2 gap-2 border-t border-bg-stone bg-bg-cream pt-4 pb-6 md:static md:mt-0 md:flex md:border-0 md:p-0">
        <ButtonCard
          variant="dark"
          size={btn}
          onClick={onSave}
          className="order-last col-span-2 md:order-none"
        >
          Сохранить
        </ButtonCard>
        <ButtonCard size={btn} onClick={onAcceptAll}>
          Принять все
        </ButtonCard>
        <ButtonCard size={btn} onClick={onRejectAll}>
          Отклонить все
        </ButtonCard>
      </div>
    </div>
  )
}
