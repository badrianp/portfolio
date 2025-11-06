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
      text: "Hi! Ask me about Adrian's projects, stack, or contact.\n\nType `help` to see all commands.",
    },
  ]);
  const boxRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);

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
      setViewportHeight(null);
    };
  }, [open]);

  // Handle Visual Viewport API for mobile keyboard
  useEffect(() => {
    if (!open) return;
    
    const vv = (window as any).visualViewport as VisualViewport | undefined;
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    
    if (!vv || !isMobile) {
      // Desktop or no Visual Viewport API: use CSS defaults
      setViewportHeight(null);
      return;
    }

    const sheet = document.getElementById("chat-sheet");
    if (!sheet) return;

    const updateHeight = () => {
      // Calculate the difference between window height and visual viewport height
      // This indicates if the keyboard is open
      const windowHeight = window.innerHeight;
      const visualHeight = vv.height;
      const visualOffsetTop = vv.offsetTop || 0;
      
      // Keyboard is likely open if visual viewport is significantly smaller
      // or if there's a significant offset (iOS Safari behavior)
      const keyboardHeight = windowHeight - visualHeight - visualOffsetTop;
      const keyboardThreshold = 150; // pixels
      
      if (keyboardHeight > keyboardThreshold) {
        // Keyboard is open: use the visual viewport height
        // AND adjust position to account for viewport offset
        setViewportHeight(visualHeight);
        
        // Adjust position: move chat up by the offset amount
        // This ensures the chat stays within the visible viewport
        const offsetY = visualOffsetTop;
        (sheet as HTMLElement).style.transform = `translateY(-${offsetY}px)`;
      } else {
        // Keyboard is closed: reset to use CSS default (100dvh)
        setViewportHeight(null);
        (sheet as HTMLElement).style.transform = "translateY(0)";
      }
      
      // Scroll to bottom after height change to ensure latest message is visible
      requestAnimationFrame(() => {
        boxRef.current?.scrollTo({ 
          top: boxRef.current?.scrollHeight || 0, 
          behavior: "smooth" 
        });
      });
    };

    // Initial height calculation
    updateHeight();

    // Listen to viewport changes (keyboard open/close, orientation change, etc.)
    vv.addEventListener("resize", updateHeight);
    vv.addEventListener("scroll", updateHeight);
    
    // Fallback for browsers that don't fire visual viewport events properly
    window.addEventListener("resize", updateHeight);

    return () => {
      vv.removeEventListener("resize", updateHeight);
      vv.removeEventListener("scroll", updateHeight);
      window.removeEventListener("resize", updateHeight);
      setViewportHeight(null);
      if (sheet) {
        (sheet as HTMLElement).style.transform = "translateY(0)";
      }
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
          className="fixed z-50 inset-x-0 bottom-0 md:inset-auto md:bottom-24 md:right-4"
          role="dialog"
          aria-label="Portfolio Assistant"
        >
          <div
            id="chat-sheet"
            ref={sheetRef}
            className="flex flex-col border bg-background text-foreground shadow-2xl rounded-t-2xl md:rounded-xl w-full md:w-[min(92vw,28rem)] mx-auto md:mx-0 md:ml-auto transition-all duration-200 ease-out h-[100dvh] md:h-[min(70vh,34rem)]"
            style={{
              ...(viewportHeight && {
                height: `${viewportHeight}px`,
                maxHeight: `${viewportHeight}px`,
              }),
              ...(!viewportHeight && {
                maxHeight: "100dvh",
              }),
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
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  onFocus={() => {
                    // Trigger height recalculation when input is focused (keyboard opens)
                    setTimeout(() => {
                      const vv = (window as any).visualViewport as VisualViewport | undefined;
                      if (vv) {
                        vv.dispatchEvent(new Event("resize"));
                      }
                    }, 100);
                  }}
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