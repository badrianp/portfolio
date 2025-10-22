"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import NextLink from "next/link";
import ReactMarkdown from "react-markdown";
import { Send, X } from "lucide-react";
// import remarkGfm from "remark-gfm";

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
    {
      role: "bot",
      text: "Hi! Ask me about Adrian’s projects, stack, or contact.\n\nType `help` to see all commands.",
    },
  ]);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    boxRef.current?.scrollTo({ top: boxRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const vv = (window as any).visualViewport as VisualViewport | undefined;
    if (!vv) return;

    const sheet = document.getElementById("chat-sheet");
    const scroll = document.getElementById("chat-scroll");
    if (!sheet || !scroll) return;

    const onResize = () => {
      const keyboard = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      sheet.style.transform = keyboard ? `translateY(-${keyboard}px)` : "translateY(0)";
      scroll.scrollTop = scroll.scrollHeight;
    };

    vv.addEventListener("resize", onResize);
    vv.addEventListener("scroll", onResize);
    onResize();
    return () => {
      vv.removeEventListener("resize", onResize);
      vv.removeEventListener("scroll", onResize);
    };
  }, [open]);

  const STRICT = ["help", "commands", "about", "contact", "projects", "featured", "skills", "stack"];

  function isStrictCommand(msg: string) {
    const m = msg.trim().toLowerCase();
    return STRICT.some((c) => m === c || m.startsWith("projects in ") || m.startsWith("project "));
  }

  async function send() {
    const q = input.trim();
    if (!q) return;
    setMsgs((m) => [...m, { role: "user", text: q }]);
    setInput("");

    const endpoint = isStrictCommand(q) ? "/api/chat" : "/api/ai-chat";

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: q,
        history: msgs.slice(-10).map((m) => ({
          role: m.role === "user" ? "user" : "assistant",
          content: m.text,
        })),
      }),
    });
    const data = (await res.json()) as { reply: string };
    setMsgs((m) => [...m, { role: "bot", text: data.reply }]);
  }

  return (
    <>
      <div className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-4 z-50 flex items-end flex-col gap-3">
        {!open && (
          <div className="relative select-none hidden sm:block">
            <div className="rounded-full bg-black text-white text-xs px-3 py-2 shadow-lg animate-pulse">
              Ask me!
            </div>
            <div
              className="absolute -bottom-1 right-3"
              aria-hidden
              style={{
                width: 0,
                height: 0,
                borderLeft: "6px solid transparent",
                borderRight: "6px solid transparent",
                borderTop: "6px solid #000",
              }}
            />
          </div>
        )}

        <button
          aria-label={open ? "Close assistant" : "Open assistant"}
          onClick={() => setOpen((v) => !v)}
          className={
            open
              ? "hidden md:grid relative h-14 w-14 rounded-full bg-black shadow-xl ring-1 ring-white/10 place-items-center"
              : "grid relative h-14 w-14 rounded-full bg-black shadow-xl ring-1 ring-white/10 place-items-center"
          }
        >
          {!open && <span className="absolute inline-flex h-full w-full rounded-full animate-ping bg-black/40" />}
          <Image src="/logo.svg" alt="Logo" width={28} height={28} className="relative" priority />
        </button>
      </div>

      {/* Bottom sheet chat */}
      {open && (
        <div
          className="
            fixed z-50
            inset-x-0 bottom-0               /* mobile: full-width bottom sheet */
            md:inset-auto md:bottom-24 md:right-4 /* desktop: float bottom-right */
          "
          role="dialog"
          aria-label="Portfolio Assistant"
        >
          <div
            id="chat-sheet"
            className="
              flex flex-col border bg-background text-foreground shadow-2xl
              rounded-t-2xl md:rounded-xl
              w-full md:w-[min(92vw,28rem)]
              /* mobile height (sheet) vs desktop height (panel) */
              h-[min(75dvh,34rem)] md:h-[min(70vh,34rem)]
              /* center on mobile, stick right on desktop */
              mx-auto md:mx-0 md:ml-auto
              /* subtle slide-up animation on open */
              transition-transform duration-300 will-change-transform
            "
            style={{
              /* iOS safe-area + real viewport units */
              maxHeight: "calc(100dvh - env(safe-area-inset-top) - 8px)",
            }}
          >
            {/* header */}
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="font-medium">Portfolio Assistant</div>
              <button onClick={() => setOpen(false)} aria-label="Close" className="rounded-md p-1 hover:bg-muted">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* content – scrollable */}
            <div
              id="chat-scroll"
              ref={boxRef}
              className="flex-1 overflow-y-auto p-4 space-y-3"
              style={{
                maxHeight: "calc(100% - 48px - 56px - env(safe-area-inset-bottom))",
                overscrollBehavior: "contain",
              }}
            >
              {msgs.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                      m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                    }`}
                  >
                    <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap break-words">
                      <ReactMarkdown components={{ a: LinkRenderer }}>
                        {m.text}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* input bar */}
            <div className="border-t px-3 py-2 bg-background" style={{ paddingBottom: "calc(0.5rem + env(safe-area-inset-bottom))" }}>
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="Try: projects · featured · projects in Angular"
                  className="flex-1 rounded-md border bg-background px-3 py-2 text-base"
                />
                <button
                  onClick={send}
                  className="rounded-md bg-primary text-primary-foreground px-3 py-2 flex items-center justify-center"
                  aria-label="Send"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}