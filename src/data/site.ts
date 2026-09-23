import type { SocialNetwork } from '@/components/ui'

/** Общие данные сайта. На этапе 2 переедут в глобалы Payload (Contacts, Header, Footer). */
export const site = {
  nav: [
    { label: 'Кейсы', href: '/projects' },
    { label: 'Контакты', href: '#contacts' },
  ],
  phone: { label: '+7 (926) 207-15-10', href: 'tel:+79262071510' },
  email: { label: 'kmfabrika33@gmail.com', href: 'mailto:kmfabrika33@gmail.com' },
  address: 'г. Мытищи, проспект Астрахова, д.10',
  cta: { label: 'Отправить проект', href: '#send-project' },
  /** Ссылки на профили пока не заданы — в макете только иконки. */
  socials: [
    { network: 'instagram', href: 'https://instagram.com/' },
    { network: 'whatsapp', href: 'https://wa.me/79262071510' },
    { network: 'telegram', href: 'https://t.me/' },
  ] satisfies Array<{ network: SocialNetwork; href: string }>,
  legal: [
    { label: 'Политика обработки персональных данных', href: '/privacy' },
    { label: 'Согласие на обработку персональных данных', href: '/consent' },
    { label: 'Политика использования текстовых файлов данных', href: '/cookies' },
  ],
  about: {
    text: 'Корпусная мебель из МДФ на заказ по цене ДСП. ',
    accent: 'Работа с дизайнерами и студиями',
  },
}
