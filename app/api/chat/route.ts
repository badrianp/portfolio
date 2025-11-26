// app/api/chat/route.ts
import { NextResponse } from "next/server";
import { about } from "@/data/about";
import { projects } from "@/data/projects";

type ChatBody = { message: string };

// ── utils (STRICT, fără fuzzy) ────────────────────────────────────────────────
function norm(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}\s\-+.#]/gu, "") // păstrează litere/cifre/spații și semne utile în nume de tech
    .replace(/\s+/g, " ")
    .trim();
}
function equalsAny(s: string, list: string[]) {
  const n = norm(s);
  return list.some((x) => n === norm(x));
}
function parseProjectsIn(s: string): string | null {
  const m = norm(s).match(/^projects in ([\p{L}\p{N}.+#-]+)$/u);
  return m ? m[1] : null;
}
function hasExactTech(arr: string[], tech: string) {
  const t = norm(tech);
  return arr.some((x) => norm(x) === t);
}

// ── formatters (răspunsuri în Markdown) ───────────────────────────────────────
function projectLine(p: (typeof projects)[number]) {
  const title = `[${p.title}](/projects/${p.slug})`; // link intern către pagina proiectului
  const parts = [`- ${title} — ${p.role}`];
  if (p.links.live) parts.push(`**[live](${p.links.live})**`);
  if (p.links.repo) parts.push(`[repo](${p.links.repo})`);
  return parts.join(" · ");
}

function listAll() {
  return `**All projects**\n` + projects.map(projectLine).join("\n");
}

function listFeatured() {
  const hits = projects.filter((p) => p.featured);
  if (!hits.length) return "_No featured projects marked yet._";
  return `**Featured projects**\n` + hits.map(projectLine).join("\n");
}

function listByTech(tech: string) {
  const hits = projects.filter(
    (p) => hasExactTech(p.stack, tech) || hasExactTech(p.tags ?? [], tech)
  );
  if (!hits.length) {
    return `No projects found for **${tech}**.`;
  }
  return `**Projects in ${tech}**\n` + hits.map(projectLine).join("\n");
}

function projectDetails(slug: string) {
  const p = projects.find((pr) => norm(pr.slug) === norm(slug));
  if (!p) return `No project with slug: \`${slug}\``;

  const title = `[${p.title}](/projects/${p.slug})`;
  const links = [
    p.links.live ? `**[live](${p.links.live})**` : "",
    p.links.repo ? `[repo](${p.links.repo})` : "",
  ]
    .filter(Boolean)
    .join(" · ");

  return `### ${title}
${p.description ?? p.role}

${links ? links + "\n" : ""}_Type:_ ${p.type}${
    p.year ? ` • _Year:_ ${p.year}` : ""
  }
_Tech:_ ${p.stack.join(", ")}
`.trim();
}

function contactCard() {
  return `**Contact**
- Email: [${about.email}](mailto:${about.email})
- GitHub: [${about.github}](${about.github})
- LinkedIn: [${about.linkedin}](${about.linkedin})
`;
}

function skillsSummary() {
  const s = new Set<string>();
  projects.forEach((p) => p.stack.forEach((x) => s.add(x)));
  return `**Core skills:** \n` + Array.from(s).sort().map((x) => `${x}`).join(", ");
}

function aboutBlurb() {
  const name = (about as any).name ?? "Adrian-Petru Bleoju";
  return `**${name}** — software engineed with experience in frontend (Next.js, React, Angular, Tailwind, Flutter) and backend (Node.js, MySQL, Firebase). Focuses on clean UIs, reusable components, and building complete solutions from UI to data layer.`;
}

const HELP = `**Commands**
- \`help\` / \`commands\`
- \`about\`
- \`contact\`
- \`projects\`
- \`featured\`
- \`projects in <tech>\`   e.g. \`projects in Flutter\`
- \`project <slug>\`       e.g. \`project forking-food\`
- \`skills\` / \`stack\`
`;

// ── router strict pe comenzi ──────────────────────────────────────────────────
export function routeIntent(input: string): string {
  const m = norm(input);

  if (!m || equalsAny(m, ["help", "commands"])) return HELP;

  if (equalsAny(m, ["about"])) return aboutBlurb();
  if (equalsAny(m, ["contact"])) return contactCard();

  if (
    equalsAny(m, ["projects"]) ||
    equalsAny(m, ["list projects", "all projects", "show projects"])
  ) {
    return listAll();
  }

  if (equalsAny(m, ["featured", "featured projects"])) return listFeatured();

  const tech = parseProjectsIn(m);
  if (tech) return listByTech(tech);

  if (equalsAny(m, ["skills", "stack", "tech stack", "technologies"]))
    return skillsSummary();

  const slugMatch = m.match(/^project ([\p{L}\p{N}\-]+)$/u);
  if (slugMatch) return projectDetails(slugMatch[1]);

  return HELP;
}

// ── Next.js route ────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  const body = (await req.json()) as ChatBody;
  const reply = routeIntent(body.message ?? "");
  return NextResponse.json({ reply });
}