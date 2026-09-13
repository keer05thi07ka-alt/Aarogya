import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/health/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { Send, Phone } from "lucide-react";
import { store } from "@/lib/store";

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
      
      let replyText = "";
      let triage: "Emergency" | "Urgent" | "Routine" = "Routine";
      const lower = userMsg.toLowerCase();
      
      const isEmergency = ["blood", "accident", "chest", "heart", "snake", "breath", "retham", "raththam", "nenju", "vali", "mayakkam", "paambu", "moochu", "adi"].some(k => lower.includes(k));
      const isUrgent = ["fever", "pain", "vomit", "dengue", "juram", "kaichal", "vaanthi", "vanthi", "vairo"].some(k => lower.includes(k));

      if (isEmergency) {
        triage = "Emergency";
        replyText = `🚨 EMERGENCY DETECTED 🚨\n\nPriority: RED (Emergency)\nLive Wait Time: 0 mins (Bypass Queue)\n\n🏥 Match found: Gadchiroli District Hospital\n✅ Your Token: E-991\n\nPlease proceed immediately. Ambulance has been alerted.`;
      } else if (isUrgent) {
        triage = "Urgent";
        replyText = `🏥 Match found: Kurkheda Primary Health Centre\n\nPriority: YELLOW (Urgent)\nLive Wait Time: ~15 mins\n\n✅ Your Token: T-8492\n\nShow this SMS at the reception.`;
      } else {
        triage = "Routine";
        replyText = `🏥 Match found: Karanji Village Sub-Centre\n\nPriority: GREEN (Routine)\nLive Wait Time: ~45 mins\n\n✅ Your Token: R-102\n\nShow this SMS at the reception.`;
      }

      // Add to central database so it appears on the dashboard!
      store.addCase({
        caseId: `CASE-${new Date().toISOString().replace(/\D/g, "").slice(0, 14)}`,
        tokenId: `TKN-${Math.floor(Math.random() * 90000) + 10000}`,
        tokenNumber: triage === "Emergency" ? "E-991" : triage === "Urgent" ? "T-8492" : "R-102",
        patientRef: "SMS User",
        phone: "+91 XXXXX XXXXX",
        healthIssue: userMsg,
        analysis: {
          symptoms: [userMsg],
          duration: "N/A",
          severity: triage === "Emergency" ? "High" : triage === "Urgent" ? "Medium" : "Low",
          context: "SMS Booking",
          careRequirement: "Consultation",
          triage: triage,
          explanation: "AI SMS Triage",
          source: "ai"
        },
        phcId: "PHC-104", // Hardcoded to match manager's default facility
        facilityName: "North District PHC",
        district: "Gadchiroli",
        suitability: 100,
        status: "Waiting",
        reason: "SMS Booking",
        followUpRequired: false,
        createdAt: new Date().toISOString()
      });

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: replyText,
          sender: "bot",
          time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        },
      ]);
    }, 1500);
  };

  return (
    <AppShell title="Offline Mode Simulator" subtitle="How patients without smartphones or internet can book via standard SMS">
      <div className="mx-auto max-w-md overflow-hidden rounded-3xl border border-border bg-background shadow-xl">
        {/* SMS Header */}
        <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-3 text-card-foreground">
          <div className="flex size-10 items-center justify-center rounded-full bg-secondary">
            <span className="text-sm font-bold">55444</span>
          </div>
          <div>
            <p className="font-semibold">Aarogya SMS Govt Shortcode</p>
            <p className="text-xs text-muted-foreground">Text to book a token</p>
          </div>
        </div>

        {/* Chat Body */}
        <div className="flex h-[400px] flex-col gap-3 overflow-y-auto p-4 bg-muted/30">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                msg.sender === "user"
                  ? "self-end bg-blue-600 text-white rounded-br-sm"
                  : "self-start bg-secondary text-secondary-foreground rounded-bl-sm"
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.text}</p>
              <p className="mt-1 text-right text-[10px] opacity-60">{msg.time}</p>
            </div>
          ))}
          {isTyping && (
            <div className="self-start rounded-2xl rounded-bl-sm bg-secondary px-4 py-3 text-sm shadow-sm">
              <span className="flex gap-1">
                <span className="size-2 animate-bounce rounded-full bg-foreground/40"></span>
                <span className="size-2 animate-bounce rounded-full bg-foreground/40 delay-75"></span>
                <span className="size-2 animate-bounce rounded-full bg-foreground/40 delay-150"></span>
              </span>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input Area */}
        <div className="flex items-center gap-2 border-t border-border bg-card p-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Text Message"
            className="rounded-full bg-muted shadow-none focus-visible:ring-1 focus-visible:ring-blue-500"
          />
          <Button
            onClick={handleSend}
            size="icon"
            className="size-10 rounded-full bg-blue-600 hover:bg-blue-700"
          >
            <Send className="size-4 text-white" />
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
