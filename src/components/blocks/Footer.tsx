import Link from 'next/link'

import { Icon, SocialLink } from '@/components/ui'
import { site } from '@/data/site'

const link = 'transition-opacity duration-200 hover:opacity-70'

/**
 * Подвал. Фон color_bg-cream — продолжает полосу из секции «Реализованные проекты».
 *
 * Footer / Desktop (16:118): pt 120, pb 100, pl 80, pr 75, justify-between.
 *   Слева: «СОЦ. СЕТИ» (text_label-caps) → иконки 36 (gap 8, pt 16, pb 88) →
 *   контакты text_caption, gap 16: почта + телефон, адрес, «Политика обработки персональных данных»,
 *   «Политика использования текстовых файлов данных», «Настройки текстовых файлов данных».
 *   Справа: логотип 60 + описание text_footer-about 265 (часть — Medium), gap 13.
 * Footer / Mobile (16:149): pt 80, pb 24, px 12, колонка gap 40 — логотип + описание 211,
 *   соцсети (gap 16), контакты (gap 8), 3 юридические ссылки + «Настройки текстовых файлов данных»
 *   (gap 8), сноска text_legal 50%,
 *   «Сделано в si-team».
 * Переключение на md: десктопная раскладка помещается уже с 768.
 */
export function Footer() {
  const about = (
    <p className="text-footer-about text-text-primary">
      {site.about.text}
      <span className="font-medium">{site.about.accent}</span>
    </p>
  )
  const socials = (
    <div className="flex gap-2">
      {site.socials.map((s) => (
        <SocialLink key={s.network} network={s.network} href={s.href} />
      ))}
    </div>
  )
  const logo = (
    <Link href="/" aria-label="KMF — на главную" className="shrink-0">
      <Icon name="logo-footer-60" />
    </Link>
  )

  return (
    <footer id="contacts" className="bg-bg-cream text-text-primary">
      {/* Desktop */}
      <div className="hidden items-start justify-between pt-[120px] pr-[75px] pb-[100px] pl-container-padding md:flex">
        <div className="flex flex-col items-start">
          <p className="text-label-caps uppercase">Соц. сети</p>
          <div className="pt-4 pb-[88px]">{socials}</div>
          <div className="flex flex-col items-start gap-4 text-caption">
            <p>
              <a href={site.email.href} className={link}>
                {site.email.label}
              </a>
              <br />
              <a href={site.phone.href} className={link}>
                {site.phone.label}
              </a>
            </p>
            <p>{site.address}</p>
            <Link href={site.legal[0].href} className={link}>
              Политика обработки
              <br />
              персональных данных
            </Link>
            <Link href={site.legal[2].href} className={link}>
              Политика использования
              <br />
              текстовых файлов данных
            </Link>
            <a href={site.consentSettings.href} className={link}>
              Настройки текстовых
              <br />
              файлов данных
            </a>
          </div>
        </div>
        <div className="flex items-start gap-[13px]">
          {logo}
          <div className="w-[265px]">{about}</div>
        </div>
      </div>

      {/* Mobile */}
      <div className="flex flex-col items-start gap-10 px-3 pt-20 pb-6 md:hidden">
        <div className="flex items-start gap-[13px]">
          {logo}
          <div className="w-[211px]">{about}</div>
        </div>
        <div className="flex flex-col gap-4">
          <p className="text-label-caps uppercase">Соц. сети</p>
          {socials}
        </div>
        <div className="flex flex-col items-start gap-2 text-caption">
          <p>
            <a href={site.email.href} className={link}>
              {site.email.label}
            </a>
            <br />
            <a href={site.phone.href} className={link}>
              {site.phone.label}
            </a>
          </p>
          <p>{site.address}</p>
        </div>
        <nav
          aria-label="Юридическая информация"
          className="flex flex-col items-start gap-2 text-caption"
        >
          {site.legal.map((item) => (
            <Link key={item.href} href={item.href} className={link}>
              {item.label}
            </Link>
          ))}
          <a href={site.consentSettings.href} className={link}>
            {site.consentSettings.label}
          </a>
        </nav>
        <p className="text-legal opacity-50">
          *Instagram и WhatsApp входят в состав организации Meta
          <br />
          запрещенной на территории Российской Федерации
        </p>
        <p className="text-caption">Сделано в si-team</p>
      </div>
    </footer>
  )
}
