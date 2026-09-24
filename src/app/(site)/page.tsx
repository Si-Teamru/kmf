import { HomeBenefits } from '@/components/blocks/HomeBenefits'
import { HomeForm } from '@/components/blocks/HomeForm'
import { HomeHero } from '@/components/blocks/HomeHero'
import { HomeProjects } from '@/components/blocks/HomeProjects'
import { HomeShowroom } from '@/components/blocks/HomeShowroom'
import { projectCards } from '@/data/projects'

/**
 * Главная (Figma «Главная — к вёрстке» 111:5: Desktop 111:6, Mobile 115:208).
 * `data-footer="white"` — подвал на главной белый (правило в globals.css).
 */
export default function HomePage() {
  return (
    <div data-footer="white">
      <HomeHero />
      <HomeBenefits />
      <HomeShowroom />
      <HomeForm />
      <HomeProjects cards={projectCards} />
    </div>
  )
}
