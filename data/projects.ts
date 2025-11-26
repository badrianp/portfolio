
export const getFeaturedProjects = (): Project[] => {
  return projects.filter((project) => project.featured)
}

export const getProjectBySlug = (slug: string): Project | undefined => {
  return projects.find((project) => project.slug === slug)
}

export const getProjectsByType = (type: Project["type"]): Project[] => {
  return projects.filter((project) => project.type === type)
}

export type Project = {
  slug: string;
  title: string;
  type: "work" | "faculty" | "personal";
  role: string;
  scope?: "full-frontend"
      | "component-dev"
      | "full-stack";
  stack: string[];
  tags?: string[];
  links: { live?: string; repo?: string };
  thumbnail?: string,
  cover?: string;
  featured?: boolean;
  description: string;
  year: number;
};

export const projects: Project[] = [
  // 🔹 Work
  {
    slug: "corporate-ui-dashboard-pro",
    title: "Corporate UI Dashboard PRO",
    type: "work",
    role: "Frontend: layout, components, styles",
    scope: "full-frontend",
    stack: ["HTML", "Bootstrap5", "JavaScript"],
    tags: ["dashboard", "design-system", "pro"],
    links: {
      live: "https://www.creative-tim.com/product/corporate-ui-dashboard-pro"
    },
    thumbnail: "https://s3.amazonaws.com/creativetim_bucket/products/727/original/corporate-ui-dashboard-pro.jpg?1678117894",
    cover: "/covers/corporate-pro.png",
    featured: false,
    description: "Premium dashboard template built with Bootstrap5, focusing on reusable layouts and components.",
    year: 2023
  },
  {
    slug: "argon-dashboard-pro-tailwind",
    title: "Argon Dashboard PRO (Tailwind)",
    type: "work",
    role: "Frontend: PRO pages and UI refinements",
    scope: "full-frontend",
    stack: ["HTML", "Tailwind", "JavaScript"],
    tags: ["dashboard", "pro"],
    links: {
      live: "https://www.creative-tim.com/product/argon-dashboard-pro-tailwind"
    },
    thumbnail: "https://s3.amazonaws.com/creativetim_bucket/products/647/original/argon-dashboard-pro-tailwind.jpg?1662119245",
    cover: "/covers/argon-pro.png",
    featured: true,
    description: "Professional dashboard template with refined Argon UI components and extra pages.",
    year: 2022
  },
  {
    slug: "soft-ui-dashboard-pro-tailwind",
    title: "Soft UI Dashboard PRO (Tailwind)",
    type: "work",
    role: "Frontend: advanced components and structure",
    scope: "full-frontend",
    stack: ["HTML", "Tailwind", "JavaScript"],
    tags: ["dashboard", "pro"],
    links: {
      live: "https://www.creative-tim.com/product/soft-ui-dashboard-pro-tailwind"
    },
    // featured: true,
    thumbnail: "https://s3.amazonaws.com/creativetim_bucket/products/646/original/soft-ui-dashboard-pro-tailwind.jpg?1657640449",
    cover: "/covers/soft-pro.png",
    description: "Extended version of Soft UI Dashboard with advanced features, charts, and forms.",
    year: 2022
  },
  {
    slug: "new-life-therapy",
    title: "New Life Therapy — Psychology Practice",
    type: "work",
    scope: "full-stack",
    role: "Presentation website built with Angular",
    stack: ["Angular", "TypeScript", "HTML", "CSS"],
    tags: ["website", "angular", "presentation"],
    links: {
      live: "https://new-life-therapy.vercel.app/",
      repo: "https://github.com/badrianp/new-life-therapy"
    },
    cover: "/covers/new-life.png",
    description: "Single-page presentation website for a psychology practice, built with Angular.",
    year: 2023
  },
  {
    slug: "arthera-wallet",
    title: "Arthera Wallet",
    type: "work",
    scope: "full-frontend",
    role: "Crypto wallet UI built with Angular",
    stack: ["Angular", "TypeScript", "HTML", "CSS"],
    tags: ["wallet", "crypto", "angular"],
    links: {
      live: "https://arthera-wallet.vercel.app/",
      repo: "https://github.com/badrianp/arthera-wallet"
    },
    cover: "/covers/arthera.png",
    description: "Frontend for a crypto wallet, implementing UI flows and interactions with Angular.",
    year: 2022
  },
  {
    slug: "loopple-builder-components",
    title: "Loopple – UI Components for Builder",
    type: "work",
    role: "Delivered standalone HTML + Tailwind + JS components (not the builder itself)",
    scope: "component-dev",
    stack: ["HTML", "Tailwind", "JavaScript"],
    tags: ["low-code", "components"],
    links: {
      live: "https://www.loopple.com/low-code-builder/theme/motion-landing-library"
    },
    cover: "https://raw.githubusercontent.com/Loopple/loopple-public-assets/main/tailwind/motion-landing-tailwind.png",
    description: "Collection of UI components integrated into Loopple Builder for low-code dashboards.",
    year: 2023
  },
  {
    slug: "corporate-ui-dashboard",
    title: "Corporate UI Dashboard",
    type: "work",
    role: "Ownership frontend: layout, components, styles",
    scope: "full-frontend",
    stack: ["HTML", "Bootstrap5", "JavaScript"],
    tags: ["dashboard", "design-system"],
    links: {
      live: "https://www.creative-tim.com/product/corporate-ui-dashboard"
    },
    thumbnail: "https://s3.amazonaws.com/creativetim_bucket/products/727/original/corporate-ui-dashboard-pro.jpg?1678117894",
    cover: "/covers/corporate.png",
    featured: false,
    description: "Free dashboard template built with Bootstrap5, focusing on reusable layouts and components.",
    year: 2023
  },
  {
    slug: "argon-dashboard-tailwind",
    title: "Argon Dashboard 2 (Tailwind)",
    type: "work",
    role: "Frontend: pages and reusable UI components",
    scope: "full-frontend",
    stack: ["HTML", "Tailwind", "JavaScript"],
    tags: ["dashboard", "tailwind"],
    links: {
      live: "https://www.creative-tim.com/product/argon-dashboard-tailwind"
    },
    thumbnail: "https://s3.amazonaws.com/creativetim_bucket/products/648/original/argon-dashboard-2-tailwind.jpg?1659117428",
    cover: "/covers/argon.png",
    description: "Free Tailwind adaptation of Argon Dashboard, providing a modern UI kit for dashboards.",
    year: 2022
  },
  {
    slug: "soft-ui-dashboard-tailwind",
    title: "Soft UI Dashboard (Tailwind)",
    type: "work",
    role: "Frontend: pages and UI components",
    scope: "full-frontend",
    stack: ["HTML", "Tailwind", "JavaScript"],
    tags: ["dashboard", "tailwind"],
    links: {
      live: "https://www.creative-tim.com/product/soft-ui-dashboard-tailwind"
    },
    thumbnail: "https://s3.amazonaws.com/creativetim_bucket/products/642/original/soft-ui-dashboard-tailwind.jpg?1654522807",
    cover: "/covers/soft.png",
    description: "Free Tailwind dashboard with elegant UI and essential components for quick project starts.",
    year: 2022
  },

  // 🔹 Faculty
  {
    slug: "forking-food",
    title: "Forking Food",
    type: "faculty",
    scope: "full-stack",
    role: "End-to-end mobile app: Flutter + Firebase",
    stack: ["Flutter", "Dart", "Firebase", "Firestore"],
    tags: ["mobile", "flutter", "firebase", "swipe"],
    links: { 
      repo: "https://github.com/badrianp/forking-food" 
    },
    cover: "/covers/forking.png",
    featured: true,
    description: "Bachelor thesis project — mobile app for discovering recipes with swipe-based interactions.",
    year: 2025,
  },
  {
    slug: "tic-tac-toe",
    title: "TicTacToe (Flutter)",
    type: "faculty",
    role: "Implemented UI, game flow, and AI logic (PvP & PvE)",
    scope: "full-stack",
    stack: ["Flutter", "Dart"],
    tags: ["game", "ai", "mobile", "flutter"],
    links: {
      repo: "https://github.com/badrianp/tictactoe",
      // live: "https://tictactoe-bleoju.vercel.app/"
    },
    cover: "/covers/tictactoe.png",
    description: "A Flutter-based TicTacToe game with Player vs Player and Player vs AI modes. The AI features three difficulty levels using heuristics for blocking, winning, and strategic placement.",
    year: 2025,
  },
  {
    slug: "ret-resource-recommender",
    title: "ReT – Resource Recommender Tool",
    type: "faculty",
    role: "Web app: Node.js MVC + MySQL + frontend",
    scope: "full-stack",
    stack: ["Node.js", "MySQL", "HTML", "CSS", "JavaScript"],
    tags: ["rss", "mvc", "node"],
    links: { 
      repo: "https://github.com/badrianp/ReT",
      live: "",
    },
    cover: "/covers/ret.png",
    featured: true,
    description: "Web app for aggregating RSS feeds with personalization and user authentication.",
    year: 2025
  },
  {
    slug: "backgammon-java-cli",
    title: "Backgammon (Java, CLI)",
    type: "faculty",
    role: "Console-based backgammon game with OOP structure",
    scope: "full-stack",
    stack: ["Java"],
    tags: ["cli", "game", "oop"],
    links: { repo: "https://github.com/badrianp/Backgammon" },
    cover: "/covers/backgammon.png",
    description: "Turn-based backgammon game implemented in Java using OOP principles.",
    year: 2021
  },
  {
    slug: "battleships-python-cli",
    title: "Battleships (Python, CLI)",
    type: "faculty",
    role: "Console-based battleships game in a single file",
    scope: "full-stack",
    stack: ["Python"],
    tags: ["cli", "game"],
    links: { repo: "https://github.com/badrianp/Battleships" },
    cover: "/covers/battleships.png",
    description: "Classic battleships game implemented in Python with grid-based gameplay.",
    year: 2021
  },
  {
    slug: "pheasant-client-server-c",
    title: "Pheasant Game (C, Client–Server)",
    type: "faculty",
    role: "Text-based multiplayer game using sockets",
    scope: "full-stack",
    stack: ["C"],
    tags: ["cli", "sockets", "client-server"],
    links: { repo: "https://github.com/badrianp/PheasantGame" },
    cover: "/covers/pheasant.png",
    description: "Networked game with client-server communication, built in C.",
    year: 2021
  },

  // // 🔹 Personal
];