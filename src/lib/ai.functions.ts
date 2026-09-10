import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({ message: z.string().min(1).max(2000) });

const Analysis = z.object({
  symptoms: z.array(z.string()).default([]),
  duration: z.string().default("Not specified"),
  severity: z.string().default("Not specified"),
  context: z.string().default(""),
  careRequirement: z.string().default("General Consultation"),
  triage: z.enum(["Emergency", "Urgent", "Routine"]).default("Urgent"),
  explanation: z.string().default(""),
});

const SYSTEM = `You are the triage assistant of Aarogya Setu Kadi, a rural healthcare coordination service in Maharashtra, India.
Read the patient's free-text (possibly in or transliterated from Hindi/Marathi/Tamil) description and return JSON only:
{"symptoms":[..],"duration":"..","severity":"Mild|Moderate|Severe|Not specified","context":"one line summary","careRequirement":"General Consultation|Women's Health|Child Healthcare|Emergency Care|Orthopaedics|Follow-up","triage":"Emergency|Urgent|Routine","explanation":"one supportive sentence for the patient"}
If the patient does not describe how bad/intense the symptom is, set severity to "Not specified" — do not guess a severity level that wasn't stated.
Never diagnose or prescribe. Triage conservatively.`;

// Uses Google's Gemini API directly (free tier, no billing required).
// Get a key at https://aistudio.google.com/apikey and set GEMINI_API_KEY in your .env file.
const GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export const analyseSymptoms = createServerFn({ method: "POST" })
  .validator((raw: unknown) => Input.parse(raw))
  .handler(async ({ data }) => {
    const key = process.env["GEMINI_API_KEY"];
    if (!key) return { ok: false as const, error: "AI unavailable" };

    try {
      const res = await fetch(GEMINI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM }] },
          contents: [{ role: "user", parts: [{ text: data.message }] }],
          generationConfig: { responseMimeType: "application/json" },
        }),
      });
      if (!res.ok) {
        const body = await res.text();
        return { ok: false as const, error: `AI error ${res.status}: ${body.slice(0, 200)}` };
      }
      const json = (await res.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      };
      const content = json.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
      const parsed = Analysis.parse(JSON.parse(content));
      return { ok: true as const, analysis: parsed };
    } catch (err) {
      return { ok: false as const, error: err instanceof Error ? err.message : "AI failed" };
    }
  });
