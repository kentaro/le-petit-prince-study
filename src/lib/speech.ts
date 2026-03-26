let cachedFrenchVoice: SpeechSynthesisVoice | null = null;
let voicesLoaded = false;

function findFrenchVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;

  // Prefer native French voices (Thomas, Amelie, etc.)
  return (
    voices.find((v) => v.lang === "fr-FR" && v.localService) ||
    voices.find((v) => v.lang === "fr-FR") ||
    voices.find((v) => v.lang.startsWith("fr") && v.localService) ||
    voices.find((v) => v.lang.startsWith("fr")) ||
    null
  );
}

function ensureVoicesLoaded(): Promise<void> {
  if (voicesLoaded && cachedFrenchVoice) return Promise.resolve();

  return new Promise<void>((resolve) => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      cachedFrenchVoice = findFrenchVoice();
      voicesLoaded = true;
      resolve();
      return;
    }

    // Voices not yet loaded — wait for the event
    const handler = () => {
      cachedFrenchVoice = findFrenchVoice();
      voicesLoaded = true;
      window.speechSynthesis.removeEventListener("voiceschanged", handler);
      resolve();
    };
    window.speechSynthesis.addEventListener("voiceschanged", handler);

    // Fallback timeout so we don't hang forever
    setTimeout(() => {
      cachedFrenchVoice = findFrenchVoice();
      voicesLoaded = true;
      window.speechSynthesis.removeEventListener("voiceschanged", handler);
      resolve();
    }, 1000);
  });
}

export async function speakFrench(text: string, rate = 0.85): Promise<void> {
  if (typeof window === "undefined" || !window.speechSynthesis) return;

  window.speechSynthesis.cancel();

  await ensureVoicesLoaded();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "fr-FR";
  utterance.rate = rate;
  utterance.pitch = 1;

  if (cachedFrenchVoice) {
    utterance.voice = cachedFrenchVoice;
  }

  window.speechSynthesis.speak(utterance);
}

export function stopSpeech(): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
}

export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}
