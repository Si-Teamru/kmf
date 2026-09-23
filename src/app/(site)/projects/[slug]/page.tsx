import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

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

  return <ProjectIntro project={project} />
}
