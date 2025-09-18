import type { Metadata } from "next"
import Link from "next/link"
import { about } from "@/data/about"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Github, Linkedin, MapPin, Clock, Send } from "lucide-react"

export const metadata: Metadata = {
  title: `Contact - ${about.nickname}`,
  description: "Get in touch with me for collaboration opportunities, project inquiries, or just to say hello.",
}

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl text-balance">Let's Work Together</h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground text-pretty">
          I'm always interested in new opportunities and collaborations. Whether you have a project in mind or just want
          to connect, I'd love to hear from you.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Contact Information */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Get In Touch</CardTitle>
              <CardDescription>Reach out through any of these channels</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email */}
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Email</p>
                  <Link
                    href={`mailto:${about.email}`}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {about.email}
                  </Link>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Location</p>
                  <p className="text-sm text-muted-foreground">{about.city}, {about.country}</p>
                </div>
              </div>

              {/* Availability */}
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Availability</p>
                  <p className="text-sm text-muted-foreground">Open to new opportunities</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card>
            <CardHeader>
              <CardTitle>Connect Online</CardTitle>
              <CardDescription>Find me on these platforms</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                <Link href={about.github || 'https://github.com/badrianp'} target="_blank" rel="noopener noreferrer">
                  <Github className="mr-2 h-4 w-4" />
                  GitHub
                </Link>
              </Button>

              <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                <Link href={about.linkedin || 'https://www.linkedin.com/in/bleojua'} target="_blank" rel="noopener noreferrer">
                  <Linkedin className="mr-2 h-4 w-4" />
                  LinkedIn
                </Link>
              </Button>

              <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                <Link href={`mailto:${about.email}`}>
                  <Mail className="mr-2 h-4 w-4" />
                  Email Me Directly
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Contact Form */}
        <Card>
          <CardHeader>
            <CardTitle>Send a Message</CardTitle>
            <CardDescription>Fill out the form below and I'll get back to you as soon as possible</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" action="https://formspree.io/f/mdklqoyl" method="POST">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" placeholder="Your name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" placeholder="your.email@example.com" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" name="subject" placeholder="What's this about?" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Tell me about your project or idea..."
                  className="min-h-[120px]"
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                <Send className="mr-2 h-4 w-4" />
                Send Message
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Call to Action */}
      <div className="text-center space-y-4 py-8">
        <h2 className="text-2xl font-bold tracking-tight">Ready to Start a Project?</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          I'm currently available for freelance work and interesting full-time opportunities.
        </p>
        <Button size="lg" asChild>
          <Link href="mailto:your.email@example.com">
            <Mail className="mr-2 h-4 w-4" />
            Let's Talk
          </Link>
        </Button>
      </div>
    </div>
  )
}
