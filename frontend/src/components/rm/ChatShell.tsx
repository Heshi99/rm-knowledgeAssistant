import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Image as ImageIcon } from "lucide-react";
import { HeroEmptyState } from "./HeroEmptyState";
import { ChatBubble, TypingIndicator, type Message } from "./ChatBubble";
import { Composer } from "./Composer";
import { PortraitModal } from "./PortraitModal";
import { Sidebar, type Conversation } from "./Sidebar";
import { askRM, type ChatTurn } from "@/lib/rm-api";

interface StoredConvo extends Conversation {
  messages: Message[];
}

const STORAGE_KEY = "rm-assistant:convos";

function loadConvos(): StoredConvo[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredConvo[]) : [];
  } catch {
    return [];
  }
}

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

export function ChatShell() {
  const [hydrated, setHydrated] = useState(false);
  const [convos, setConvos] = useState<StoredConvo[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [portraitOpen, setPortraitOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  // Hydrate from localStorage after mount
  useEffect(() => {
    const stored = loadConvos();
    setConvos(stored);
    setActiveId(stored[0]?.id ?? null);
    const savedTheme = (typeof window !== "undefined" && window.localStorage.getItem("rm-assistant:theme")) as
      | "light"
      | "dark"
      | null;
    setTheme(savedTheme || "dark");
    setHydrated(true);
  }, []);

  // Apply theme
  useLayoutEffect(() => {
    if (!hydrated) return;
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    window.localStorage.setItem("rm-assistant:theme", theme);
  }, [theme, hydrated]);

  // Persist
  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(convos));
  }, [convos, hydrated]);

  const active = useMemo(() => convos.find((c) => c.id === activeId) ?? null, [convos, activeId]);
  const messages = active?.messages ?? [];
  const showHero = messages.length === 0 && !loading;

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, loading]);

  const handleNew = () => {
    setActiveId(null);
    setSidebarOpen(false);
  };

  const ensureActive = (): StoredConvo => {
    if (active) return active;
    const c: StoredConvo = { id: makeId(), title: "New conversation", createdAt: Date.now(), messages: [] };
    setConvos((prev) => [c, ...prev]);
    setActiveId(c.id);
    return c;
  };

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    const convo = ensureActive();
    const userMsg: Message = { id: makeId(), role: "user", content: trimmed };
    const isFirst = convo.messages.length === 0;

    setConvos((prev) =>
      prev.map((c) =>
        c.id === convo.id
          ? {
              ...c,
              title: isFirst ? trimmed.slice(0, 48) : c.title,
              messages: [...c.messages, userMsg],
            }
          : c,
      ),
    );
    setInput("");
    setLoading(true);

    const history: ChatTurn[] = [...convo.messages, userMsg].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const res = await askRM(trimmed, history.slice(0, -1));
      const assistant: Message = {
        id: makeId(),
        role: "assistant",
        content: res.answer,
        sources: res.context,
      };
      setConvos((prev) =>
        prev.map((c) => (c.id === convo.id ? { ...c, messages: [...c.messages, assistant] } : c)),
      );
    } catch (err) {
      const assistant: Message = {
        id: makeId(),
        role: "assistant",
        content:
          "Something got in the way of that answer. The backend might be asleep — try again in a moment.",
        error: true,
      };
      setConvos((prev) =>
        prev.map((c) => (c.id === convo.id ? { ...c, messages: [...c.messages, assistant] } : c)),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex h-[100dvh] w-full overflow-hidden bg-background text-foreground bg-grain">
      <Sidebar
        conversations={convos.map(({ id, title, createdAt }) => ({ id, title, createdAt }))}
        activeId={activeId}
        onSelect={(id) => {
          setActiveId(id);
          setSidebarOpen(false);
        }}
        onNew={handleNew}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
      />

      <main className="relative flex flex-1 flex-col">
        {/* portrait quick-open when in chat mode */}
        {!showHero && (
          <button
            onClick={() => setPortraitOpen(true)}
            aria-label="Open portrait"
            className="absolute right-4 top-4 z-10 h-9 w-9 rounded-full overflow-hidden ring-1 ring-border/60 hover:ring-accent/60 transition"
          >
            <ImageIcon className="sr-only" />
            <img
              src={new URL("../../assets/rm-portrait.jpg", import.meta.url).toString()}
              alt=""
              className="h-full w-full object-cover"
            />
          </button>
        )}

        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col px-4 pt-16 md:pt-10">
            <AnimatePresence mode="wait">
              {showHero ? (
                <motion.div
                  key="hero"
                  className="my-auto py-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35 }}
                >
                  <HeroEmptyState
                    onPortraitClick={() => setPortraitOpen(true)}
                    onSuggest={(q) => sendMessage(q)}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="thread"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-5 py-6"
                >
                  {messages.map((m) => (
                    <ChatBubble key={m.id} msg={m} />
                  ))}
                  {loading && <TypingIndicator />}
                  <div className="h-4" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="shrink-0 bg-gradient-to-t from-background via-background/95 to-transparent">
          <Composer
            value={input}
            onChange={setInput}
            onSend={() => sendMessage(input)}
            disabled={loading}
          />
        </div>
      </main>

      <PortraitModal open={portraitOpen} onOpenChange={setPortraitOpen} />
    </div>
  );
}
