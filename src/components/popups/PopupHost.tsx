'use client'

import { useEffect, useState, type FormEvent, type ReactNode } from 'react'

import { StepDivider } from '@/components/blocks/StepDivider'
import { ButtonCta, FormConsent, FormField, FormUpload, NavLink } from '@/components/ui'
import { site } from '@/data/site'

import { Popup } from './Popup'

const popups = {
  'send-project': {
    label: 'Отправить проект',
    title: 'Отправьте проект, чтобы через 24 часа получить расчёт',
    lead: 'Приложите планировку или чертёж — рассчитаем стоимость и сроки изготовления. Нет чертежа — оставьте контакты, мы свяжемся и уточним детали.',
  },
  showroom: {
    label: 'Записаться в шоурум',
    title: 'Запишитесь в шоурум',
    lead: 'Посмотрите образцы фасадов, фурнитуры и материалов вживую и обсудите проект с менеджером. Перезвоним, чтобы подтвердить время визита.',
  },
} as const

type PopupKey = keyof typeof popups

const isPopupKey = (hash: string): hash is PopupKey => hash in popups

/**
 * Попапы «Отправить проект» (он же «Заказать») и «Записаться в шоурум».
 * Открываются любой ссылкой на `#send-project` / `#showroom` (шапка, CTA, карточки проектов)
 * и при заходе на страницу с таким хэшем; при закрытии хэш убирается из адреса.
 */
export function PopupHost() {
  const [open, setOpen] = useState<PopupKey | null>(null)

  useEffect(() => {
    const fromHash = () => {
      const hash = location.hash.slice(1)
      if (isPopupKey(hash)) setOpen(hash)
    }
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return
      const a = (e.target as Element).closest?.('a[href]')
      if (!(a instanceof HTMLAnchorElement)) return
      const url = new URL(a.href)
      const hash = url.hash.slice(1)
      if (url.pathname !== location.pathname || !isPopupKey(hash)) return
      // Перехват в фазе захвата — раньше next/link, который сам сменил бы хэш без hashchange.
      e.preventDefault()
      e.stopPropagation()
      history.replaceState(history.state, '', `#${hash}`)
      setOpen(hash)
    }
    fromHash()
    window.addEventListener('hashchange', fromHash)
    document.addEventListener('click', onClick, true)
    return () => {
      window.removeEventListener('hashchange', fromHash)
      document.removeEventListener('click', onClick, true)
    }
  }, [])

  const close = () => {
    setOpen(null)
    if (isPopupKey(location.hash.slice(1))) {
      history.replaceState(history.state, '', location.pathname + location.search)
    }
  }

  return (
    <>
      {(Object.keys(popups) as PopupKey[]).map((key) => (
        <Popup
          key={key}
          open={open === key}
          onClose={close}
          label={popups[key].label}
          className="md:w-[665px] xl:w-[1120px]"
        >
          <FormLayout {...popups[key]} contacts={key === 'showroom' ? 'showroom' : 'direct'}>
            {key === 'showroom' ? <ShowroomFields /> : <SendProjectFields />}
          </FormLayout>
        </Popup>
      ))}
    </>
  )
}

/**
 * Панель формы. Mobile (до md): px 12, pt 8, pb 40, gap 24 — заголовок, форма, контакты.
 * md: p 64, одна колонка 537. xl (1440): popup__aside 358 | линия 1px color_bg-stone | форма 537,
 * gap 48; контакты прижаты к низу колонки (pt 40). Порядок блоков разный — grid-template-areas.
 */
function FormLayout({
  title,
  lead,
  contacts,
  children,
}: {
  title: string
  lead: string
  contacts: 'direct' | 'showroom'
  children: ReactNode
}) {
  return (
    <div className="grid grid-cols-1 gap-6 px-3 pt-2 pb-10 [grid-template-areas:'head'_'form'_'contacts'] md:p-16 xl:grid-cols-[358px_1px_537px] xl:grid-rows-[auto_1fr] xl:gap-x-12 xl:gap-y-0 xl:[grid-template-areas:'head_line_form'_'contacts_line_form']">
      <div className="flex flex-col gap-6 [grid-area:head]">
        <h2 className="pt-1 pr-[52px] text-h2 text-text-heading uppercase md:pt-0 xl:pr-0">
          {title}
        </h2>
        <StepDivider short className="flex w-full" />
        <p className="text-body-l text-text-primary">{lead}</p>
      </div>
      <span className="hidden bg-bg-stone [grid-area:line] xl:block" aria-hidden />
      <div className="flex flex-col gap-2 self-end [grid-area:contacts] xl:pt-10">
        <span className="text-form-label text-text-secondary">
          {contacts === 'showroom' ? 'Адрес шоурума' : 'Или свяжитесь напрямую'}
        </span>
        {contacts === 'showroom' && (
          <span className="text-nav-link text-text-primary">{site.address}</span>
        )}
        <NavLink href={site.phone.href}>{site.phone.label}</NavLink>
        {contacts === 'direct' && <NavLink href={site.email.href}>{site.email.label}</NavLink>}
      </div>
      <div className="[grid-area:form]">{children}</div>
    </div>
  )
}

/** Отправка заявок появится вместе с CMS (этап 2), пока форма только проверяет поля. */
const onSubmit = (e: FormEvent<HTMLFormElement>) => e.preventDefault()

function SendProjectFields() {
  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      <FormField
        label="Имя"
        name="name"
        id="sp-name"
        placeholder="Ваше имя"
        autoComplete="name"
        required
      />
      <FormField
        label="Email"
        name="email"
        id="sp-email"
        type="email"
        placeholder="example@site.com"
        autoComplete="email"
      />
      <FormField
        label="Телефон (для связи)"
        name="phone"
        id="sp-phone"
        type="tel"
        placeholder="+7 (___) ___-__-__"
        autoComplete="tel"
        required
      />
      <FormField
        label="Дополнительный метод связи (соц. сети, мессенджеры)"
        name="messenger"
        id="sp-messenger"
        placeholder="Телеграм - @designer / VK - @designer"
      />
      <FormUpload label="Загрузить планировку или чертеж" name="file" id="sp-file" />
      <FormField
        label="Бюджет (необязательно)"
        name="budget"
        id="sp-budget"
        placeholder="Например, 200 000 — 400 000 ₽"
      />
      <FormConsent id="sp-consent" required />
      <ButtonCta type="submit" fullWidth>
        Отправить проект
      </ButtonCta>
    </form>
  )
}

function ShowroomFields() {
  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      <FormField
        label="Имя"
        name="name"
        id="sr-name"
        placeholder="Ваше имя"
        autoComplete="name"
        required
      />
      <FormField
        label="Телефон (для связи)"
        name="phone"
        id="sr-phone"
        type="tel"
        placeholder="+7 (___) ___-__-__"
        autoComplete="tel"
        required
      />
      <FormField
        label="Удобная дата и время (необязательно)"
        name="time"
        id="sr-time"
        placeholder="Например, суббота после 12:00"
      />
      <FormConsent id="sr-consent" required />
      <ButtonCta type="submit" fullWidth>
        Записаться в шоурум
      </ButtonCta>
    </form>
  )
}
