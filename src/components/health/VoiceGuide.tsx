import { useState, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { useAppState } from "@/lib/store";
import { useRouterState } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

const GUIDES: Record<string, Record<string, string>> = {
  "/": {
    en: "Welcome to Aarogya Health. Please click the 'Start symptom check' button to find the nearest hospital for your emergency.",
    hi: "आरोग्य हेल्थ में आपका स्वागत है। अपनी आपात स्थिति के लिए निकटतम अस्पताल खोजने के लिए कृपया 'Start symptom check' बटन पर क्लिक करें।",
    mr: "आरोग्य हेल्थ मध्ये आपले स्वागत आहे. तुमच्या आणीबाणीसाठी जवळचे रुग्णालय शोधण्यासाठी कृपया 'Start symptom check' बटणावर क्लिक करा.",
    ta: "ஆரோக்யா ஹெல்த்துக்கு வரவேற்கிறோம். உங்கள் அவசரநிலைக்கு அருகிலுள்ள மருத்துவமனையைக் கண்டறிய 'Start symptom check' பட்டனைக் கிளிக் செய்யவும்.",
  },
  "/chat": {
    en: "Please type your symptoms or click the microphone icon to record your voice. We will tell you which hospital to go to.",
    hi: "कृपया अपने लक्षण टाइप करें या अपनी आवाज रिकॉर्ड करने के लिए माइक्रोफ़ोन आइकन पर क्लिक करें। हम आपको बताएंगे कि आपको किस अस्पताल जाना चाहिए।",
    mr: "कृपया तुमची लक्षणे टाइप करा किंवा तुमचा आवाज रेकॉर्ड करण्यासाठी मायक्रोफोन चिन्हावर क्लिक करा. आम्ही तुम्हाला सांगू की तुम्हाला कोणत्या रुग्णालयात जावे लागेल.",
    ta: "தயவுசெய்து உங்கள் அறிகுறிகளை தட்டச்சு செய்யவும் அல்லது உங்கள் குரலை பதிவு செய்ய மைக்ரோஃபோன் ஐகானைக் கிளிக் செய்யவும். நீங்கள் எந்த மருத்துவமனைக்கு செல்ல வேண்டும் என்பதை நாங்கள் உங்களுக்கு கூறுவோம்.",
  },
  "/facilities": {
    en: "Here is a list of all nearby hospitals. You can see how many doctors are available right now.",
    hi: "यहां सभी आस-पास के अस्पतालों की सूची दी गई है। आप देख सकते हैं कि अभी कितने डॉक्टर उपलब्ध हैं।",
    mr: "येथे सर्व जवळच्या रुग्णालयांची यादी आहे. सध्या किती डॉक्टर उपलब्ध आहेत हे तुम्ही पाहू शकता.",
    ta: "அருகிலுள்ள அனைத்து மருத்துவமனைகளின் பட்டியல் இங்கே உள்ளது. இப்போது எத்தனை மருத்துவர்கள் உள்ளனர் என்பதை நீங்கள் பார்க்கலாம்.",
  },
};

const LANG_MAP: Record<string, string> = {
  en: "en-IN",
  hi: "hi-IN",
  mr: "mr-IN",
  ta: "ta-IN",
};

export function VoiceGuide() {
  const { lang } = useAppState();
  const routerState = useRouterState();
  const [isPlaying, setIsPlaying] = useState(false);

  const pathname = routerState.location.pathname;
  
  // Find the closest matching guide text
  let guideText = "";
  if (pathname.startsWith("/chat")) {
    guideText = GUIDES["/chat"]?.[lang] || GUIDES["/chat"]?.["en"];
  } else if (pathname.startsWith("/facilities")) {
    guideText = GUIDES["/facilities"]?.[lang] || GUIDES["/facilities"]?.["en"];
  } else {
    guideText = GUIDES["/"]?.[lang] || GUIDES["/"]?.["en"];
  }

  useEffect(() => {
    // Stop speaking if unmounted or route changes
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  }, [pathname, lang]);

  const toggleSpeech = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    if (!window.speechSynthesis) {
      alert("Voice guide is not supported on this browser.");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(guideText);
    utterance.lang = LANG_MAP[lang] || "en-IN";
    utterance.rate = 0.9; // Speak slightly slower for elderly users
    
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  return (
    <Button
      onClick={toggleSpeech}
      size="lg"
      className={\`fixed bottom-6 right-6 z-50 rounded-full shadow-2xl transition-all duration-300 \${isPlaying ? 'bg-destructive hover:bg-destructive/90 animate-pulse' : 'bg-primary hover:bg-primary/90'}\`}
    >
      {isPlaying ? <VolumeX className="size-6 mr-2" /> : <Volume2 className="size-6 mr-2" />}
      {isPlaying ? (lang === 'hi' ? 'रोकें' : lang === 'mr' ? 'थांबवा' : lang === 'ta' ? 'நிறுத்து' : 'Stop') : (lang === 'hi' ? 'आवाज़ गाइड' : lang === 'mr' ? 'आवाज मार्गदर्शक' : lang === 'ta' ? 'குரல் வழிகாட்டி' : 'Voice Guide')}
    </Button>
  );
}
