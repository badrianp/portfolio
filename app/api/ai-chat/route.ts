import { NextResponse } from "next/server";
import { aiContext } from "@/data/ai-context";
import { projects } from "@/data/projects";

type ChatBody = { message: string; history?: { role: "user"|"assistant"; content: string }[] };

// const MODEL = "llama-3.1-70b-versatile";
const MODEL = "llama-3.1-8b-instant";

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// 1) Transformă orice URL „crud” în Markdown link ([url](url))
function autolinkUrls(md: string) {
  return md.replace(/(?<!\()https?:\/\/[^\s)]+/g, (url) => `[${url}](${url})`);
}

// 2) Înlocuiește prima apariție a TITLULUI cu link intern către /projects/<slug>
function linkifyProjectTitles(md: string) {
  let out = md;
  for (const p of projects) {
    // sari dacă deja e link intern pentru slug
    if (out.includes(`/projects/${p.slug}`)) continue;

    const titleRe = new RegExp(`\\b${escapeRegExp(p.title)}\\b`);
    if (titleRe.test(out)) {
      out = out.replace(
        titleRe,
        `[${p.title}](/projects/${p.slug})`
      );
    }
  }
  return out;
}

function buildContext() {
  const projectsList = projects.map(
    p => `- ${p.slug} | ${p.title} | ${p.year} | ${p.type} | stack: ${p.stack.join(", ")} | links: ${[
      p.links.live ? `live:${p.links.live}` : "",
      p.links.repo ? `repo:${p.links.repo}` : ""
    ].filter(Boolean).join(" ")}`
  ).join("\n");

  return `${aiContext}\n\nPROJECTS:\n${projectsList}`;
}

// Sistem: reguli pt raspuns
const SYSTEM = `You are Adrian's portfolio assistant.
- ALWAYS answer in concise Markdown.
- When you mention a project, format its title as an internal link: [Title](/projects/<slug>).
- For external URLs (live/repo), use standard Markdown links: [live](https://...) and repo: [repo](https://...).
- Prefer facts from CONTEXT. If unknown, say "I don't have that info."
- Do not invent projects/slugs/links.
- Match the user's language (ro/en).`;
;

export async function POST(req: Request) {
  try {
    const { message, history = [] } = (await req.json()) as ChatBody;
    const ctx = buildContext();

    const messages = [
      { role: "system", content: SYSTEM + "\n\nCONTEXT:\n" + ctx },
      ...history.slice(-10),
      { role: "user", content: message ?? "" }
    ];

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        temperature: 0.2,
        max_tokens: 600,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ reply: `Groq error: ${err}` }, { status: 500 });
    }

    const data = await res.json();
    let reply = data.choices?.[0]?.message?.content ?? "No response.";

    // post-procesare: URL-uri brute → link & titluri proiect → link intern
    reply = autolinkUrls(reply);
    reply = linkifyProjectTitles(reply);

    return NextResponse.json({ reply });
  } catch (e: any) {
    return NextResponse.json({ reply: `Server error: ${e.message}` }, { status: 500 });
  }
}
