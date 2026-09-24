import Image from 'next/image'

import { ButtonCard, cn } from '@/components/ui'
import type { ProjectCardData } from '@/data/projects'
import { asset } from '@/lib/asset'
import { site } from '@/data/site'

const background: Record<ProjectCardData['color'], string> = {
  sand: 'bg-bg-sand',
  gray: 'bg-gray-300',
  stone: 'bg-bg-stone',
}

/**
 * Project Card (14:119). Mobile 314×478, p 16, content gap 16 (фото 282, текст gap 16,
 * мета text_meta-caps color_text-secondary), кнопки 140. Desktop (xl) 418×567, p 16/16/32,
 * content gap 24 (фото 342, текст gap 8, мета color_text-button), кнопки 156.
 * Контент и кнопки разнесены space-between. Срез нижнего правого угла — clip-path из описания кита:
 * mobile 32×20 (не заходит на «Заказать»), desktop 101×65 (от 88.5% высоты до 76% ширины).
 */
export function ProjectCard({ card, className }: { card: ProjectCardData; className?: string }) {
  return (
    <article
      className={cn(
        'relative flex h-[478px] w-[314px] shrink-0 flex-col justify-between p-4 [clip-path:polygon(0_0,100%_0,100%_calc(100%-20px),calc(100%-32px)_100%,0_100%)] xl:h-[567px] xl:w-[418px] xl:pb-8 xl:[clip-path:polygon(0_0,100%_0,100%_88.5%,76%_100%,0_100%)]',
        background[card.color],
        className,
      )}
    >
      <div className="flex flex-col gap-4 xl:gap-6">
        <div className="relative h-[282px] w-full overflow-hidden xl:h-[342px]">
          <Image
            src={asset(card.photo.src)}
            alt={card.photo.alt}
            fill
            sizes="(min-width: 1280px) 386px, 282px"
            className="object-cover"
            style={
              card.photo.objectPosition ? { objectPosition: card.photo.objectPosition } : undefined
            }
          />
        </div>
        <div className="flex flex-col gap-4 xl:gap-2">
          <h3 className="text-h4 text-text-primary">{card.title}</h3>
          <p className="text-meta-caps text-text-secondary uppercase xl:text-text-button">
            {card.meta}
          </p>
        </div>
      </div>
      <div className="flex">
        <ButtonCard {...(card.href ? { href: card.href } : {})} size="h-10 w-[140px] xl:w-[156px]">
          Смотреть кейс
        </ButtonCard>
        <ButtonCard href={site.cta.href} variant="dark" size="h-10 w-[140px] xl:w-[156px]">
          Заказать
        </ButtonCard>
      </div>
    </article>
  )
}
