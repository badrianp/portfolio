import { NextResponse } from "next/server";
import { buildAiContext } from "@/data/ai-context";
import { projects } from "@/data/projects";
import { about } from "@/data/about";

type ChatBody = { message: string; history?: { role: "user"|"assistant"; content: string }[] };

// Using 8b-instant for speed, but can switch to 70b for better quality if needed
const MODEL = "llama-3.1-8b-instant";
// const MODEL = "llama-3.1-70b-versatile"; // Better quality but slower

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

    // Extrage partea principală a titlului (înainte de paranteze)
    // Ex: "TicTacToe (Flutter)" -> "TicTacToe"
    const mainTitle = p.title.replace(/\s*\([^)]*\)\s*$/, "").trim();
    
    // Helper: creează regex care match-uiește textul cu sau fără bold markdown (**text**)
    const createTitleRegex = (title: string) => {
      const escaped = escapeRegExp(title);
      // Match text chiar dacă e înconjurat de ** (bold markdown)
      // (?<!\[) - negative lookbehind: nu match-ui dacă e după [ (adică deja într-un link)
      // (?!\[) - negative lookahead: nu match-ui dacă urmează [ (adică ar fi într-un link)
      return new RegExp(`(?<!\\[)(\\*\\*)?${escaped}(\\*\\*)?(?!\\[)`, "i");
    };

    // 1. Încearcă cu titlul complet (cu paranteze)
    const fullTitleRe = createTitleRegex(p.title);
    if (fullTitleRe.test(out)) {
      out = out.replace(fullTitleRe, (match, startBold, endBold) => {
        const linkText = `[${p.title}](/projects/${p.slug})`;
        return (startBold && endBold) ? `**${linkText}**` : linkText;
      });
      continue;
    }

    // 2. Încearcă cu partea principală (fără paranteze) - dacă e diferită de titlul complet
    if (mainTitle !== p.title && mainTitle.length > 0) {
      const mainTitleRe = createTitleRegex(mainTitle);
      if (mainTitleRe.test(out)) {
        out = out.replace(mainTitleRe, (match, startBold, endBold) => {
          const linkText = `[${p.title}](/projects/${p.slug})`;
          return (startBold && endBold) ? `**${linkText}**` : linkText;
        });
        continue;
      }
    }
  }
  return out;
}

// System prompt: clear instructions for consistent, grammatically correct responses
const SYSTEM = `You are Adrian-Petru Bleoju speaking in first person about your own portfolio, work, and experience.

CRITICAL RULES:
1. VOICE: Always speak as Adrian (first person: "I", "my", "me"). NEVER refer to yourself as an assistant or speak about Adrian in third person.

2. GRAMMAR & LANGUAGE:
   - Write grammatically correct sentences in the user's language (Romanian or English)
   - Match the user's language automatically
   - Use proper punctuation, capitalization, and sentence structure
   - Be natural and conversational, but professional

3. ACCURACY:
   - Only mention information from the CONTEXT provided
   - If you don't know something, say "I don't have that information" or "That's not something I can help with"
   - Never invent projects, technologies, or details

4. LINKS & FORMATTING:
   - Projects: Always link internally as [Project Name](/projects/<slug>)
   - Contact page: Always mention and link to [contact page](/contact) when relevant
   - External links: Use Markdown format [text](URL)
   - Use Markdown for structure (headers, lists, bold)

5. CONTACT INFORMATION:
   - The website has a dedicated contact page at /contact
   - Always mention the contact page when users ask about getting in touch
   - The contact page includes email, location, social links, and a contact form

6. STYLE:
   - Be concise but informative
   - Keep answers relevant and helpful
   - Use a calm, clear, and polite tone
   - Avoid repetition`;

export async function POST(req: Request) {
  try {
    const { message, history = [] } = (await req.json()) as ChatBody;
    // Build context using data from about.ts and projects.ts
    const ctx = buildAiContext(about, projects);

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
        temperature: 0.3, // Slightly higher for more natural responses (was 0.2)
        max_tokens: 800, // Increased for better, more complete answers (was 600)
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
