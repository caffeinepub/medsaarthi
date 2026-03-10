import { useCallback, useRef, useState } from "react";

export function useVoice() {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const speak = useCallback((text: string, lang = "en-IN") => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = lang;
    utt.rate = 0.9;
    utt.pitch = 1;
    utt.volume = 1;
    window.speechSynthesis.speak(utt);
  }, []);

  const stopSpeaking = useCallback(() => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  }, []);

  const listen = useCallback(
    (onResult: (text: string) => void, onEnd?: () => void) => {
      const SpeechRecognitionAPI =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      if (!SpeechRecognitionAPI) {
        onEnd?.();
        return;
      }

      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }

      const recognition = new SpeechRecognitionAPI();
      recognition.lang = "en-IN";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsListening(true);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0]?.[0]?.transcript || "";
        onResult(transcript);
      };

      recognition.onend = () => {
        setIsListening(false);
        onEnd?.();
      };

      recognition.onerror = () => {
        setIsListening(false);
        onEnd?.();
      };

      recognitionRef.current = recognition;
      recognition.start();
    },
    [],
  );

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  return { speak, stopSpeaking, listen, stopListening, isListening };
}
