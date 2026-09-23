import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'

import {
  ButtonCard,
  ButtonCta,
  DesignerLine,
  FeatureItem,
  FormConsent,
  FormField,
  FormUpload,
  Icon,
  icons,
  InfoChip,
  LinkArrow,
  LinkCapsDot,
  LinkCapsPlus,
  LinkViewAll,
  LinkWatchVideo,
  NavLink,
  SocialLink,
  StepNumber,
  TextBlock,
  type IconName,
} from '@/components/ui'

export const metadata: Metadata = {
  title: 'UI-kit — KMF',
  robots: { index: false, follow: false },
}

/** Витрина компонентов для сверки с досками 04–07 UI-kit в Figma. Только для разработки. */
export default function UiKitPage() {
  if (process.env.NODE_ENV === 'production') notFound()

  return (
    <div className="flex flex-col gap-14 px-container-padding py-20">
      <h1 className="text-h1">UI-kit</h1>

      <Board title="04 · Логотип и иконки">
        <div className="flex flex-wrap items-end gap-10">
          {(Object.keys(icons) as IconName[]).map((name) => (
            <figure key={name} className="flex flex-col items-start gap-3">
              <span
                className={name === 'plus-11' || name === 'enlarge' ? 'bg-bg-graphite p-3' : ''}
              >
                <Icon name={name} />
              </span>
              <figcaption className="text-caption text-text-secondary">{name}</figcaption>
            </figure>
          ))}
        </div>
      </Board>

      <Board title="05 · Кнопки и ссылки">
        <Row label="Button / CTA">
          <ButtonCta href="#">Отправить проект</ButtonCta>
          <ButtonCta arrow="outline">Заказать проект</ButtonCta>
        </Row>
        <Row label="Button / Card">
          <ButtonCard href="#">Смотреть кейс</ButtonCard>
          <ButtonCard variant="dark">Заказать</ButtonCard>
          <ButtonCard variant="sand" href="#">
            Все проекты
          </ButtonCard>
        </Row>
        <Row label="Ссылки">
          <LinkArrow href="#">Записаться в шоурум</LinkArrow>
          <LinkArrow href="#" tone="red">
            Записаться в шоурум
          </LinkArrow>
          <LinkViewAll href="#">Посмотреть все фото</LinkViewAll>
          <LinkCapsDot href="#">Все проекты</LinkCapsDot>
          <LinkCapsPlus>Весь отзыв</LinkCapsPlus>
          <span className="bg-bg-graphite p-4">
            <LinkWatchVideo>Смотреть видео</LinkWatchVideo>
          </span>
          <NavLink href="#">Кейсы</NavLink>
        </Row>
      </Board>

      <Board title="06 · Формы">
        <div className="bg-bg-cream p-8">
          <form className="flex w-full max-w-[537px] flex-col gap-8">
            <div className="flex flex-col gap-[13px]">
              <FormField label="Имя" name="name" placeholder="Ваше имя" />
              <FormField label="Email" name="email" type="email" placeholder="example@site.com" />
              <FormField
                label="Телефон (для связи)"
                name="phone"
                type="tel"
                placeholder="+79854875521"
              />
              <FormField
                label="Дополнительный метод связи (соц. сети, мессенджеры)"
                name="contact"
                placeholder="Телеграм - @designer / VK - @designer"
              />
              <FormUpload label="Загрузить планировку или чертеж" name="file" />
              <FormField
                label="Бюджет (необязательно)"
                name="budget"
                placeholder="Например, 200 000 — 400 000 ₽"
              />
              <FormConsent name="consent" />
            </div>
            <ButtonCta fullWidth>Отправить проект</ButtonCta>
          </form>
        </div>
      </Board>

      <Board title="07 · Контент-блоки">
        <Row label="Info Chip">
          <InfoChip label="Тип проекта" value="Квартира" className="w-[121px]" />
          <InfoChip label="Площадь" value="14 м²" className="w-[121px]" />
        </Row>
        <Row label="Feature Item + Step Number">
          <div className="flex gap-6">
            <StepNumber active>01</StepNumber>
            <StepNumber>02</StepNumber>
          </div>
          <FeatureItem
            title="Берёмся за проекты, за которые другие не берутся"
            className="w-[317px]"
          >
            Сложная геометрия, нестандартные пространства, уникальные решения. Опыт команды
            позволяет реализовать то, от чего другие производители отказались.
          </FeatureItem>
          <FeatureItem
            active={false}
            title="Берёмся за проекты, за которые другие не берутся"
            className="w-[317px]"
          >
            Сложная геометрия, нестандартные пространства, уникальные решения.
          </FeatureItem>
        </Row>
        <Row label="Text Block, Designer Line, Social">
          <TextBlock title="Задача" className="w-[334px]">
            Создать кухню в стиле лофт для квартиры 14 м² с нестандартным углом и скошенной стеной.
          </TextBlock>
          <DesignerLine
            name="Анна Иванова"
            socials={[{ network: 'telegram', href: 'https://t.me/example' }]}
          />
          <SocialLink network="instagram" href="https://instagram.com" />
          <SocialLink network="whatsapp" href="https://wa.me/" />
          <SocialLink network="telegram" href="https://t.me/" />
        </Row>
      </Board>
    </div>
  )
}

function Board({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-8">
      <h2 className="border-b border-gray-200 pb-4 text-h2">{title}</h2>
      {children}
    </section>
  )
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-h6 text-text-secondary">{label}</h3>
      <div className="flex flex-wrap items-center gap-12">{children}</div>
    </div>
  )
}
