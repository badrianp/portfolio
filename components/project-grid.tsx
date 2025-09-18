import { ProjectCard } from "./project-card"
import type { Project } from "@/data/projects"

interface ProjectGridProps {
  projects: Project[]
  showFullDetails?: boolean
}

export function ProjectGrid({ projects, showFullDetails = false }: ProjectGridProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard key={project.slug} project={project} showFullDetails={showFullDetails} />
      ))}
    </div>
  )
}
