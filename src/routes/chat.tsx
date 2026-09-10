import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/health/AppShell";
import { RequireRole } from "@/components/health/RequireRole";
import { SymptomCard } from "@/components/health/SymptomCard";
import { FacilityCard } from "@/components/health/FacilityCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { analyseLocally } from "@/lib/triage";
import { analyseSymptoms } from "@/lib/ai.functions";
import { rankFacilities, type Ranked, type Coords } from "@/lib/recommend";
import { createCaseRecord } from "@/lib/tokens";
import { store, useAppState } from "@/lib/store";
import { DISTRICT_LIST } from "@/lib/dataset";
import type { SymptomAnalysis } from "@/lib/types";
import { LANGUAGES, STRINGS, type Lang, type ChipKey } from "@/lib/i18n";
import { Mic, Send, Loader2, MapPin } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/chat")({
  head: () => ({ meta: [{ title: "Symptom check — Aarogya Setu Kadi" }] }),
  component: ChatPage,
});

const CHIP_KEYS: ChipKey[] = ["fever", "cough", "injury", "pregnancy", "chronic", "emergency"];

type Turn =
  | { role: "bot"; text: string }
  | { role: "user"; text: string }
  | { role: "result"; analysis: SymptomAnalysis; ranked: Ranked[]; locatedByCoords: boolean };

export function ChatPage() {
  return (
    <RequireRole role="patient">
      <ChatPageContent />
    </RequireRole>
  );
}

function isValidPhone(phone: string): boolean {
  return /^[6-9]\d{9}$/.test(phone.trim());
}

function ChatPageContent() {
  const navigate = useNavigate();
  const { overrides, patientRef, patientPhone, lang } = useAppState();
  // Always use English source strings so Google Translate doesn't try to double-translate 
  // already localized text, which causes gibberish.
  const strings = STRINGS["en"];
  const [phoneTouched, setPhoneTouched] = useState(false);
  const phoneValid = isValidPhone(patientPhone);

  const [turns, setTurns] = useState<Turn[]>([{ role: "bot", text: strings.greeting }]);
  const [input, setInput] = useState("");
  const [district, setDistrict] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const recognitionRef = useRef<any>(null);

  // Location: request once on load. If granted, every recommendation is
  // genuinely distance-ranked. If denied/unavailable, we fall back to the
  // district picker and never imply proximity we don't actually have.
  const [userCoords, setUserCoords] = useState<Coords | undefined>(undefined);
  const [locationChecked, setLocationChecked] = useState(false);

  // Holds the original message text while we wait for the user to answer a
  // follow-up question about duration/severity. Cleared once combined.
  const awaitingDetailsRef = useRef<string | null>(null);

  // Update greeting if language changes and no chat history yet
  useEffect(() => {
    setTurns((prev) => {
      if (prev.length === 1 && prev[0].role === "bot") {
        return [{ role: "bot", text: strings.greeting }];
      }
      return prev;
    });
  }, [strings.greeting]);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocationChecked(true);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationChecked(true);
      },
      () => {
        setLocationChecked(true);
      },
      { timeout: 8000 },
    );
  }, []);

  async function runAnalysis(fullText: string): Promise<SymptomAnalysis> {
    let analysis: SymptomAnalysis = analyseLocally(fullText);
    try {
      const res = await analyseSymptoms({ data: { message: fullText } });
      if (res.ok) {
        analysis = { ...res.analysis, source: "ai" };
      }
    } catch {
      // stay on the rules-based analysis; this is expected offline / without an AI key
    }
    return analysis;
  }

  async function handleSend(text: string) {
    const message = text.trim();
    if (!message || busy) return;
    setInput("");
    setTurns((t) => [...t, { role: "user", text: message }]);
    setBusy(true);

    // Case 1: this message is the answer to a follow-up question we asked.
    // Combine it with the original description and analyse the whole thing.
    if (awaitingDetailsRef.current) {
      const combined = `${awaitingDetailsRef.current}. ${message}`;
      awaitingDetailsRef.current = null;
      setTurns((t) => [...t, { role: "bot", text: strings.searching }]);
      const analysis = await runAnalysis(combined);
      const ranked = rankFacilities(analysis, overrides, district || undefined, 3, userCoords);
      setTurns((t) => {
        const withoutTyping = t.slice(0, -1);
        return [
          ...withoutTyping,
          { role: "result", analysis, ranked, locatedByCoords: Boolean(userCoords) },
        ];
      });
      setBusy(false);
      return;
    }

    // Case 2: a fresh symptom description. Analyse it; if duration and
    // severity both came back unspecified, ask once before recommending
    // anything, instead of guessing.
    const analysis = await runAnalysis(message);
    if (analysis.duration === "Not specified" && analysis.severity === "Not specified") {
      awaitingDetailsRef.current = message;
      setTurns((t) => [...t, { role: "bot", text: strings.followUpQuestion }]);
      setBusy(false);
      return;
    }

    setTurns((t) => [...t, { role: "bot", text: strings.searching }]);
    const ranked = rankFacilities(analysis, overrides, district || undefined, 3, userCoords);
    setTurns((t) => {
      const withoutTyping = t.slice(0, -1);
      return [
        ...withoutTyping,
        { role: "result", analysis, ranked, locatedByCoords: Boolean(userCoords) },
      ];
    });
    setBusy(false);
  }

  function toggleMic() {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.info("Voice input isn't supported in this browser — please type instead.");
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    const rec = new SpeechRecognition();
    rec.lang = LANGUAGES.find((l) => l.code === lang)?.speechLang ?? "en-IN";
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    let baseText = "";
    rec.onstart = () => {
      baseText = input;
    };
    rec.onresult = (e: any) => {
      let transcript = "";
      for (let i = 0; i < e.results.length; i++) {
        transcript += e.results[i][0].transcript;
      }
      setLiveTranscript(transcript);
      setInput(baseText ? `${baseText} ${transcript}` : transcript);
    };
    rec.onend = () => {
      setListening(false);
      setLiveTranscript("");
    };
    rec.onerror = () => {
      setListening(false);
      setLiveTranscript("");
      toast.info("Couldn't hear that clearly — please try again or type instead.");
    };
    recognitionRef.current = rec;
    setListening(true);
    rec.start();
  }

  function handleGetToken(ranked: Ranked, analysis: SymptomAnalysis, healthIssue: string) {
    if (!isValidPhone(patientPhone)) {
      setPhoneTouched(true);
      toast.error("Enter a valid 10-digit phone number before generating a token.");
      return;
    }
    const record = createCaseRecord(ranked, analysis, patientRef, healthIssue, patientPhone);
    store.addCase(record);
    toast.success(`Token ${record.tokenNumber} generated for ${record.facilityName}`);
    navigate({ to: "/token", search: { case: record.caseId } });
  }

  const lastUserText =
    [...turns].reverse().find((t) => t.role === "user")?.text ?? "General health concern";

  return (
    <AppShell
      title="Symptom check"
      subtitle="Describe how you're feeling — we'll find the right facility."
    >
      {listening && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-6 rounded-2xl bg-background p-8 shadow-xl">
            <div className="relative flex h-24 w-24 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-500">
                <Mic className="h-8 w-8 text-white" />
              </span>
            </div>
            <p className="text-sm font-medium text-muted-foreground">{strings.listening}</p>
            <p className="min-h-[1.5em] max-w-xs text-center text-base">
              {liveTranscript || strings.listeningHint}
            </p>
            <Button variant="outline" onClick={() => recognitionRef.current?.stop()}>
              {strings.stopButton}
            </Button>
          </div>
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">{strings.yourDistrict}</span>
          <Select value={district} onValueChange={setDistrict}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder={strings.anyDistrict} />
            </SelectTrigger>
            <SelectContent>
              {DISTRICT_LIST.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {locationChecked && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3.5" />
            {userCoords ? "Using your location" : "Location off — using district only"}
          </span>
        )}
      </div>

      <div className="mb-4">
        <label className="mb-1 flex items-center gap-1 text-xs font-medium text-muted-foreground">
          Phone number <span className="text-destructive">*</span>
          <span className="font-normal">— required to generate a token, so a health worker can reach you</span>
        </label>
        <Input
          type="tel"
          inputMode="numeric"
          maxLength={10}
          placeholder="10-digit mobile number"
          value={patientPhone}
          onChange={(e) => store.setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
          onBlur={() => setPhoneTouched(true)}
          className={`max-w-xs ${phoneTouched && !phoneValid ? "border-destructive focus-visible:ring-destructive" : ""}`}
        />
        {phoneTouched && !phoneValid && (
          <p className="mt-1 text-xs text-destructive">Enter a valid 10-digit mobile number.</p>
        )}
      </div>

      <div className="space-y-4">
        {turns.map((turn, i) => {
          if (turn.role === "result") {
            return (
              <div key={i} className="space-y-4">
                <SymptomCard analysis={turn.analysis} />
                {!turn.locatedByCoords && !district && (
                  <p className="rounded-lg border border-dashed border-border px-3 py-2 text-xs text-muted-foreground">
                    {strings.noLocationNote}
                  </p>
                )}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {turn.ranked.map((r, idx) => (
                    <FacilityCard
                      key={r.facility.phcId}
                      ranked={r}
                      recommended={idx === 0}
                      compact
                      onGetToken={(ranked) => handleGetToken(ranked, turn.analysis, lastUserText)}
                    />
                  ))}
                </div>
              </div>
            );
          }
          return (
            <div
              key={i}
              className={turn.role === "user" ? "flex justify-end" : "flex justify-start"}
            >
              <div
                className={`max-w-md rounded-2xl px-4 py-2.5 text-sm ${
                  turn.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-card text-foreground"
                }`}
              >
                {turn.text}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {CHIP_KEYS.map((key) => (
          <Button
            key={key}
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() => handleSend(strings.chips[key].text)}
          >
            {strings.chips[key].label}
          </Button>
        ))}
      </div>

      <div className="sticky bottom-4 mt-4 flex items-end gap-2 rounded-2xl border border-border bg-card p-2 shadow-card">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend(input);
            }
          }}
          placeholder={strings.inputPlaceholder}
          className="min-h-11 flex-1 resize-none border-0 shadow-none focus-visible:ring-0"
          rows={1}
        />
        <Button
          type="button"
          variant={listening ? "secondary" : "ghost"}
          size="icon"
          onClick={toggleMic}
          aria-label={strings.micAriaLabel}
        >
          <Mic className={listening ? "size-4 text-primary" : "size-4"} />
        </Button>
        <Button
          type="button"
          size="icon"
          disabled={busy || !input.trim()}
          onClick={() => handleSend(input)}
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        </Button>
      </div>
    </AppShell>
  );
}
