import { motion } from "motion/react";
import { BookOpen, Sprout, Heart } from "lucide-react";
import portrait from "@/assets/rm-portrait.jpg";

const SUGGESTIONS = [
  "What does RM's Indigo album mean?",
  "Tell me about his UN speech",
  "Which artists shape his taste?",
];

const CHIPS = [
  { icon: BookOpen, title: "Grounded answers", body: "Cites the sources it pulled from." },
  { icon: Sprout, title: "Always learning", body: "The knowledge base keeps growing." },
  { icon: Heart, title: "Made with care", body: "A quiet personal project." },
];

export function HeroEmptyState({
  onPortraitClick,
  onSuggest,
}: {
  onPortraitClick: () => void;
  onSuggest: (q: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col items-center text-center max-w-2xl mx-auto px-4"
    >
      <button
        onClick={onPortraitClick}
        aria-label="Open portrait"
        className="group relative mb-8"
      >
        <div className="absolute -inset-3 rounded-full bg-gradient-to-tr from-sage/40 via-terracotta/30 to-sage/20 blur-xl opacity-70 group-hover:opacity-100 transition-opacity" />
        <div className="relative h-32 w-32 md:h-36 md:w-36 overflow-hidden rounded-full ring-1 ring-border/70 shadow-lg transition-transform group-hover:scale-[1.02]">
          <img src={portrait} alt="Portrait of Namjoon (artistic study)" className="h-full w-full object-cover" />
        </div>
      </button>

      <h1 className="font-serif text-3xl md:text-4xl font-medium tracking-tight text-balance leading-tight">
        Talk to someone who's read way too much about <em className="text-accent not-italic">Namjoon</em>.
      </h1>
      <p className="mt-4 text-[15px] md:text-base text-muted-foreground leading-relaxed max-w-lg text-balance">
        
        Music, art, books, speeches, museums, random interviews... it's probably in here. Ask away.
       <span aria-hidden>🌿</span>
      </p>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
        {CHIPS.map((c, i) => (
          <motion.div
            key={c.title}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.08 }}
            className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm p-4 text-left"
          >
            <c.icon className="h-4 w-4 text-accent mb-2" />
            <div className="text-sm font-medium">{c.title}</div>
            <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{c.body}</div>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-2">
        {SUGGESTIONS.map((s, i) => (
          <motion.button
            key={s}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 + i * 0.06 }}
            onClick={() => onSuggest(s)}
            className="rounded-full border border-border/70 bg-card/50 hover:bg-card hover:border-accent/50 transition-colors px-4 py-2 text-sm text-foreground/80 hover:text-foreground"
          >
            {s}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
