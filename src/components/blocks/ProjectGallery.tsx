import Image from 'next/image'

import { asset } from '@/lib/asset'

import { Icon, LinkCapsDot, Review } from '@/components/ui'
import type { GalleryItem, Project } from '@/data/projects'

import { StepDivider } from './StepDivider'
import { VideoTile } from './VideoTile'

const title = 'Галерея проекта'

/**
 * Галерея проекта (section-gallery). Desktop 23:118, Mobile 27:460.
 * Раскладки сильно отличаются (липкая колонка vs горизонтальная лента), поэтому две ветки
 * разметки, переключение на xl (1280): 460 + 24 + колонка медиа не помещаются уже.
 */
export function ProjectGallery({ project }: { project: Project }) {
  return (
    <section aria-label={title}>
      <DesktopGallery project={project} />
      <MobileGallery project={project} />
    </section>
  )
}

/**
 * Desktop (23:118): pt section-gap; container — pl container-padding, gap 24, items-start;
 * gallery__aside 460 (sticky) | gallery__media 876 (gap 12), колонка медиа прижата к правому краю.
 *
 * aside прилипает к НИЗУ экрана (sticky bottom-0 + self-end): пока секция входит в экран,
 * он стоит в начале колонки, дальше держится у нижнего края, пока не закончится галерея.
 * В макете в aside сверху compact-bar (pt 70 + 41) — её роль играет плавающая шапка,
 * место под неё сохранено отступом 111, чтобы координаты остальных элементов совпадали.
 * Step Divider (23:187): absolute, x 0, y section-gap + 38, ширина 564, вариант Mobile (без номера).
 */
function DesktopGallery({ project }: { project: Project }) {
  return (
    <div className="relative hidden pt-section-gap xl:block">
      <StepDivider
        short
        className="absolute top-[calc(var(--layout-section-gap)+38px)] left-0 flex w-[564px]"
      />
      <div className="flex items-start gap-6 pl-container-padding">
        <aside className="sticky bottom-0 flex w-[460px] shrink-0 flex-col self-end pt-[111px]">
          <h2 className="pt-[53px] pl-1.5 text-h3 text-text-primary uppercase">{title}</h2>
          {project.review && (
            <div className="pt-[111px]">
              <Review {...project.review} className="w-[350px]" />
            </div>
          )}
          <div className="flex justify-end pt-[74px]">
            <LinkCapsDot href="/projects">Все проекты</LinkCapsDot>
          </div>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          {project.gallery.map((item, i) => (
            <MediaTile
              key={i}
              item={item}
              sizes="(min-width: 1280px) 876px, 100vw"
              className="aspect-[876/564] w-full"
            />
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * Mobile (27:460): pt section-gap, gap 32.
 * gallery__head — pl container-padding, pr 16: заголовок (h3, капс) + Swipe Hint.
 * gallery__media — горизонтальная лента от края экрана, плитки 351×225, gap 4.
 * gallery__review — px container-padding, gap 40: отзыв + «Все проекты».
 * В макете в ленте только 2 видео; фото добавлены туда же, иначе на мобильном их не увидеть.
 */
function MobileGallery({ project }: { project: Project }) {
  return (
    <div className="flex flex-col gap-8 pt-section-gap xl:hidden">
      <div className="flex items-center justify-between pr-4 pl-container-padding">
        <h2 className="text-h3 text-text-primary uppercase">{title}</h2>
        <Icon name="swipe-hint" />
      </div>
      <div className="flex snap-x snap-mandatory [scrollbar-width:none] gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden">
        {project.gallery.map((item, i) => (
          <MediaTile
            key={i}
            item={item}
            sizes="351px"
            className="h-[225px] w-[351px] shrink-0 snap-start"
          />
        ))}
      </div>
      <div className="flex flex-col gap-10 px-container-padding">
        {project.review && <Review {...project.review} className="w-full" />}
        <LinkCapsDot href="/projects" className="self-start">
          Все проекты
        </LinkCapsDot>
      </div>
    </div>
  )
}

function MediaTile({
  item,
  sizes,
  className,
}: {
  item: GalleryItem
  sizes: string
  className: string
}) {
  if (item.type === 'video') {
    return (
      <VideoTile
        poster={item.poster}
        videoUrl={item.videoUrl}
        sizes={sizes}
        className={className}
      />
    )
  }
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image src={asset(item.src)} alt={item.alt} fill sizes={sizes} className="object-cover" />
    </div>
  )
}
