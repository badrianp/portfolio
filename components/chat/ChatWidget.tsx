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
  const shouldScrollToBottomRef = useRef(true); // Track if we should auto-scroll

  // Helper to check if user is at bottom of chat
  const isAtBottom = (threshold = 50) => {
    if (!boxRef.current) return false;
    const { scrollTop, scrollHeight, clientHeight } = boxRef.current;
    return scrollHeight - scrollTop - clientHeight < threshold;
  };

  // Helper to scroll to bottom
  const scrollToBottom = (smooth = false) => {
    if (!boxRef.current) return;
    if (smooth) {
      boxRef.current.scrollTo({ top: boxRef.current.scrollHeight, behavior: "smooth" });
    } else {
      boxRef.current.scrollTop = boxRef.current.scrollHeight;
    }
  };

  // Reset scroll behavior when chat opens
  useEffect(() => {
    if (open) {
      shouldScrollToBottomRef.current = true; // Start with auto-scroll enabled
    }
  }, [open]);

  // Track user scroll to determine if we should auto-scroll
  useEffect(() => {
    if (!open || !boxRef.current) return;
    
    const handleScroll = () => {
      // If user scrolls up, disable auto-scroll
      // If user scrolls to bottom, enable auto-scroll
      shouldScrollToBottomRef.current = isAtBottom(50);
    };

    const scrollContainer = boxRef.current;
    scrollContainer.addEventListener("scroll", handleScroll, { passive: true });
    
    return () => {
      scrollContainer.removeEventListener("scroll", handleScroll);
    };
  }, [open]);

  // Scroll to bottom when new message is added - ALWAYS (standard chat behavior)
  useEffect(() => {
    if (!open || msgs.length <= 1) return; // Skip initial message
    
    // Always scroll to bottom when new message arrives (standard chat UX)
    requestAnimationFrame(() => {
      scrollToBottom(true);
      // Update ref to reflect that we're now at bottom
      shouldScrollToBottomRef.current = true;
    });
  }, [msgs, open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    
    if (isMobile) {
      // On mobile: prevent body scroll when chat is open
      const prevOverflow = document.body.style.overflow;
      const prevPosition = document.body.style.position;
      const prevTop = document.body.style.top;
      const prevWidth = document.body.style.width;
      
      // Save current scroll position
      const scrollY = window.scrollY;
      
      // Lock body scroll on mobile
    document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      
      return () => {
        // Restore body styles
        document.body.style.overflow = prevOverflow;
        document.body.style.position = prevPosition;
        document.body.style.top = prevTop;
        document.body.style.width = prevWidth;
        
        // Restore scroll position
        window.scrollTo(0, scrollY);
        setViewportHeight(null);
      };
    } else {
      // On desktop: don't block scroll - allow normal page scrolling
      // No body style changes needed
    return () => {
        setViewportHeight(null);
    };
    }
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
    const container = sheet?.parentElement;
    if (!sheet || !container) return;

    // State tracking
    let isKeyboardOpen = false;
    let lastVisualHeight = vv.height;
    let lastVisualOffsetTop = vv.offsetTop || 0;
    let updateTimeout: NodeJS.Timeout | null = null;
    let rafId: number | null = null;
    let pendingScroll = false; // Track if we have a pending scroll operation

    const updateHeight = () => {
      const windowHeight = window.innerHeight;
      const visualHeight = vv.height;
      const visualOffsetTop = vv.offsetTop || 0;
      
      // Detect keyboard: viewport is significantly smaller OR has offset (iOS Safari)
      const viewportDiff = windowHeight - visualHeight;
      const keyboardThreshold = 100; // pixels
      const keyboardIsOpen = viewportDiff > keyboardThreshold || visualOffsetTop > 0;
      
      // Check if dimensions actually changed (avoid unnecessary updates)
      const heightChanged = Math.abs(visualHeight - lastVisualHeight) > 2;
      const offsetChanged = Math.abs(visualOffsetTop - lastVisualOffsetTop) > 2;
      const needsUpdate = heightChanged || offsetChanged;
      
      // IMPORTANT: Check scroll position BEFORE updating dimensions
      // This ensures we capture the correct state before layout changes
      const wasAtBottom = boxRef.current ? isAtBottom(50) : false;
      const shouldMaintainBottom = wasAtBottom && shouldScrollToBottomRef.current;
      
      if (keyboardIsOpen && !isKeyboardOpen) {
        // Keyboard just opened - resize container
        isKeyboardOpen = true;
        
        // Update dimensions
        setViewportHeight(visualHeight);
        lastVisualHeight = visualHeight;
        lastVisualOffsetTop = visualOffsetTop;
        
        // Position container to fill visible viewport
        (container as HTMLElement).style.position = "fixed";
        (container as HTMLElement).style.top = `${visualOffsetTop}px`;
        (container as HTMLElement).style.left = "0";
        (container as HTMLElement).style.right = "0";
        (container as HTMLElement).style.bottom = "auto";
        (container as HTMLElement).style.height = `${visualHeight}px`;
        (container as HTMLElement).style.maxHeight = `${visualHeight}px`;
        (sheet as HTMLElement).style.height = "100%";
        (sheet as HTMLElement).style.maxHeight = "100%";
        
        // DON'T scroll - let the browser handle scroll position naturally
        // When dimensions change, the browser automatically maintains relative scroll position
        // If user was at bottom, they'll stay at bottom naturally
        // If user was scrolled up, they'll stay at that relative position
        pendingScroll = false;
        
      } else if (!keyboardIsOpen && isKeyboardOpen) {
        // Keyboard just closed
        isKeyboardOpen = false;
        pendingScroll = false; // Cancel any pending scroll
        
        setViewportHeight(null);
        lastVisualHeight = vv.height;
        lastVisualOffsetTop = 0;
        
        // Reset to default positioning
        (container as HTMLElement).style.position = "";
        (container as HTMLElement).style.top = "";
        (container as HTMLElement).style.left = "";
        (container as HTMLElement).style.right = "";
        (container as HTMLElement).style.bottom = "";
        (container as HTMLElement).style.height = "";
        (container as HTMLElement).style.maxHeight = "";
        (sheet as HTMLElement).style.height = "";
        (sheet as HTMLElement).style.maxHeight = "";
        
        // Don't scroll when keyboard closes - preserve user's position
        
      } else if (keyboardIsOpen && needsUpdate) {
        // Keyboard is open and dimensions changed (during animation)
        // Just update dimensions - browser will handle scroll position naturally
        setViewportHeight(visualHeight);
        (container as HTMLElement).style.top = `${visualOffsetTop}px`;
        (container as HTMLElement).style.height = `${visualHeight}px`;
        (container as HTMLElement).style.maxHeight = `${visualHeight}px`;
        lastVisualHeight = visualHeight;
        lastVisualOffsetTop = visualOffsetTop;
        
        // DON'T scroll - let browser maintain relative scroll position naturally
        // The browser automatically preserves scroll position when container size changes
        pendingScroll = false;
      }
    };

    // Debounced update function (throttle to ~60fps)
    const scheduleUpdate = () => {
      if (updateTimeout) clearTimeout(updateTimeout);
      updateTimeout = setTimeout(updateHeight, 16);
    };

    // Initial check
    updateHeight();
    
    // Listen to visual viewport changes (primary method)
    vv.addEventListener("resize", scheduleUpdate);
    vv.addEventListener("scroll", scheduleUpdate);
    
    // Fallback: listen to window resize
    window.addEventListener("resize", scheduleUpdate);
    
    // Polling as ultimate fallback (check every 200ms)
    const pollInterval = setInterval(updateHeight, 200);

    return () => {
      clearInterval(pollInterval);
      if (updateTimeout) clearTimeout(updateTimeout);
      if (rafId) cancelAnimationFrame(rafId);
      pendingScroll = false; // Cancel any pending scroll
      vv.removeEventListener("resize", scheduleUpdate);
      vv.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      setViewportHeight(null);
      (container as HTMLElement).style.position = "";
      (container as HTMLElement).style.top = "";
      (container as HTMLElement).style.left = "";
      (container as HTMLElement).style.right = "";
      (container as HTMLElement).style.bottom = "";
      (container as HTMLElement).style.height = "";
      (container as HTMLElement).style.maxHeight = "";
      (sheet as HTMLElement).style.height = "";
      (sheet as HTMLElement).style.maxHeight = "";
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
                    // When input is focused, keyboard will open
                    // Trigger viewport checks at multiple intervals to catch animation
                    // The visual viewport events should handle this, but we ensure it works
                    const checkViewport = () => {
                      const vv = (window as any).visualViewport as VisualViewport | undefined;
                      if (vv) {
                        vv.dispatchEvent(new Event("resize"));
                      }
                      window.dispatchEvent(new Event("resize"));
                    };
                    
                    // Check immediately and at intervals to catch keyboard animation
                    checkViewport();
                    [100, 250, 400, 600].forEach((delay) => {
                      setTimeout(checkViewport, delay);
                    });
                  }}
                  onBlur={() => {
                    // When input loses focus, keyboard might close
                    // Check after delay to allow keyboard animation to complete
                    setTimeout(() => {
                      const vv = (window as any).visualViewport as VisualViewport | undefined;
                      if (vv) {
                        vv.dispatchEvent(new Event("resize"));
                      }
                      window.dispatchEvent(new Event("resize"));
                    }, 200);
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