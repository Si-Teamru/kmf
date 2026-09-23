import { DesignerLine, TextBlock } from '@/components/ui'
import type { Project } from '@/data/projects'

import { ProjectGallery2x2 } from './ProjectGallery2x2'
import { StepDivider } from './StepDivider'

/**
 * Первый блок страницы проекта (section-intro).
 *
 * Desktop (23:35): pt 48, gap 48 до Step Divider (без номера, на всю ширину).
 *   container: px container-padding, gap 40, items-start —
 *   галерея 308 | overview 479 (self-stretch, justify-between: заголовок сверху, дизайнер снизу)
 *   | tasks (gap block-gap 48, блоки 334).
 *   intro__title: gap 24 — h1 + мета text_body-l-accent.
 * Mobile (27:270): px container-padding, gap 24 —
 *   intro__title (gap 16) → intro__gallery (галерея 336 + дизайнер, gap 8) → intro__tasks (pt 24, gap 24).
 *
 * Порядок элементов на мобильном и десктопе разный, поэтому раскладка — grid-areas:
 * один DOM, без дублирования h1. Десктопная сетка — с xl (1280): 308 + 40 + 479 + 40 + 334
 * не помещается в более узкий экран.
 */
export function ProjectIntro({ project }: { project: Project }) {
  return (
    <section className="flex flex-col gap-12 xl:pt-12">
      <div className="grid grid-cols-1 px-container-padding [grid-template-areas:'title'_'gallery'_'designer'_'tasks'] xl:grid-cols-[308px_minmax(0,479px)_334px] xl:grid-rows-[auto_1fr] xl:gap-x-10 xl:[grid-template-areas:'gallery_title_tasks'_'gallery_designer_tasks']">
        <div className="flex flex-col gap-4 text-text-primary [grid-area:title] xl:gap-6">
          <h1 className="text-h1">{project.title}</h1>
          <p className="text-body-l-accent">
            {project.meta.map((line, i) => (
              <span key={i} className="block">
                {line}
              </span>
            ))}
          </p>
        </div>

        <ProjectGallery2x2
          images={project.gallery2x2}
          className="mt-6 [grid-area:gallery] xl:mt-0"
        />

        <DesignerLine
          name={project.designer.name}
          socials={project.designer.socials}
          className="mt-2 [grid-area:designer] xl:mt-0 xl:self-end"
        />

        <div className="mt-6 flex flex-col gap-6 self-start pt-6 [grid-area:tasks] xl:mt-0 xl:gap-block-gap xl:pt-0">
          <TextBlock title="Задача" className="w-[334px] max-w-full">
            {project.task}
          </TextBlock>
          <TextBlock title="Решение" className="w-[334px] max-w-full">
            {project.solution}
          </TextBlock>
        </div>
      </div>

      <StepDivider className="hidden xl:flex" />
    </section>
  )
}
