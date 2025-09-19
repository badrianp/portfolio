// data/about.ts

export type About = {
  name: string;
  nickname: string,
  avatar: string;
  tagline: string;
  bio: string;
  'short-bio': string;
  country: string;
  city: string;
  email: string;
  github?: string;
  linkedin?: string;
  website?: string;
  skills: string[];
  interests?: string[];
};

export const about: About = {
  name: "Adrian-Petru Bleoju",
  nickname: "Adrian",
  avatar: "/avatar.jpg",
  tagline: "Frontend Developer • Passionate about AI & Creative Tech",
  bio: `I’m a Computer Science graduate from UAIC Iași with experience in 
frontend development (React, Next.js, Tailwind) and academic projects 
spanning web, mobile (Flutter), and low-level networking (Python, C/C++). 
I enjoy building clean UIs, experimenting with new technologies, 
and connecting creativity with code.`,
  'short-bio': "Full Stack Developer passionate about creating digital experiences using modern technologies and clean, efficient code.",
  country: "Romania",
  city: "Miercurea Ciuc",
  email: "bleojua98@gmail.com",
  github: "https://github.com/badrianp",
  linkedin: "https://www.linkedin.com/in/bleojua",

  skills: [
    "HTML", "CSS", "JavaScript", "TypeScript",
    "React", "Next.js", "Angular",
    "Tailwind CSS", "Node.js", "MySQL",
    "Flutter", "Firebase"
  ],

  interests: [
    "UI/UX design", "AI in frontend", "Automotive tech", "Photography", "Music"
  ]
};