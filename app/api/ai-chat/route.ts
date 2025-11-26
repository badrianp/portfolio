import { NextResponse } from "next/server";
import { buildAiContext } from "@/data/ai-context";
import { projects } from "@/data/projects";
import { about } from "@/data/about";
import { routeIntent } from "../chat/route";

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
const SYSTEM = `You are Chadi, a chatbot assistant that provides information about Adrian-Petru Bleoju (also known as Adi) and his portfolio, work, and experience.

CRITICAL RULES:

1. IDENTITY & VOICE:
   - Your name is Chadi (chatbot + Adi)
   - You are a chatbot assistant, NOT Adrian himself
   - When speaking about Adrian, use third person: "Adrian", "Adi", "his", "he"
   - You can say: "I'm Chadi, a chatbot that helps you learn about Adrian's portfolio"
   - You are friendly, helpful, and professional

2. LANGUAGE & COMMUNICATION:
   - Start conversations in English, then naturally match the user's language
   - If user writes in Romanian, respond naturally in Romanian (using formal "dumneavoastră/vă" unless they ask for informal)
   - If user writes in English, respond in English
   - Don't mix languages in the same response
   - Keep it natural - match their tone and style
   - Write grammatically correct but conversational sentences

3. ACCURACY:
   - Only mention information from the CONTEXT provided about Adrian
   - If you don't know something, say: "Nu am această informație despre Adrian" (Romanian) or "I don't have that information about Adrian" (English)
   - Never invent projects, technologies, or details
   - Always clarify that you're a chatbot providing information about Adrian

4. LINKS & FORMATTING:
   - Projects: Always link internally as [Project Name](/projects/<slug>)
   - Contact page: Always mention and link to [contact page](/contact) when relevant
   - External links: Use Markdown format [text](URL)
   - Use Markdown for structure (headers, lists, bold)

5. CONTACT INFORMATION:
   - The website has a dedicated contact page at /contact
   - Always mention the contact page when users ask about getting in touch with Adrian
   - The contact page includes email, location, social links, and a contact form

6. STYLE & TONE:
   - Be natural, conversational, and friendly - like talking to a helpful colleague
   - Be concise but informative - don't be overly formal or robotic
   - Keep answers relevant and helpful
   - Use a warm, approachable tone - avoid sounding like a manual or documentation
   - It's okay to be a bit casual and friendly - you're not a corporate chatbot
   - Avoid repetition and unnecessary formality
   - When introducing yourself, keep it brief and natural - don't over-explain
   - Respond to greetings naturally (e.g., if user says "hello" or "salutare", respond naturally, not with a introduction)
   - Flow with the conversation - don't force information unless asked`;

// Helper: detect language from user message
function detectLanguage(text: string): "en" | "ro" {
  const romanianChars = /[ăâîșțĂÂÎȘȚ]/i;
  const romanianWords = /\b(și|sau|sunt|este|am|ai|are|au|ce|cum|unde|când|de|cu|pentru|despre|vă|dumneavoastră|mulțumesc|salut|bună|ziua|bună|ziua)\b/i;
  
  if (romanianChars.test(text) || romanianWords.test(text)) {
    return "ro";
  }
  return "en";
}

// Helper: get error messages in appropriate language
function getErrorMessage(type: string, language: "en" | "ro" = "en"): string {
  const messages: Record<string, { en: string | ((s: number) => string); ro: string | ((s: number) => string) }> = {
    rate_limit: {
      en: "Sorry, I've reached the request limit. Please try again in a few moments.",
      ro: "Scuze, am atins limita de cereri. Vă rugăm să încercați din nou în câteva momente."
    },
    rate_limit_with_time: {
      en: (seconds: number) => `Sorry, I've reached the request limit. Please try again in ${seconds} ${seconds === 1 ? 'second' : 'seconds'}.`,
      ro: (seconds: number) => `Scuze, am atins limita de cereri. Vă rugăm să încercați din nou în ${seconds} ${seconds === 1 ? 'secundă' : 'secunde'}.`
    },
    invalid_request: {
      en: "Sorry, the request is invalid. Please try again.",
      ro: "Scuze, cererea nu este validă. Vă rugăm să încercați din nou."
    },
    authentication: {
      en: "Sorry, I encountered a technical issue. Please try again later.",
      ro: "Scuze, am întâmpinat o problemă tehnă. Vă rugăm să încercați mai târziu."
    },
    generic: {
      en: "Sorry, I encountered a temporary issue. Please try again in a few moments.",
      ro: "Scuze, am întâmpinat o problemă temporară. Vă rugăm să încercați din nou în câteva momente."
    },
    unexpected: {
      en: "Sorry, I received an unexpected response. Please try again.",
      ro: "Scuze, am primit un răspuns neașteptat. Vă rugăm să încercați din nou."
    }
  };

  const msg = messages[type];
  if (!msg) {
    const generic = messages.generic[language];
    return typeof generic === "string" ? generic : generic(0);
  }
  
  const langMsg = msg[language];
  if (typeof langMsg === "function") {
    // This is for rate_limit_with_time which needs seconds parameter
    return langMsg(0);
  }
  
  return langMsg;
}

// Helper: gestionează erorile de la Groq și generează mesaje prietenoase
function handleGroqError(errorText: string, statusCode: number, userLanguage: "en" | "ro" = "en"): string {
  // Loghează eroarea completă în consolă (server-side) - DOAR pentru debugging
  console.error("[Groq API Error]", {
    status: statusCode,
    error: errorText,
    timestamp: new Date().toISOString(),
  });

  try {
    // Încearcă să parseze eroarea ca JSON
    const errorData = JSON.parse(errorText);
    const error = errorData?.error;

    if (error?.type === "rate_limit_exceeded") {
      // Rate limit exceeded - extrage timpul de așteptare din mesaj
      const errorMessage = error?.message || "";
      const retryAfterMatch = errorMessage.match(/try again in ([\d.]+)s/i);
      if (retryAfterMatch && retryAfterMatch[1]) {
        const seconds = Math.ceil(parseFloat(retryAfterMatch[1]));
        return userLanguage === "ro" 
          ? `Scuze, am atins limita de cereri. Vă rugăm să încercați din nou în ${seconds} ${seconds === 1 ? 'secundă' : 'secunde'}.`
          : `Sorry, I've reached the request limit. Please try again in ${seconds} ${seconds === 1 ? 'second' : 'seconds'}.`;
      }
      return getErrorMessage("rate_limit", userLanguage);
    }

    if (error?.type === "invalid_request_error") {
      return getErrorMessage("invalid_request", userLanguage);
    }

    if (error?.type === "authentication_error") {
      console.error("[Groq Auth Error] - Check API key configuration", error);
      return getErrorMessage("authentication", userLanguage);
    }

    console.error("[Groq Unknown Error Type]", { type: error?.type, message: error?.message });
    return getErrorMessage("generic", userLanguage);
  } catch (parseError) {
    console.error("[Groq Error Parse Failed]", { errorText, parseError });
  }

  return getErrorMessage("generic", userLanguage);
}

// Fallback to static chatbot when AI fails
function fallbackToStaticChat(message: string): string {
  try {
    return routeIntent(message);
  } catch (e) {
    console.error("[Fallback Chat Error]", e);
    return getErrorMessage("generic", detectLanguage(message));
  }
}

export async function POST(req: Request) {
  try {
    const { message, history = [] } = (await req.json()) as ChatBody;
    
    if (!message || !message.trim()) {
      return NextResponse.json({ 
        reply: "Hi! Ask me about Adrian's projects, stack, or contact. Type `help` to see all commands." 
      }, { status: 200 });
    }

    // Detect user language for error messages and language consistency
    const userLanguage = detectLanguage(message);
    
    // Determine conversation language from history or current message
    // If this is the first user message, default to English
    const isFirstMessage = history.length === 0;
    const conversationLanguage = isFirstMessage ? "en" : userLanguage;
    
    // Build context using data from about.ts and projects.ts
    const ctx = buildAiContext(about, projects);

    // Enhance system prompt with language instruction (more natural)
    const languageInstruction = isFirstMessage 
      ? "\n\nNOTE: This is the first user message. Respond naturally in English, keeping the conversation friendly and conversational."
      : conversationLanguage === "ro"
      ? "\n\nNOTE: The user is writing in Romanian. Respond naturally in Romanian using formal address (dumneavoastră, vă), but keep it conversational and friendly."
      : "\n\nNOTE: The user is writing in English. Respond naturally in English, keeping it conversational.";

    const messages = [
      { role: "system", content: SYSTEM + languageInstruction + "\n\nCONTEXT:\n" + ctx },
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
        temperature: 0.4, // Higher temperature for more natural, conversational responses
        max_tokens: 800, // Increased for better, more complete answers (was 600)
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      const friendlyMessage = handleGroqError(errorText, res.status, userLanguage);
      
      // Try fallback to static chatbot
      try {
        const fallbackReply = fallbackToStaticChat(message);
        return NextResponse.json({ reply: fallbackReply }, { status: 200 });
      } catch {
        return NextResponse.json({ reply: friendlyMessage }, { status: 200 });
      }
    }

    const data = await res.json();

    // Verifică dacă răspunsul conține erori (chiar dacă status e 200)
    if (data.error) {
      console.error("[Groq API Error in Response]", {
        error: data.error,
        timestamp: new Date().toISOString(),
      });
      const friendlyMessage = handleGroqError(JSON.stringify(data), 200, userLanguage);
      
      // Try fallback to static chatbot
      try {
        const fallbackReply = fallbackToStaticChat(message);
        return NextResponse.json({ reply: fallbackReply }, { status: 200 });
      } catch {
        return NextResponse.json({ reply: friendlyMessage }, { status: 200 });
      }
    }

    // Verifică dacă există răspuns valid
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error("[Groq API Invalid Response]", {
        data,
        timestamp: new Date().toISOString(),
      });
      
      // Try fallback to static chatbot
      try {
        const fallbackReply = fallbackToStaticChat(message);
        return NextResponse.json({ reply: fallbackReply }, { status: 200 });
      } catch {
        return NextResponse.json({ 
          reply: getErrorMessage("unexpected", userLanguage)
        }, { status: 200 });
      }
    }

    let reply = data.choices[0].message.content ?? "No response.";

    // If response is empty or just "No response.", try fallback
    if (!reply || reply.trim() === "No response." || reply.trim().length === 0) {
      try {
        const fallbackReply = fallbackToStaticChat(message);
        return NextResponse.json({ reply: fallbackReply }, { status: 200 });
      } catch {
        return NextResponse.json({ 
          reply: getErrorMessage("generic", userLanguage)
        }, { status: 200 });
      }
    }

    // post-procesare: URL-uri brute → link & titluri proiect → link intern
    reply = autolinkUrls(reply);
    reply = linkifyProjectTitles(reply);

    return NextResponse.json({ reply });
  } catch (e: any) {
    // Loghează eroarea în consolă
    console.error("[Server Error]", {
      error: e.message,
      stack: e.stack,
      timestamp: new Date().toISOString(),
    });

    // Try to get the message from request for language detection and fallback
    let userLanguage: "en" | "ro" = "en";
    let requestMessage = "";
    try {
      // Clone the request to read it again (since we already read it at the start)
      const body = await req.clone().json().catch(() => ({}));
      if (body.message) {
        requestMessage = body.message;
        userLanguage = detectLanguage(body.message);
        
        // Try fallback to static chatbot
        try {
          const fallbackReply = fallbackToStaticChat(requestMessage);
          return NextResponse.json({ reply: fallbackReply }, { status: 200 });
        } catch {}
      }
    } catch {}

    // Final fallback
    return NextResponse.json({ 
      reply: getErrorMessage("generic", userLanguage)
    }, { status: 200 });
  }
}
