import type { Medication } from "@/backend";
import { useCallback, useEffect, useRef } from "react";
import { useVoice } from "./useVoice";

type ReminderCallback = (med: Medication, time: string) => void;

export function useReminders(
  medications: Medication[],
  onReminder?: ReminderCallback,
) {
  const { speak } = useVoice();
  const remindersSentRef = useRef<Set<string>>(new Set());

  const checkReminders = useCallback(() => {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    const currentTime = `${hh}:${mm}`;

    for (const med of medications) {
      for (const scheduledTime of med.scheduledTimes) {
        const key = `${med.id}-${scheduledTime}-${currentTime.slice(0, 4)}`;
        if (remindersSentRef.current.has(key)) continue;

        const [sHH, sMM] = scheduledTime.split(":").map(Number);
        const nowMins = now.getHours() * 60 + now.getMinutes();
        const schedMins = sHH * 60 + sMM;
        const diff = Math.abs(nowMins - schedMins);

        if (diff <= 1) {
          remindersSentRef.current.add(key);
          const msg = `Time to take your medicine: ${med.name}, ${med.dosage}.`;
          speak(msg);
          onReminder?.(med, scheduledTime);
        }
      }
    }
  }, [medications, speak, onReminder]);

  useEffect(() => {
    checkReminders();
    const interval = setInterval(checkReminders, 30_000);
    return () => clearInterval(interval);
  }, [checkReminders]);
}
