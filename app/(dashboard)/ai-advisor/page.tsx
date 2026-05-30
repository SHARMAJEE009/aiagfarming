"use client";
import { useState, useEffect, useRef } from "react";
import { TopBar } from "@/components/dashboard/TopBar";
import { Card, Button } from "@/components/ui";
import type { AIMessage } from "@/types";

const suggestedPrompts = [
  "What are my current active crops and their status?",
  "Summarise my livestock health events this month",
  "What's my net profit/loss based on my financial entries?",
  "Are there any withholding periods I should know about before sale?",
  "Which fields should I prioritise for soil testing?",
  "What crops are best suited to my soil conditions based on my soil reports?",
  "Give me an overview of my farm's financial health",
  "What livestock management actions should I take this week?",
];

// Lightweight markdown renderer — handles bold, italic, headings, lists, code
function MarkdownContent({ text, isUser }: { text: string; isUser: boolean }) {
  const muted = isUser ? "text-green-100" : "text-gray-400";

  const renderInline = (s: string, key: number) => {
    const parts: React.ReactNode[] = [];
    let rest = s;
    let i = 0;
    const re = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;
    let m: RegExpExecArray | null;
    let last = 0;
    re.lastIndex = 0;
    while ((m = re.exec(rest)) !== null) {
      if (m.index > last) parts.push(rest.slice(last, m.index));
      if (m[2]) parts.push(<strong key={i++}>{m[2]}</strong>);
      else if (m[3]) parts.push(<em key={i++}>{m[3]}</em>);
      else if (m[4]) parts.push(<code key={i++} className={`font-mono text-xs px-1 py-0.5 rounded ${isUser ? "bg-green-700" : "bg-gray-200"}`}>{m[4]}</code>);
      last = m.index + m[0].length;
    }
    if (last < rest.length) parts.push(rest.slice(last));
    return <span key={key}>{parts}</span>;
  };

  const lines = text.split("\n");
  const nodes: React.ReactNode[] = [];
  let ulBuffer: string[] = [];
  let olBuffer: { n: string; t: string }[] = [];

  const flushUl = (k: number) => {
    if (!ulBuffer.length) return;
    nodes.push(
      <ul key={`ul-${k}`} className="list-disc list-inside space-y-0.5 my-1 pl-1">
        {ulBuffer.map((t, j) => <li key={j} className="text-sm leading-relaxed">{renderInline(t, j)}</li>)}
      </ul>
    );
    ulBuffer = [];
  };
  const flushOl = (k: number) => {
    if (!olBuffer.length) return;
    nodes.push(
      <ol key={`ol-${k}`} className="list-decimal list-inside space-y-0.5 my-1 pl-1">
        {olBuffer.map((item, j) => <li key={j} className="text-sm leading-relaxed">{renderInline(item.t, j)}</li>)}
      </ol>
    );
    olBuffer = [];
  };

  lines.forEach((line, idx) => {
    const h3 = line.match(/^###\s+(.+)/);
    const h2 = line.match(/^##\s+(.+)/);
    const h1 = line.match(/^#\s+(.+)/);
    const ul = line.match(/^[-*]\s+(.+)/);
    const ol = line.match(/^(\d+)\.\s+(.+)/);
    const hr = line.match(/^---+$/);

    if (h1 || h2 || h3) {
      flushUl(idx); flushOl(idx);
      const txt = (h1?.[1] ?? h2?.[1] ?? h3?.[1])!;
      const cls = h1 ? "text-base font-bold mt-3 mb-1" : h2 ? "text-sm font-bold mt-2 mb-0.5" : `text-sm font-semibold mt-1.5 mb-0.5 ${muted}`;
      nodes.push(<p key={idx} className={cls}>{renderInline(txt, 0)}</p>);
    } else if (ul) {
      flushOl(idx);
      ulBuffer.push(ul[1]);
    } else if (ol) {
      flushUl(idx);
      olBuffer.push({ n: ol[1], t: ol[2] });
    } else if (hr) {
      flushUl(idx); flushOl(idx);
      nodes.push(<hr key={idx} className="my-2 border-gray-300" />);
    } else if (line.trim() === "") {
      flushUl(idx); flushOl(idx);
      nodes.push(<div key={idx} className="h-2" />);
    } else {
      flushUl(idx); flushOl(idx);
      nodes.push(<p key={idx} className="text-sm leading-relaxed">{renderInline(line, 0)}</p>);
    }
  });
  flushUl(lines.length);
  flushOl(lines.length + 1);

  return <div className="space-y-0.5">{nodes}</div>;
}

export default function AIAdvisorPage() {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      role: "assistant",
      content: "G'day! I'm your AIAG Farming AI Advisor. I have full access to your farm data — fields, crops, livestock, financials, soil reports, and more. Ask me anything about your farm and I'll give you specific, data-driven advice.",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const [orgName, setOrgName] = useState("your farm");
  const [error,   setError]   = useState("");

  // Ref on the scroll container itself — use scrollTop, not scrollIntoView,
  // so only the chat box scrolls and not the whole page.
  const scrollBoxRef  = useRef<HTMLDivElement>(null);
  const inputRef      = useRef<HTMLInputElement>(null);
  const msgCountRef   = useRef(messages.length);

  useEffect(() => {
    fetch("/api/org")
      .then((r) => r.json())
      .then((d) => { if (d.org?.name) setOrgName(d.org.name); })
      .catch(() => {});
  }, []);

  // Scroll to bottom only when a new message arrives or typing indicator shows.
  useEffect(() => {
    if (messages.length > msgCountRef.current || loading) {
      const box = scrollBoxRef.current;
      if (box) box.scrollTop = box.scrollHeight;
    }
    msgCountRef.current = messages.length;
  }, [messages, loading]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    setError("");
    const userMsg: AIMessage = { role: "user", content: text, timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch("/api/ai-advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history }),
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "AI service error");
      }

      const { reply } = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: reply, timestamp: new Date().toISOString() }]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setError(msg);
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar
        title="AI Farm Advisor"
        subtitle={`Powered by GPT-4.1-mini · Live farm data from ${orgName}`}
      />
      <div className="flex-1 flex overflow-hidden p-6 gap-6 min-h-0">
        {/* Chat panel */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Scroll container — ref goes here, not on a child sentinel div */}
          <div
            ref={scrollBoxRef}
            className="flex-1 overflow-y-auto min-h-0 mb-4 bg-white rounded-xl border border-[#E5E7EB] shadow-sm"
          >
            <div className="p-4 space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 bg-[#1A7A3A] rounded-full flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0 mt-0.5">
                      AI
                    </div>
                  )}
                  <div
                    className={`max-w-2xl px-4 py-3 rounded-2xl ${
                      msg.role === "user"
                        ? "bg-[#1A7A3A] text-white rounded-br-sm"
                        : "bg-[#F3F4F6] text-[#374151] rounded-bl-sm"
                    }`}
                  >
                    <MarkdownContent text={msg.content} isUser={msg.role === "user"} />
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="w-8 h-8 bg-[#1A7A3A] rounded-full flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0">
                    AI
                  </div>
                  <div className="bg-[#F3F4F6] px-4 py-3 rounded-2xl rounded-bl-sm">
                    <div className="flex gap-1.5">
                      {[0, 150, 300].map((delay) => (
                        <div key={delay} className="w-2 h-2 bg-[#1A7A3A] rounded-full animate-bounce" style={{ animationDelay: `${delay}ms` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="mb-3 px-4 py-2 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about your farm…"
              disabled={loading}
              className="flex-1 px-4 py-3 border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A7A3A]/30 focus:border-[#1A7A3A] bg-white disabled:opacity-60"
            />
            <Button onClick={() => sendMessage(input)} loading={loading} disabled={!input.trim()} size="lg">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </Button>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="w-72 flex-shrink-0 flex flex-col gap-4">
          <Card>
            <h3 className="text-sm font-semibold text-[#1F2937] mb-3">Suggested Questions</h3>
            <div className="space-y-2">
              {suggestedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  disabled={loading}
                  className="w-full text-left text-xs text-gray-600 bg-[#F9FAFB] hover:bg-[#E8F5EC] hover:text-[#1A7A3A] border border-[#E5E7EB] rounded-lg px-3 py-2.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="text-sm font-semibold text-[#1F2937] mb-2">Farm Context</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Connected to <span className="font-medium text-[#1A7A3A]">{orgName}</span>. The AI has live access to your fields, crops, livestock, health events, financials, and soil reports for accurate, farm-specific advice.
            </p>
            <div className="mt-3 pt-3 border-t border-[#E5E7EB]">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-gray-500">GPT-4.1-mini · Live data</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
