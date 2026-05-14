"use client";
import { useState } from "react";
import { TopBar } from "@/components/dashboard/TopBar";
import { Card, Button } from "@/components/ui";
import type { AIMessage } from "@/types";

const suggestedPrompts = [
  "When should I spray Paddock 4 this week?",
  "Which mob has the best weight gain this season?",
  "What's my estimated wheat yield based on current NDVI?",
  "Are there any withholding periods I should know about before sale?",
  "Which fields should I prioritise for soil testing?",
];

const mockResponses: Record<string, string> = {
  default: "Based on your farm data, I can see that Whitfield Station is currently in good shape. Your North Paddock A wheat crop is tracking at approximately 3.2 t/ha based on current NDVI readings — slightly below your 5-year average of 3.6 t/ha, likely due to the dry spell in late April. I'd recommend a urea top-dress if rain is forecast in the next 7–10 days.\n\nFor your livestock, the Breeding Cows #1 mob has maintained weight well. Consider moving them to Paddock 3 in the next 2 weeks as feed availability in their current paddock is dropping below optimal.",
};

export default function AIAdvisorPage() {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      role: "assistant",
      content: "G'day! I'm your AIAG Farming AI Advisor. I have full context of your farm — fields, livestock, financials, weather, and compliance records. What would you like to know?",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: AIMessage = { role: "user", content: text, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    const aiMsg: AIMessage = {
      role: "assistant",
      content: mockResponses[text] || mockResponses.default,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, aiMsg]);
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar
        title="AI Farm Advisor"
        subtitle="Powered by GPT-4o · Full context of your farm operations"
      />
      <div className="flex-1 flex overflow-hidden p-6 gap-6">
        {/* Chat */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
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
                      <div className="w-2 h-2 bg-[#1A7A3A] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-2 h-2 bg-[#1A7A3A] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-2 h-2 bg-[#1A7A3A] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Input */}
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
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </Button>
          </div>
        </div>

        {/* Suggested prompts */}
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
              <h3 className="text-sm font-semibold text-[#1F2937] mb-3">Farm Context</h3>
              <div className="space-y-2 text-xs text-gray-500">
                <div className="flex justify-between"><span>Fields active</span><span className="font-medium text-[#1F2937]">8</span></div>
                <div className="flex justify-between"><span>Animals tracked</span><span className="font-medium text-[#1F2937]">1,847</span></div>
                <div className="flex justify-between"><span>Weather updated</span><span className="font-medium text-[#1F2937]">2m ago</span></div>
                <div className="flex justify-between"><span>NDVI refreshed</span><span className="font-medium text-[#1F2937]">6h ago</span></div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
