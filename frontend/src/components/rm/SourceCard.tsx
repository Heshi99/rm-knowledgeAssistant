import { useState } from "react";
import { ChevronDown, FileText } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { SourceChunk } from "@/lib/rm-api";

export function SourceList({ sources }: { sources: SourceChunk[] }) {
  const [open, setOpen] = useState(false);
  if (!sources?.length) return null;
  return (
    <div className="mt-3">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/60 px-3 py-1 text-xs text-muted-foreground hover:text-foreground hover:border-border transition-colors"
      >
        <FileText className="h-3 w-3" />
        {sources.length} source{sources.length > 1 ? "s" : ""}
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="mt-2 grid gap-2">
              {sources.map((s, i) => (
                <div key={i} className="rounded-2xl border border-border/60 bg-card/70 p-3">
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
                    {s.source}
                  </div>
                  <p className="text-xs leading-relaxed text-foreground/80 line-clamp-6 whitespace-pre-wrap">
                    {s.content}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
