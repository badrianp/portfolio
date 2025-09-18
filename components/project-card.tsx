import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Github } from "lucide-react"
import type { Project } from "@/data/projects"

interface ProjectCardProps {
  project: Project
  showFullDetails?: boolean
}

export function ProjectCard({ project, showFullDetails = false }: ProjectCardProps) {
  return (
    <Card className="overflow-hidden transition-all pt-0 hover:shadow-lg">
      <div className="aspect-video relative overflow-hidden">
        <Link href={`/projects/${project.slug}`}>
          <Image
            src={project.thumbnail || project.cover || "/placeholder.svg"}
            alt={project.title}
            fill
            className="object-cover transition-transform hover:scale-105"
          />
        </Link>
      </div>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl">{project.title}</CardTitle>
            <CardDescription>{project.description}</CardDescription>
          </div>
          <Badge variant="secondary" className="ml-2 shrink-0">
            {project.type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 mt-auto">
        {showFullDetails && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Role:</span> {project.role}
            </p>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Year:</span> {project.year}
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-1">
          {project.stack.slice(0, showFullDetails ? project.stack.length : 3).map((tech) => (
            <Badge key={tech} variant="outline" className="text-xs">
              {tech}
            </Badge>
          ))}
          {!showFullDetails && project.stack.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{project.stack.length - 3}
            </Badge>
          )}
        </div>

        <div className="flex gap-2">
          {project.links.live && (
            <Button size="sm" variant="outline" asChild>
              <Link href={project.links.live} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-1 h-3 w-3" />
                Live
              </Link>
            </Button>
          )}
          {project.links.repo && (
            <Button size="sm" variant="outline" asChild>
              <Link href={project.links.repo} target="_blank" rel="noopener noreferrer">
                <Github className="mr-1 h-3 w-3" />
                Code
              </Link>
            </Button>
          )}
          {!showFullDetails && (
            <Button size="sm" variant="ghost" asChild>
              <Link href={`/projects/${project.slug}`}>View Details</Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
