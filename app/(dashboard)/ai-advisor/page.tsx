"use client";
import { useState, useEffect, useRef } from "react";
import { TopBar } from "@/components/dashboard/TopBar";
import { Card, Button } from "@/components/ui";
import type { AIMessage } from "@/types";

const suggestedPrompts = [
  "What are my current active crops and their status?",
  "Summarise my livestock health events this month",
  "What's my net profit/loss for this month?",
  "Are there any withholding periods I should know about before sale?",
  "Which fields should I prioritise for soil testing?",
];

export default function AIAdvisorPage() {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      role: "assistant",
      content: "G'day! I'm your AIAG Farming AI Advisor. I have full context of your farm — fields, livestock, financials, weather, and compliance records. What would you like to know?",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const [orgName, setOrgName] = useState("your farm");
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load real org name for context
  useEffect(() => {
    fetch("/api/org")
      .then((r) => r.json())
      .then((d) => { if (d.org?.name) setOrgName(d.org.name); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: AIMessage = { role: "user", content: text, timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // Future: call a real AI endpoint with farm context
      // For now: acknowledge and reference real org name
      await new Promise((r) => setTimeout(r, 1000));
      const aiMsg: AIMessage = {
        role: "assistant",
        content: `I'm looking into that for ${orgName}. To connect this to a real AI model (e.g. Gemini or GPT-4), wire up a POST /api/ai-advisor route that receives your question along with your live farm data (fields, animals, financials) from the database and passes it to the LLM. Your question: "${text}"`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar
        title="AI Farm Advisor"
        subtitle={`Farm context loaded for ${orgName}`}
      />
      <div className="flex-1 flex overflow-hidden p-6 gap-6">
        {/* Chat */}
        <div className="flex-1 flex flex-col">
          <Card className="flex-1 overflow-y-auto mb-4" padding={false}>
            <div className="p-4 space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 bg-[#1A7A3A] rounded-full flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0 mt-0.5">
                      AI
                    </div>
                  )}
                  <div
                    className={`max-w-2xl px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-[#1A7A3A] text-white rounded-br-sm"
                        : "bg-[#F3F4F6] text-[#374151] rounded-bl-sm"
                    }`}
                  >
                    {msg.content.split("\n").map((line, j) => (
                      <p key={j} className={j > 0 ? "mt-2" : ""}>{line}</p>
                    ))}
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
              <div ref={bottomRef} />
            </div>
          </Card>

          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
              placeholder="Ask anything about your farm..."
              className="flex-1 px-4 py-3 border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A7A3A]/30 focus:border-[#1A7A3A] bg-white"
            />
            <Button onClick={() => sendMessage(input)} loading={loading} size="lg">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </Button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-72 flex-shrink-0">
          <Card>
            <h3 className="text-sm font-semibold text-[#1F2937] mb-3">Suggested Questions</h3>
            <div className="space-y-2">
              {suggestedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="w-full text-left text-xs text-gray-600 bg-[#F9FAFB] hover:bg-[#E8F5EC] hover:text-[#1A7A3A] border border-[#E5E7EB] rounded-lg px-3 py-2.5 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-[#E5E7EB]">
              <h3 className="text-sm font-semibold text-[#1F2937] mb-2">Farm Context</h3>
              <p className="text-xs text-gray-500">
                Connected to <span className="font-medium text-[#1A7A3A]">{orgName}</span>. Live data from fields, livestock, financials and compliance is available for AI analysis.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
