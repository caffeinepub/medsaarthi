import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppContext } from "@/context/AppContext";
import { useCreateAlert } from "@/hooks/useQueries";
import { useVoice } from "@/hooks/useVoice";
import { AlertTriangle, PhoneCall } from "lucide-react";
import { useEffect } from "react";

export function EmergencyModal() {
  const { emergencyOpen, closeEmergency, profile } = useAppContext();
  const { speak } = useVoice();
  const createAlert = useCreateAlert();

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional trigger on open change
  useEffect(() => {
    if (emergencyOpen) {
      const name = profile?.caregiver?.name || "your caregiver";
      const phone = profile?.caregiver?.phone || "";
      speak(`Emergency alert sent to ${name}. Calling ${phone}.`);
      createAlert.mutate({
        alertType: "emergency",
        message: "User triggered emergency SOS. Immediate assistance needed.",
      });
    }
  }, [emergencyOpen]);

  const caregiverName = profile?.caregiver?.name || "Caregiver";
  const caregiverPhone = profile?.caregiver?.phone || "";

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
            Emergency Alert Sent!
          </DialogTitle>
        </DialogHeader>
        <div className="text-center py-4 space-y-3">
          <p className="text-foreground text-lg">
            Alert sent to <strong>{caregiverName}</strong>
          </p>
          {caregiverPhone && (
            <a
              href={`tel:${caregiverPhone}`}
              className="flex items-center justify-center gap-3 w-full bg-destructive text-destructive-foreground rounded-xl py-5 text-xl font-bold no-underline"
              aria-label={`Call ${caregiverName}`}
              data-ocid="emergency.confirm_button"
            >
              <PhoneCall className="w-7 h-7" />
              Call {caregiverName}
            </a>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={closeEmergency}
            className="w-full btn-large"
            aria-label="Close emergency dialog"
            data-ocid="emergency.cancel_button"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
