let currentUtterance: SpeechSynthesisUtterance | null = null;

export function speakFrench(text: string, rate = 0.85): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;

  // Stop any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "fr-FR";
  utterance.rate = rate;
  utterance.pitch = 1;

  // Try to find a French voice
  const voices = window.speechSynthesis.getVoices();
  const frenchVoice = voices.find(
    (v) => v.lang.startsWith("fr") && v.localService
  ) || voices.find((v) => v.lang.startsWith("fr"));
  if (frenchVoice) {
    utterance.voice = frenchVoice;
  }

  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}

export function stopSpeech(): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  currentUtterance = null;
}

export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}
