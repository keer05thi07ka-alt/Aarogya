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

    const isEmergency = ["blood", "accident", "chest", "heart", "snake", "breath", "retham", "raththam", "nenju", "vali", "mayakkam", "paambu", "moochu", "adi"].some(k => lower.includes(k));
    const isUrgent = ["fever", "pain", "vomit", "dengue", "juram", "kaichal", "vaanthi", "vanthi", "vairo"].some(k => lower.includes(k));

    if (isEmergency) {
      triage = "Emergency";
      replyText = "🚨 EMERGENCY DETECTED 🚨\nPriority: RED\nWait Time: 0 mins\n🏥 Match: District Hospital\n✅ Token: E-991\nAmbulance alerted.";
    } else if (isUrgent) {
      triage = "Urgent";
      replyText = "🏥 Match: North District PHC\nPriority: YELLOW\nWait Time: ~15 mins\n✅ Token: T-8492\nShow this SMS at reception.";
    } else {
      triage = "Routine";
      replyText = "🏥 Match: Village Sub-Centre\nPriority: GREEN\nWait Time: ~45 mins\n✅ Token: R-102\nShow this SMS at reception.";
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
