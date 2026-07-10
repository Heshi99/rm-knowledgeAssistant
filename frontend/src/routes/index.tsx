import { createFileRoute } from "@tanstack/react-router";
import { ChatShell } from "@/components/rm/ChatShell";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return <ChatShell />;
}
