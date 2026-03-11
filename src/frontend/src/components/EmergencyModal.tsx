import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppContext } from "@/context/AppContext";
import { useCreateEmergencyAlert } from "@/hooks/useQueries";
import { useVoice } from "@/hooks/useVoice";
import { AlertTriangle, PhoneCall } from "lucide-react";
import { useEffect } from "react";

export function EmergencyModal() {
  const { emergencyOpen, closeEmergency, profile } = useAppContext();
  const { speak } = useVoice();
  const createAlert = useCreateEmergencyAlert();

  // biome-ignore lint/correctness/useExhaustiveDependencies: trigger on open
  useEffect(() => {
    if (emergencyOpen) {
      speak("Emergency alert triggered. Calling caregiver now.");
      createAlert.mutate("User triggered emergency SOS.");
    }
  }, [emergencyOpen]);

  const primaryPhone = profile?.primaryCaregiverContact || "";
  const secondaryPhone = profile?.secondaryCaregiverContact || "";

  return (
    <Dialog open={emergencyOpen} onOpenChange={closeEmergency}>
      <DialogContent
        data-ocid="emergency.dialog"
        className="max-w-[400px] mx-auto border-destructive bg-card"
      >
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-destructive/20 flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-destructive" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl font-bold text-destructive">
            EMERGENCY
          </DialogTitle>
        </DialogHeader>
        <div className="text-center py-4 space-y-3">
          <p className="text-foreground text-lg">
            Tap to call your caregiver immediately
          </p>
          {primaryPhone && (
            <a
              href={`tel:${primaryPhone}`}
              className="flex items-center justify-center gap-3 w-full bg-destructive text-destructive-foreground rounded-xl py-5 text-xl font-bold no-underline"
              aria-label="Call Primary Caregiver"
              data-ocid="emergency.confirm_button"
            >
              <PhoneCall className="w-7 h-7" /> Call Primary Caregiver
            </a>
          )}
          {secondaryPhone && (
            <a
              href={`tel:${secondaryPhone}`}
              className="flex items-center justify-center gap-3 w-full bg-muted text-foreground rounded-xl py-4 text-lg font-semibold no-underline"
              aria-label="Call Secondary Caregiver"
              data-ocid="emergency.secondary_button"
            >
              <PhoneCall className="w-6 h-6" /> Call Secondary Caregiver
            </a>
          )}
          {!primaryPhone && (
            <p className="text-muted-foreground">
              No caregiver number saved. Please complete registration.
            </p>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={closeEmergency}
            className="w-full h-14 rounded-xl text-lg"
            aria-label="Close"
            data-ocid="emergency.cancel_button"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
