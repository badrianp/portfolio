import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ProjectGrid } from "@/components/project-grid"
import { getFeaturedProjects } from "@/data/projects"
import { about } from "@/data/about"
import { ArrowRight, Download, Mail } from "lucide-react"

export default function HomePage() {
  const featuredProjects = getFeaturedProjects()

  return (
    <div className="container mx-auto px-4 py-8 space-y-24">
      {/* Hero Section */}
      <section className="text-center space-y-6 pt-12 pb-4 md:pt-20 md:pb-6">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl text-balance">
            Hi, I'm <span className="text-primary">{about.nickname}</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl text-pretty">
            {/* {Full Stack Developer passionate about creating exceptional digital experiences using modern technologies
            and clean, efficient code.} */}
            {about["short-bio"]}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button size="lg" asChild>
            <Link href="/projects">
              View My Work
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/contact">
              <Mail className="mr-2 h-4 w-4" />
              Get In Touch
            </Link>
          </Button>
          <Button size="lg" variant="ghost" asChild>
            <Link href="/cv.pdf" target="_blank">
              <Download className="mr-2 h-4 w-4" />
              Resume
            </Link>
          </Button>
        </div>
        <div className="flex sm:mt-12 justify-center">
          <Image
            src={ about.avatar || "/avatar.jpg"}
            alt="Adrian's avatar"
            width={200}
            height={200}
            className="object-cover transition-transform object-center h-50 w-50 md:h-75 md:w-75 sm:h-60 sm:w-60 hover:scale-105 rounded-full"
          />
        </div>
      </section>

      {/* About Section */}
      <section className="space-y-16">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">About Me</h2>
          <p className="mx-auto max-w-2xl text-muted-foreground text-pretty">
            {about.bio}
          </p>
        </div>

        <div className="mx-auto max-w-4xl">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-3">
              <h3 className="text-xl font-semibold">Frontend Development</h3>
              <p className="text-muted-foreground text-sm">
              Experience building responsive dashboards, design systems, and component libraries 
              using React, Next.js, and Tailwind CSS.
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-semibold">Backend Development</h3>
              <p className="text-muted-foreground text-sm">
              Hands-on experience with backend fundamentals through academic projects: Node.js MVC with MySQL (ReT), 
              socket-based networking in C and Java, and integration of Firebase in mobile apps.
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-semibold">Full Stack Solutions</h3>
              <p className="text-muted-foreground text-sm">
              Able to deliver complete solutions by combining frontend and backend: from mobile apps with Flutter + Firebase 
              to full-stack web projects with Next.js, Tailwind, and API integrations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Featured Projects</h2>
          <p className="mx-auto max-w-2xl text-muted-foreground text-pretty">
            A selection of my recent work showcasing different technologies and approaches
          </p>
        </div>

        <ProjectGrid projects={featuredProjects} />

        <div className="text-center">
          <Button variant="outline" size="lg" asChild>
            <Link href="/projects">
              View All Projects
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
