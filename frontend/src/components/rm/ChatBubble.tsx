import ReactMarkdown from "react-markdown";
import { motion } from "motion/react";
import portrait from "@/assets/rm-portrait.jpg";
import { SourceList } from "./SourceCard";
import type { SourceChunk } from "@/lib/rm-api";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: SourceChunk[];
  error?: boolean;
}

export function ChatBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <div className="mt-1 h-8 w-8 shrink-0 overflow-hidden rounded-full ring-1 ring-border/70">
          <img src={portrait} alt="" className="h-full w-full object-cover" />
        </div>
      )}
      <div className={`max-w-[75ch] ${isUser ? "order-1" : ""}`}>
        <div
          className={
            isUser
              ? "rounded-2xl rounded-tr-md bg-accent px-4 py-2.5 text-accent-foreground shadow-sm"
              : msg.error
                ? "rounded-2xl rounded-tl-md border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive"
                : "rounded-2xl rounded-tl-md bg-card/70 border border-border/50 px-4 py-3 text-foreground shadow-sm"
          }
        >
          {isUser ? (
            <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{msg.content}</p>
          ) : (
            <div className="prose-chat text-[15px]">
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          )}
        </div>
        {!isUser && msg.sources && <SourceList sources={msg.sources} />}
      </div>
    </motion.div>
  );
}

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center gap-3"
    >
      <div className="mt-1 h-8 w-8 shrink-0 overflow-hidden rounded-full ring-1 ring-border/70">
        <img src={portrait} alt="" className="h-full w-full object-cover" />
      </div>
      <div className="rounded-2xl rounded-tl-md bg-card/70 border border-border/50 px-4 py-3 shadow-sm">
        <div className="flex gap-1.5">
          <span className="typing-dot h-1.5 w-1.5 rounded-full bg-muted-foreground" style={{ animationDelay: "0ms" }} />
          <span className="typing-dot h-1.5 w-1.5 rounded-full bg-muted-foreground" style={{ animationDelay: "150ms" }} />
          <span className="typing-dot h-1.5 w-1.5 rounded-full bg-muted-foreground" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </motion.div>
  );
}
