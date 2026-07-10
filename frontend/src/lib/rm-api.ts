// Change this to point at a deployed backend later.
export const RM_API_BASE =
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_RM_API_BASE) ||
  "http://localhost:8000";

export type ChatRole = "user" | "assistant";
export interface ChatTurn { role: ChatRole; content: string }
export interface SourceChunk { source: string; content: string }
export interface ChatResponse { answer: string; context: SourceChunk[] }

export async function askRM(
  question: string,
  history: ChatTurn[],
  signal?: AbortSignal,
): Promise<ChatResponse> {
  const res = await fetch(`${RM_API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, history }),
    signal,
  });
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return (await res.json()) as ChatResponse;
}
