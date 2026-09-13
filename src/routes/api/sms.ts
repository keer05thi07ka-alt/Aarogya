import { json } from "@tanstack/react-start";
import { createAPIFileRoute } from "@tanstack/react-start/api";

export const APIRoute = createAPIFileRoute("/api/sms")({
  POST: async ({ request }) => {
    // Twilio sends data as form-urlencoded
    const text = await request.text();
    const params = new URLSearchParams(text);
    const body = params.get("Body") || "";
    const lower = body.toLowerCase();

    let triage = "Routine";
    let replyText = "";

    const isGreeting = ["hi", "hello", "start", "help", "namaste", "hey"].includes(lower.trim());
    if (isGreeting) {
      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Message>👋 Namaste! Welcome to Aarogya Health Services.

Please reply with:
1. Your symptoms
2. Your 6-digit PIN code or village name

(Example: "Severe fever and body pain 442605")</Message>
</Response>`;
      return new Response(twiml, { headers: { "Content-Type": "text/xml" } });
    }

    const isEmergency = ["blood", "accident", "chest", "heart", "snake", "breath", "retham", "raththam", "nenju", "vali", "mayakkam", "paambu", "moochu", "adi"].some(k => lower.includes(k));
    const isUrgent = ["fever", "pain", "vomit", "dengue", "juram", "kaichal", "vaanthi", "vanthi", "vairo"].some(k => lower.includes(k));

    // Simulate location detection
    const pincodeMatch = body.match(/\b\d{6}\b/);
    const locationPrefix = pincodeMatch ? `📍 Location detected: PIN ${pincodeMatch[0]}\n` : "";

    if (isEmergency) {
      triage = "Emergency";
      replyText = `${locationPrefix}🚨 EMERGENCY DETECTED 🚨\nPriority: RED\nWait Time: 0 mins\n🏥 Match: Gadchiroli District Hospital\n✅ Token: E-991\nAmbulance alerted.`;
    } else if (isUrgent) {
      triage = "Urgent";
      replyText = `${locationPrefix}🏥 Match: Kurkheda Primary Health Centre\nPriority: YELLOW\nWait Time: ~15 mins\n✅ Token: T-8492\nShow this SMS at reception.`;
    } else {
      triage = "Routine";
      replyText = `${locationPrefix}🏥 Match: Karanji Village Sub-Centre\nPriority: GREEN\nWait Time: ~45 mins\n✅ Token: R-102\nShow this SMS at reception.`;
    }

    // Return TwiML XML response for Twilio
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Message>${replyText}</Message>
</Response>`;

    return new Response(twiml, {
      headers: {
        "Content-Type": "text/xml",
      },
    });
  },
});
