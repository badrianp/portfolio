"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import NextLink from "next/link";
import ReactMarkdown from "react-markdown";
import { Send, X } from "lucide-react";

type Msg = { role: "user" | "bot"; text: string };

function LinkRenderer(props: React.ComponentProps<"a">) {
  const href = props.href ?? "#";
  const isInternal = href.startsWith("/");
  const isMailto = href.startsWith("mailto:");
  const className = "underline underline-offset-2 hover:opacity-80";

  if (isInternal) {
    return (
      <NextLink href={href} className={className}>
        {props.children}
      </NextLink>
    );
  }

  // pentru mailto lăsăm fără _blank
  if (isMailto) {
    return (
      <a href={href} className={className}>
        {props.children}
      </a>
    );
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {props.children}
    </a>
  );
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "bot", text: "Hi! Ask me about Adrian’s projects, stack, or contact.\n\nType `help` to see all commands." },
  ]);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    boxRef.current?.scrollTo({ top: boxRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, open]);

  async function send() {
    const q = input.trim();
    if (!q) return;
    setMsgs(m => [...m, { role: "user", text: q }]);
    setInput("");
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: q }),
    });
    const data = (await res.json()) as { reply: string };
    setMsgs(m => [...m, { role: "bot", text: data.reply }]);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      {/* FAB + bubble (poți păstra versiunea ta curentă dacă ai deja) */}
      <div className="fixed bottom-4 right-4 z-50 flex items-end flex-col gap-3">
        {!open && (
          <div className="relative select-none">
            <div className="rounded-full bg-black text-white text-xs px-3 py-2 shadow-lg animate-pulse">
              Ask me!
            </div>
            <div
              className="absolute -bottom-1 right-3"
              aria-hidden
              style={{
                width: 0, height: 0,
                borderLeft: "6px solid transparent",
                borderRight: "6px solid transparent",
                borderTop: "6px solid #000",
              }}
            />
          </div>
        )}

        <button
          aria-label={open ? "Close assistant" : "Open assistant"}
          onClick={() => setOpen(v => !v)}
          className="relative h-14 w-14 rounded-full bg-black shadow-xl ring-1 ring-white/10 grid place-items-center"
        >
          {!open && <span className="absolute inline-flex h-full w-full rounded-full animate-ping bg-black/40" />}
          <Image src="/logo.svg" alt="Logo" width={28} height={28} className="relative" priority />
        </button>
      </div>

      {open && (
        <div
          role="dialog"
          aria-label="Portfolio Assistant"
          className="fixed z-50 bottom-24 right-4 w-[min(92vw,28rem)] h-[min(70vh,34rem)] rounded-xl border bg-background text-foreground shadow-2xl flex flex-col"
        >
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="font-medium">Portfolio Assistant</div>
            <button onClick={() => setOpen(false)} aria-label="Close" className="rounded-md p-1 hover:bg-muted">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div ref={boxRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                  <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap break-words">
                    <ReactMarkdown
                      components={{ a: LinkRenderer }}
                    >
                      {m.text}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t p-3 flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && send()}
              placeholder="Try: projects · featured · projects in Angular"
              className="flex-1 rounded-md border bg-background px-3 py-2"
            />
            <button onClick={send} className="rounded-md bg-primary text-primary-foreground px-3">
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}