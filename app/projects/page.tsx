import type { Metadata } from "next"
import { ProjectGrid } from "@/components/project-grid"
import { projects } from "@/data/projects"

export const metadata: Metadata = {
  title: "Projects - Your Name",
  description: "A collection of my work including web applications, mobile apps, and open source contributions.",
}

export default function ProjectsPage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl text-balance">My Work</h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground text-pretty">
          A collection of my work spanning web applications, mobile development, and other practical projects. Each
          project represents a unique challenge and learning opportunity.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-card p-6 text-center">
          <div className="text-2xl font-bold">{projects.length}</div>
          <div className="text-sm text-muted-foreground">Total Projects</div>
        </div>
        <a href="#professional" className="rounded-lg border bg-card p-6 text-center">
          <div className="text-2xl font-bold">{projects.filter((p) => p.type === "work").length}</div>
          <div className="text-sm text-muted-foreground">Professional Work</div>
        </a>
        <a href="#academic" className="rounded-lg border bg-card p-6 text-center">
          <div className="text-2xl font-bold">{projects.filter((p) => p.type === "faculty").length}</div>
          <div className="text-sm text-muted-foreground">Academic Projects</div>
        </a>
      </div>

      {/* Project Categories */}
      <div className="space-y-12">
        {/* Featured Projects */}
        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">Featured Projects</h2>
            <p className="text-muted-foreground">
              Highlighted projects that showcase my best work and technical capabilities.
            </p>
          </div>
          <ProjectGrid projects={projects.filter((p) => p.featured)} />
        </section>

        {/* Professional Work */}
        {projects.filter((p) => p.type === "work").length > 0 && (
        <section id="professional" className="scroll-mt-20 space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">Professional Work</h2>
            <p className="text-muted-foreground">Projects developed in professional environments and client work.</p>
          </div>
            <ProjectGrid projects={projects.filter((p) => p.type === "work")} />
          </section>
        )}

        {/* Personal Projects */}
        {projects.filter((p) => p.type === "personal").length > 0 && (
        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">Personal Projects</h2>
            <p className="text-muted-foreground">Side projects and experiments exploring new technologies and ideas.</p>
          </div>
            <ProjectGrid projects={projects.filter((p) => p.type === "personal")} />
          </section>
        )}

        {/* Academic Projects */}
        {projects.filter((p) => p.type === "faculty").length > 0 && (
          <section id="academic" className="scroll-mt-20 space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">Academic Projects</h2>
              <p className="text-muted-foreground">
                Projects developed during academic work and research collaborations.
              </p>
            </div>
            <ProjectGrid projects={projects.filter((p) => p.type === "faculty")} />
          </section>
        )}
      </div>
    </div>
  )
}
