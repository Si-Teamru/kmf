import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { ProjectGallery } from '@/components/blocks/ProjectGallery'
import { ProjectIntro } from '@/components/blocks/ProjectIntro'
import { ProjectsSlider } from '@/components/blocks/ProjectsSlider'
import { PlanBlock } from '@/components/plan/PlanBlock'
import { getProject, projectCards, projects } from '@/data/projects'

/**
 * Тестовая копия страницы проекта с блоком «План проекта» на 3D-модели (макет KMF-to-dev 1:61).
 * Когда блок согласуют, он заменит заглушку на основной странице, а эту копию удалить.
 */
type Props = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return projects.filter((p) => p.plan).map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = getProject((await params).slug)
  return project
    ? { title: `${project.title} — план в 3D — KMF`, robots: { index: false, follow: false } }
    : {}
}

export default async function ProjectPlan3DPage({ params }: Props) {
  const project = getProject((await params).slug)
  if (!project?.plan) notFound()

  return (
    <>
      <ProjectIntro project={project} />
      <PlanBlock model={project.plan.model} facts={project.plan.facts} />
      <ProjectGallery project={project} />
      <ProjectsSlider cards={projectCards} />
    </>
  )
}
