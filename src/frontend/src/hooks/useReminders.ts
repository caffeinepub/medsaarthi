import type { Medicine } from "@/backend";
import { useCallback, useEffect, useRef } from "react";
import { useVoice } from "./useVoice";

type ReminderCallback = (med: Medicine) => void;

function getCurrentTimeOfDay(): "Morning" | "Afternoon" | "Night" | null {
  const h = new Date().getHours();
  if (h >= 6 && h < 12) return "Morning";
  if (h >= 12 && h < 18) return "Afternoon";
  if (h >= 18 && h < 23) return "Night";
  return null;
}

export function useReminders(
  medicines: Medicine[],
  onReminder?: ReminderCallback,
) {
  const { speak } = useVoice();
  const sentRef = useRef<Set<string>>(new Set());

  const checkReminders = useCallback(() => {
    const tod = getCurrentTimeOfDay();
    if (!tod) return;
    const now = new Date();
    const minuteKey = `${now.getHours()}:${Math.floor(now.getMinutes() / 5)}`;

    for (const med of medicines) {
      if (med.time === tod) {
        const key = `${String(med.id)}-${tod}-${minuteKey}`;
        if (sentRef.current.has(key)) continue;
        sentRef.current.add(key);
        const msg = `It is time to take your medicine: ${med.name}, ${med.dosage}.`;
        speak(msg);
        onReminder?.(med);
      }
    }
  }, [medicines, speak, onReminder]);

  useEffect(() => {
    checkReminders();
    const interval = setInterval(checkReminders, 30_000);
    return () => clearInterval(interval);
  }, [checkReminders]);
}
