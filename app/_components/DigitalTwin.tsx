"use client";

import {
  FormEvent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  pending?: boolean;
  errored?: boolean;
};

const SUGGESTIONS = [
  "What kind of role are you looking for?",
  "Tell me about your Angular SSR work at loanDepot.",
  "How do you approach shared component libraries?",
  "Why frontend architecture specifically?",
];

const GREETING: Message = {
  id: "greeting",
  role: "assistant",
  content:
    "Hey — I'm Todd's digital twin. Ask me about my career, the work I've done at loanDepot, my approach to frontend architecture, or whether I'd be a fit for a role you're hiring for.",
};

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export default function DigitalTwin() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [sending, setSending] = useState(false);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape" && open) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || sending) return;

      const userMsg: Message = {
        id: uid(),
        role: "user",
        content: trimmed,
      };
      const assistantId = uid();
      const assistantMsg: Message = {
        id: assistantId,
        role: "assistant",
        content: "",
        pending: true,
      };

      const next = [...messages, userMsg, assistantMsg];
      setMessages(next);
      setInput("");
      setSending(true);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: next
              .filter((m) => m.id !== assistantId && m.id !== "greeting")
              .map((m) => ({ role: m.role, content: m.content })),
          }),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          let errText = `Request failed (${res.status})`;
          try {
            const j = await res.json();
            if (j?.error) errText = j.error;
          } catch {}
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: errText, pending: false, errored: true }
                : m
            )
          );
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let acc = "";
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          acc += decoder.decode(value, { stream: true });
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: acc, pending: false }
                : m
            )
          );
        }
        if (acc.length === 0) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? {
                    ...m,
                    content:
                      "Hmm — I didn't get a response. Try again in a moment.",
                    pending: false,
                    errored: true,
                  }
                : m
            )
          );
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: m.content || "Stopped.", pending: false }
                : m
            )
          );
          return;
        }
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content:
                    "Network error reaching the model. Mind trying again?",
                  pending: false,
                  errored: true,
                }
              : m
          )
        );
      } finally {
        setSending(false);
        abortRef.current = null;
      }
    },
    [messages, sending]
  );

  const stop = () => abortRef.current?.abort();
  const reset = () => {
    abortRef.current?.abort();
    setMessages([GREETING]);
    setInput("");
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    send(input);
  };

  const onTextareaKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  return (
    <>
      {/* Launcher */}
      <button
        type="button"
        aria-label="Open chat with Todd's digital twin"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 md:bottom-7 md:right-7 z-40 group inline-flex items-center gap-3 pl-4 pr-5 py-3 rounded-full border border-[var(--border-strong)] bg-bg-elev/85 backdrop-blur-md text-fg shadow-[0_8px_40px_-8px_rgba(0,0,0,0.6)] hover:bg-bg-elev transition-all"
      >
        <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] text-black">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
          <span className="absolute -top-0.5 -right-0.5 inline-flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-70 pulse-dot" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--accent)]" />
          </span>
        </span>
        <span className="text-sm font-medium">Ask my digital twin</span>
      </button>

      {/* Backdrop + Panel */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!open}
      >
        <button
          aria-label="Close chat"
          onClick={() => setOpen(false)}
          className="absolute inset-0 bg-black/55 backdrop-blur-sm"
          tabIndex={open ? 0 : -1}
        />

        <div
          role="dialog"
          aria-modal="true"
          aria-label="Chat with Todd's digital twin"
          className={`absolute right-0 top-0 h-full w-full sm:w-[440px] md:w-[480px] bg-bg-elev border-l border-[var(--border)] shadow-2xl flex flex-col transition-transform duration-300 ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Header */}
          <header className="relative px-5 py-4 border-b border-[var(--border)] flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] text-black flex-shrink-0">
              <span className="text-sm font-semibold">TH</span>
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-[var(--accent)] border-2 border-bg-elev pulse-dot" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-fg leading-tight flex items-center gap-2">
                Todd Hitzeman
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono uppercase tracking-widest border border-[var(--accent)]/40 text-[var(--accent)]">
                  Digital Twin
                </span>
              </div>
              <div className="text-[11px] text-fg-dim font-mono mt-0.5">
                Powered by gpt-5.4-mini · Answers about my career
              </div>
            </div>
            <button
              onClick={reset}
              className="p-2 -mr-1 rounded-md text-fg-muted hover:text-fg hover:bg-white/[0.04] transition-colors"
              aria-label="Reset conversation"
              title="Reset"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
                <path d="M3 3v5h5" />
              </svg>
            </button>
            <button
              onClick={() => setOpen(false)}
              className="p-2 -mr-2 rounded-md text-fg-muted hover:text-fg hover:bg-white/[0.04] transition-colors"
              aria-label="Close"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </header>

          {/* Messages */}
          <div
            ref={scrollerRef}
            className="flex-1 overflow-y-auto px-5 py-6 space-y-5"
          >
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} />
            ))}

            {messages.length === 1 && (
              <div className="pt-2">
                <div className="text-[11px] font-mono uppercase tracking-[0.24em] text-fg-dim mb-3">
                  Try asking
                </div>
                <div className="flex flex-col gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="text-left px-3.5 py-2.5 rounded-lg border border-[var(--border)] hover:border-[var(--border-strong)] hover:bg-white/[0.025] text-sm text-fg-muted hover:text-fg transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Composer */}
          <form
            onSubmit={onSubmit}
            className="border-t border-[var(--border)] p-3.5"
          >
            <div className="relative flex items-end gap-2 rounded-xl border border-[var(--border-strong)] bg-bg p-2 focus-within:border-[var(--accent)]/60 transition-colors">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onTextareaKey}
                rows={1}
                placeholder="Ask about my career, stack, projects…"
                className="flex-1 resize-none bg-transparent text-sm text-fg placeholder:text-fg-dim outline-none px-2 py-1.5 max-h-32"
                disabled={sending}
              />
              {sending ? (
                <button
                  type="button"
                  onClick={stop}
                  className="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-fg transition-colors"
                  aria-label="Stop generation"
                >
                  <span className="block h-2.5 w-2.5 bg-fg" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-[var(--accent)] text-black disabled:opacity-40 disabled:cursor-not-allowed enabled:hover:bg-white transition-colors"
                  aria-label="Send"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
            <div className="mt-2 px-1 text-[10px] font-mono text-fg-dim flex items-center justify-between">
              <span>Enter to send · Shift+Enter for newline</span>
              <span>AI may misremember — verify anything important.</span>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`flex gap-2.5 max-w-[88%] ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        {!isUser && (
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] text-black text-[10px] font-semibold flex-shrink-0">
            TH
          </div>
        )}
        <div
          className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words ${
            isUser
              ? "bg-[var(--accent)] text-black rounded-br-md"
              : message.errored
              ? "bg-[var(--accent-3)]/10 border border-[var(--accent-3)]/30 text-fg rounded-bl-md"
              : "bg-white/[0.04] border border-[var(--border)] text-fg rounded-bl-md"
          }`}
        >
          {message.pending && !message.content ? (
            <span className="inline-flex items-center gap-1.5 py-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-fg-dim animate-bounce [animation-delay:-0.3s]" />
              <span className="h-1.5 w-1.5 rounded-full bg-fg-dim animate-bounce [animation-delay:-0.15s]" />
              <span className="h-1.5 w-1.5 rounded-full bg-fg-dim animate-bounce" />
            </span>
          ) : (
            message.content
          )}
        </div>
      </div>
    </div>
  );
}
