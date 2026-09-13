// Chat UI translations. Generated for a working prototype — recommend a
// native speaker of each language reviews these before real users or judges
// see them, especially the Tamil and Marathi medical phrasing.

export type Lang = "en" | "hi" | "mr" | "ta";

export const LANGUAGES: { code: Lang; label: string; speechLang: string }[] = [
  { code: "en", label: "English", speechLang: "en-IN" },
  { code: "hi", label: "हिंदी", speechLang: "hi-IN" },
  { code: "mr", label: "मराठी", speechLang: "mr-IN" },
  { code: "ta", label: "தமிழ்", speechLang: "ta-IN" },
];

export type ChipKey = "fever" | "cough" | "injury" | "pregnancy" | "chronic" | "emergency";

type Strings = {
  greeting: string;
  inputPlaceholder: string;
  searching: string;
  yourDistrict: string;
  anyDistrict: string;
  listening: string;
  listeningHint: string;
  stopButton: string;
  micAriaLabel: string;
  followUpQuestion: string;
  noLocationNote: string;
  locationDeniedToast: string;
  chips: Record<ChipKey, { label: string; text: string }>;
  homeTitle: string;
  homeSubtitle: string;
  homeStart: string;
  homeBrowse: string;
  homeStatsTracked: string;
  homeStatsDoctors: string;
  homeStatsCritical: string;
  homeStep1Title: string;
  homeStep1Body: string;
  homeStep2Title: string;
  homeStep2Body: string;
  homeStep3Title: string;
  homeStep3Body: string;
};

export const STRINGS: Record<Lang, Strings> = {
  en: {
    greeting:
      "Namaste! Tell me what's troubling you, and I'll find the nearest facility that can help.",
    inputPlaceholder: "Type your symptoms here…",
    searching: "Searching nearby facilities…",
    yourDistrict: "Your district (optional):",
    anyDistrict: "Any district",
    listening: "Listening…",
    listeningHint: "Say something…",
    stopButton: "Stop",
    micAriaLabel: "Voice input",
    followUpQuestion:
      "Could you tell me a bit more — how long has this been going on, and how severe would you say it is (mild, moderate, or severe)?",
    noLocationNote:
      "Showing the best overall match — turn on location or pick a district for facilities near you.",
    locationDeniedToast:
      "Location unavailable — pick your district above so we can find nearby facilities.",
    chips: {
      fever: { label: "Fever", text: "I have had fever since yesterday" },
      cough: { label: "Cough / cold", text: "I have cough and cold for a few days" },
      injury: { label: "Injury", text: "I have an injury and there is a wound" },
      pregnancy: { label: "Pregnancy / maternity", text: "I am pregnant and need a check-up" },
      chronic: {
        label: "Chronic illness",
        text: "I have a chronic illness and need regular medicine",
      },
      emergency: {
        label: "Emergency",
        text: "This is an emergency, chest pain and difficulty breathing",
      },
    },
    homeTitle: "Connecting every rural patient to the right care",
    homeSubtitle: "Tell us what's wrong. We'll find the nearest health centre that actually has a doctor on duty and the right medicine in stock — right now, not just on paper.",
    homeStart: "Start symptom check",
    homeBrowse: "Browse nearby facilities",
    homeStatsTracked: "Facilities tracked",
    homeStatsDoctors: "Doctors available today",
    homeStatsCritical: "Facilities with critical stockouts",
    homeStep1Title: "Describe your symptoms",
    homeStep1Body: "Type or speak in your own words. Our triage engine understands severity and duration.",
    homeStep2Title: "Get matched to real availability",
    homeStep2Body: "We rank nearby PHCs by live doctor presence, medicine stock, and specialist fit — not just distance.",
    homeStep3Title: "Walk in with a token",
    homeStep3Body: "Get a token number and turn-by-turn directions, so the facility already knows you're coming.",
  },
  hi: {
    greeting:
      "नमस्ते! मुझे बताएं कि आपको क्या परेशानी है, मैं आपके लिए नज़दीकी उपयुक्त केंद्र खोजूंगा।",
    inputPlaceholder: "यहाँ अपने लक्षण लिखें…",
    searching: "आस-पास के केंद्र खोजे जा रहे हैं…",
    yourDistrict: "आपका जिला (वैकल्पिक):",
    anyDistrict: "कोई भी जिला",
    listening: "सुन रहा हूँ…",
    listeningHint: "कुछ कहें…",
    stopButton: "रोकें",
    micAriaLabel: "आवाज़ से इनपुट",
    followUpQuestion:
      "कृपया थोड़ा और बताएं — यह समस्या कब से है, और यह कितनी गंभीर है (हल्की, मध्यम या गंभीर)?",
    noLocationNote:
      "सबसे उपयुक्त केंद्र दिखाया जा रहा है — पास के केंद्रों के लिए लोकेशन चालू करें या जिला चुनें।",
    locationDeniedToast: "लोकेशन उपलब्ध नहीं है — कृपया ऊपर अपना जिला चुनें।",
    chips: {
      fever: { label: "बुखार", text: "मुझे कल से बुखार है" },
      cough: { label: "खांसी / जुकाम", text: "मुझे कुछ दिनों से खांसी और जुकाम है" },
      injury: { label: "चोट", text: "मुझे चोट लगी है और घाव है" },
      pregnancy: { label: "गर्भावस्था", text: "मैं गर्भवती हूं और मुझे जांच करानी है" },
      chronic: { label: "पुरानी बीमारी", text: "मुझे एक पुरानी बीमारी है और नियमित दवा चाहिए" },
      emergency: {
        label: "आपातकाल",
        text: "यह एक आपातकाल है, सीने में दर्द और सांस लेने में तकलीफ है",
      },
    },
    homeTitle: "हर ग्रामीण मरीज को सही देखभाल से जोड़ना",
    homeSubtitle: "हमें बताएं कि क्या समस्या है। हम सबसे नज़दीकी स्वास्थ्य केंद्र खोजेंगे जहाँ वास्तव में डॉक्टर ड्यूटी पर हैं और सही दवा उपलब्ध है।",
    homeStart: "लक्षण जांच शुरू करें",
    homeBrowse: "आस-पास के केंद्र खोजें",
    homeStatsTracked: "ट्रैक किए गए केंद्र",
    homeStatsDoctors: "आज उपलब्ध डॉक्टर",
    homeStatsCritical: "दवाओं की कमी वाले केंद्र",
    homeStep1Title: "अपने लक्षणों का वर्णन करें",
    homeStep1Body: "अपने शब्दों में टाइप करें या बोलें। हमारा सिस्टम गंभीरता को समझता है।",
    homeStep2Title: "वास्तविक उपलब्धता से मिलान करें",
    homeStep2Body: "हम केवल दूरी नहीं, बल्कि लाइव डॉक्टर की उपस्थिति और दवा के स्टॉक के आधार पर PHC रैंक करते हैं।",
    homeStep3Title: "टोकन के साथ जाएं",
    homeStep3Body: "टोकन नंबर प्राप्त करें ताकि केंद्र को आपके आने की पहले से जानकारी हो।",
  },
  mr: {
    greeting:
      "नमस्कार! तुम्हाला काय त्रास होत आहे ते सांगा, मी तुमच्यासाठी जवळचे योग्य केंद्र शोधतो.",
    inputPlaceholder: "तुमची लक्षणे इथे लिहा…",
    searching: "जवळपासची केंद्रे शोधत आहे…",
    yourDistrict: "तुमचा जिल्हा (ऐच्छिक):",
    anyDistrict: "कोणताही जिल्हा",
    listening: "ऐकत आहे…",
    listeningHint: "काहीतरी बोला…",
    stopButton: "थांबवा",
    micAriaLabel: "आवाजाने इनपुट",
    followUpQuestion:
      "कृपया थोडं अधिक सांगा — ही समस्या किती दिवसांपासून आहे, आणि ती किती तीव्र आहे (सौम्य, मध्यम की तीव्र)?",
    noLocationNote:
      "सर्वोत्तम जुळणारे केंद्र दाखवत आहोत — जवळच्या केंद्रांसाठी लोकेशन सुरू करा किंवा जिल्हा निवडा.",
    locationDeniedToast: "लोकेशन उपलब्ध नाही — कृपया वरून तुमचा जिल्हा निवडा.",
    chips: {
      fever: { label: "ताप", text: "मला कालपासून ताप आहे" },
      cough: { label: "खोकला / सर्दी", text: "मला काही दिवसांपासून खोकला आणि सर्दी आहे" },
      injury: { label: "दुखापत", text: "मला दुखापत झाली आहे आणि जखम आहे" },
      pregnancy: { label: "गर्भधारणा", text: "मी गर्भवती आहे आणि मला तपासणी करायची आहे" },
      chronic: { label: "दीर्घकालीन आजार", text: "मला दीर्घकालीन आजार आहे आणि नियमित औषध हवे आहे" },
      emergency: {
        label: "आणीबाणी",
        text: "ही आणीबाणी आहे, छातीत दुखणे आणि श्वास घेण्यास त्रास होत आहे",
      },
    },
    homeTitle: "प्रत्येक ग्रामीण रुग्णाला योग्य उपचारांशी जोडणे",
    homeSubtitle: "तुम्हाला काय त्रास होत आहे ते आम्हाला सांगा. आम्ही जवळचे आरोग्य केंद्र शोधू जिथे खरोखरच डॉक्टर ड्युटीवर आहेत आणि योग्य औषध उपलब्ध आहे.",
    homeStart: "लक्षणे तपासणी सुरू करा",
    homeBrowse: "जवळपासची केंद्रे शोधा",
    homeStatsTracked: "ट्रॅक केलेली केंद्रे",
    homeStatsDoctors: "आज उपलब्ध डॉक्टर",
    homeStatsCritical: "औषधांचा तुटवडा असलेली केंद्रे",
    homeStep1Title: "तुमच्या लक्षणांचे वर्णन करा",
    homeStep1Body: "तुमच्या स्वतःच्या शब्दात टाइप करा किंवा बोला. आमची प्रणाली गांभीर्य समजते.",
    homeStep2Title: "वास्तविक उपलब्धतेशी जुळवा",
    homeStep2Body: "आम्ही केवळ अंतर नाही तर थेट डॉक्टरांची उपस्थिती आणि औषधांच्या साठ्यावर आधारित PHC रँक करतो.",
    homeStep3Title: "टोकन घेऊन जा",
    homeStep3Body: "टोकन नंबर मिळवा जेणेकरून तुम्ही येत आहात हे केंद्राला आधीच माहीत असेल.",
  },
  ta: {
    greeting:
      "வணக்கம்! உங்களுக்கு என்ன பிரச்சனை என்று சொல்லுங்கள், நான் உங்களுக்கு அருகிலுள்ள சரியான மையத்தை கண்டுபிடிக்கிறேன்.",
    inputPlaceholder: "உங்கள் அறிகுறிகளை இங்கே தட்டச்சு செய்யவும்…",
    searching: "அருகிலுள்ள மையங்களை தேடுகிறது…",
    yourDistrict: "உங்கள் மாவட்டம் (விருப்பம்):",
    anyDistrict: "எந்த மாவட்டமும்",
    listening: "கேட்கிறது…",
    listeningHint: "ஏதாவது சொல்லுங்கள்…",
    stopButton: "நிறுத்து",
    micAriaLabel: "குரல் உள்ளீடு",
    followUpQuestion:
      "தயவுசெய்து இன்னும் கொஞ்சம் சொல்லுங்கள் — இந்த பிரச்சனை எத்தனை நாட்களாக உள்ளது, மற்றும் இது எவ்வளவு தீவிரமானது (லேசான, மிதமான அல்லது கடுமையான)?",
    noLocationNote:
      "மிகச் சிறந்த பொருத்தத்தைக் காட்டுகிறோம் — அருகிலுள்ள மையங்களுக்கு லொகேஷனை இயக்கவும் அல்லது மாவட்டத்தைத் தேர்ந்தெடுக்கவும்.",
    locationDeniedToast: "லொகேஷன் கிடைக்கவில்லை — மேலே உங்கள் மாவட்டத்தைத் தேர்ந்தெடுக்கவும்.",
    chips: {
      fever: { label: "காய்ச்சல்", text: "நேற்று முதல் எனக்கு காய்ச்சல் உள்ளது" },
      cough: { label: "இருமல் / சளி", text: "சில நாட்களாக இருமலும் சளியும் உள்ளது" },
      injury: { label: "காயம்", text: "எனக்கு காயம் ஏற்பட்டு புண் உள்ளது" },
      pregnancy: { label: "கர்ப்பம்", text: "நான் கர்ப்பமாக இருக்கிறேன், பரிசோதனை தேவை" },
      chronic: {
        label: "நீண்டகால நோய்",
        text: "எனக்கு நீண்டகால நோய் உள்ளது, தொடர்ந்து மருந்து தேவை",
      },
      emergency: {
        label: "அவசரநிலை",
        text: "இது ஒரு அவசரநிலை, மார்பு வலி மற்றும் மூச்சு திணறல் உள்ளது",
      },
    },
    homeTitle: "ஒவ்வொரு கிராமப்புற நோயாளியையும் சரியான சிகிச்சையுடன் இணைத்தல்",
    homeSubtitle: "உங்கள் பிரச்சனையை எங்களிடம் கூறுங்கள். உண்மையில் மருத்துவர் இருக்கும் மற்றும் சரியான மருந்து இருப்பில் உள்ள அருகிலுள்ள சுகாதார மையத்தை நாங்கள் கண்டுபிடிப்போம்.",
    homeStart: "அறிகுறி பரிசோதனையைத் தொடங்கு",
    homeBrowse: "அருகிலுள்ள மையங்களை தேடுக",
    homeStatsTracked: "கண்காணிக்கப்படும் மையங்கள்",
    homeStatsDoctors: "இன்று உள்ள மருத்துவர்கள்",
    homeStatsCritical: "மருந்து தட்டுப்பாடு உள்ள மையங்கள்",
    homeStep1Title: "உங்கள் அறிகுறிகளை விவரிக்கவும்",
    homeStep1Body: "உங்கள் சொந்த வார்த்தைகளில் தட்டச்சு செய்யவும் அல்லது பேசவும். எங்கள் அமைப்பு தீவிரத்தை புரிந்து கொள்ளும்.",
    homeStep2Title: "உண்மையான இருப்பை கண்டறியுங்கள்",
    homeStep2Body: "தூரத்தை மட்டுமல்ல, நேரடி மருத்துவர் இருப்பு மற்றும் மருந்து இருப்பின் அடிப்படையில் PHC-களை நாங்கள் வரிசைப்படுத்துகிறோம்.",
    homeStep3Title: "டோக்கனுடன் செல்லுங்கள்",
    homeStep3Body: "ஒரு டோக்கன் எண்ணைப் பெறுங்கள், எனவே நீங்கள் வருகிறீர்கள் என்பதை மையம் முன்கூட்டியே அறியும்.",
  },
};

const STORAGE_KEY = "aarogya-setu-kadi-lang";

export function loadLang(): Lang {
  if (typeof window === "undefined") return "en";
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved === "en" || saved === "hi" || saved === "mr" || saved === "ta") return saved;
  return "en";
}

export function saveLang(lang: Lang) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    /* ignore quota errors */
  }
}
