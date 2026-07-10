import { Plus, Moon, Sun, MessageSquare, X, Menu } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
}

export function Sidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  theme,
  onToggleTheme,
  open,
  onOpenChange,
}: {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const content = (
    <div className="flex h-full w-72 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="flex items-center justify-between px-4 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-accent" />
          <span className="font-serif text-lg tracking-tight">Namu AI 🌳</span>
        </div>
        <button
          className="md:hidden rounded-full p-1.5 hover:bg-sidebar-accent"
          onClick={() => onOpenChange(false)}
          aria-label="Close sidebar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="px-3 pb-3">
        <button
          onClick={onNew}
          className="flex w-full items-center gap-2 rounded-2xl border border-sidebar-border bg-sidebar-accent/40 hover:bg-sidebar-accent px-3 py-2.5 text-sm transition-colors"
        >
          <Plus className="h-4 w-4" />
          New chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2">
        <div className="px-2 py-2 text-[11px] uppercase tracking-wider text-muted-foreground">
          Conversations
        </div>
        {conversations.length === 0 && (
          <div className="px-3 py-4 text-xs text-muted-foreground italic">
            Nothing yet. Say hi. 🌿
          </div>
        )}
        <ul className="space-y-0.5">
          {conversations.map((c) => (
            <li key={c.id}>
              <button
                onClick={() => onSelect(c.id)}
                className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                  activeId === c.id
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "hover:bg-sidebar-accent/50 text-sidebar-foreground/85"
                }`}
              >
                <MessageSquare className="h-3.5 w-3.5 shrink-0 opacity-70" />
                <span className="truncate">{c.title || "Untitled"}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-sidebar-border p-3">
        <button
          onClick={onToggleTheme}
          className="flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-sm hover:bg-sidebar-accent transition-colors"
        >
          <span className="flex items-center gap-2 text-muted-foreground">
            {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            {theme === "dark" ? "Dark" : "Light"} mode
          </span>
          <span className="text-[11px] text-muted-foreground/70">toggle</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden md:block">{content}</aside>

      {/* Mobile trigger */}
      <button
        onClick={() => onOpenChange(true)}
        className="md:hidden fixed left-3 top-3 z-30 rounded-full border border-border/60 bg-card/80 backdrop-blur p-2 shadow-sm"
        aria-label="Open sidebar"
      >
        <Menu className="h-4 w-4" />
      </button>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => onOpenChange(false)}
              className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 24, stiffness: 220 }}
              className="md:hidden fixed inset-y-0 left-0 z-50"
            >
              {content}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
