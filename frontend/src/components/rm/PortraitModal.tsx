import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import portrait from "@/assets/rm-portrait.jpg";

export function PortraitModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-3xl border-border/60 bg-card/95 backdrop-blur-xl p-0 overflow-hidden">
        <div className="relative">
          <img src={portrait} alt="Portrait" className="w-full aspect-square object-cover" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-card to-transparent" />
        </div>
        <div className="p-6 pt-4 space-y-4">
          <DialogHeader className="space-y-1 text-left">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Museum placard</div>
            <DialogTitle className="font-serif text-2xl font-medium">Kim Namjoon · RM</DialogTitle>
            <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
              Poet, producer, and the quiet architect of BTS. A reader who prefers museums to malls,
              solo albums that feel like handwritten notebooks, and long walks that end in art.
            </DialogDescription>
          </DialogHeader>
          <ul className="space-y-2 text-sm text-foreground/85">
            <li className="flex gap-2"><span aria-hidden>🌿</span> Keeps plants like other people keep pets.</li>
            <li className="flex gap-2"><span aria-hidden>📚</span> Reads Murakami on tour, cites Rothko in interviews.</li>
            <li className="flex gap-2"><span aria-hidden>✍️</span> Wrote the UN speech titled <em>Speak Yourself</em>, 2018.</li>
          </ul>
          <p className="text-xs text-muted-foreground italic">
            This assistant isn't Namjoon — it's a study of his words, gently arranged.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
