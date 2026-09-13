import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/health/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { Send, Phone } from "lucide-react";

export const Route = createFileRoute("/whatsapp")({
  head: () => ({ meta: [{ title: "Offline SMS Booking — Aarogya Setu Kadi" }] }),
  component: WhatsappSimulator,
});

type Message = { id: number; text: string; sender: "user" | "bot"; time: string };

function WhatsappSimulator() {
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "👋 Namaste! Welcome to Aarogya Setu Kadi Offline Booking.\n\nReply with your symptoms to get a token for the nearest available health centre. (e.g. 'Fever for 3 days')",
      sender: "bot",
      time: "10:00 AM",
    },
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMsg = input.trim();
    const newMessages: Message[] = [
      ...messages,
      { id: Date.now(), text: userMsg, sender: "user", time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) },
    ];
    setMessages(newMessages);
    setInput("");
    setIsTyping(true);

    // Simulate bot reply
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: 🏥 Match found: North District PHC\n\nPriority: YELLOW (Moderate)\nLive Wait Time: ~15 mins\n\n✅ Your Token: T-8492\n\nShow this SMS at the reception.,
          sender: "bot",
          time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        },
      ]);
    }, 1500);
  };

  return (
    <AppShell title="Offline Mode Simulator" subtitle="How patients without smartphones or internet can book via SMS / WhatsApp">
      <div className="mx-auto max-w-md overflow-hidden rounded-3xl border border-border bg-[#efeae2] shadow-xl dark:bg-[#0b141a]">
        {/* WhatsApp Header */}
        <div className="flex items-center gap-3 bg-[#008069] px-4 py-3 text-white dark:bg-[#202c33]">
          <div className="flex size-10 items-center justify-center rounded-full bg-white/20">
            <Phone className="size-5" />
          </div>
          <div>
            <p className="font-semibold">Aarogya SMS Booking</p>
            <p className="text-xs text-white/80">Online</p>
          </div>
        </div>

        {/* Chat Body */}
        <div className="flex h-[400px] flex-col gap-3 overflow-y-auto p-4 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-contain">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={max-w-[80%] rounded-lg p-3 text-sm shadow-sm }
            >
              <p className="whitespace-pre-wrap">{msg.text}</p>
              <p className="mt-1 text-right text-[10px] opacity-60">{msg.time}</p>
            </div>
          ))}
          {isTyping && (
            <div className="self-start rounded-lg bg-white p-3 text-sm shadow-sm dark:bg-[#202c33]">
              <span className="flex gap-1">
                <span className="size-2 animate-bounce rounded-full bg-gray-400"></span>
                <span className="size-2 animate-bounce rounded-full bg-gray-400 delay-75"></span>
                <span className="size-2 animate-bounce rounded-full bg-gray-400 delay-150"></span>
              </span>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input Area */}
        <div className="flex items-center gap-2 bg-[#f0f2f5] p-3 dark:bg-[#202c33]">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Message (e.g. Fever)..."
            className="rounded-full border-none bg-white shadow-sm focus-visible:ring-0 dark:bg-[#2a3942]"
          />
          <Button
            onClick={handleSend}
            size="icon"
            className="size-10 rounded-full bg-[#00a884] hover:bg-[#008f6f]"
          >
            <Send className="size-4 text-white" />
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
