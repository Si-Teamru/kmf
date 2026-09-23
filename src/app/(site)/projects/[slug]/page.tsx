import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { ProjectGallery } from '@/components/blocks/ProjectGallery'
import { ProjectIntro } from '@/components/blocks/ProjectIntro'
import { getProject, projects } from '@/data/projects'

type Props = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = getProject((await params).slug)
  return project ? { title: `${project.title} — KMF` } : {}
}

export default async function ProjectPage({ params }: Props) {
  const project = getProject((await params).slug)
  if (!project) notFound()

  return (
    <>
      <ProjectIntro project={project} />
      <PlanPlaceholder />
      <ProjectGallery project={project} />
    </>
  )
}

/**
 * Заглушка блока «План проекта» (этап 3) — только габариты секции из макета:
 * Desktop section-plan 23:92 — pt 80 + plan-block 878; Mobile 27:373 — pt 120 + plan-block 578.
 */
function PlanPlaceholder() {
  return (
    <section aria-label="План проекта" className="pt-[120px] xl:pt-20">
      <div className="flex h-[578px] items-center justify-center bg-gray-100 xl:h-[878px]">
        <span className="text-caption text-text-secondary">План проекта — в разработке</span>
      </div>
    </section>
  )
}
