import { useEffect, useRef } from "react";
import { ArrowUp } from "lucide-react";

export function Composer({
  value,
  onChange,
  onSend,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  disabled?: boolean;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  }, [value]);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  const canSend = value.trim().length > 0 && !disabled;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-4 pt-2">
      <div className="relative flex items-end gap-2 rounded-3xl border border-border/70 bg-card/80 backdrop-blur-xl shadow-lg shadow-black/[0.03] focus-within:border-accent/60 transition-colors">
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (canSend) onSend();
            }
          }}
          rows={1}
          placeholder="Ask me anything about RM..."
          className="flex-1 resize-none bg-transparent px-5 py-4 text-[15px] leading-relaxed placeholder:text-muted-foreground/70 focus:outline-none max-h-[200px]"
        />
        <button
          onClick={onSend}
          disabled={!canSend}
          aria-label="Send"
          className="m-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed enabled:hover:scale-105"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      </div>
      <p className="mt-2 text-center text-[11px] text-muted-foreground/70">
        A study, not the real thing. Answers may drift — check the sources.
      </p>
    </div>
  );
}
