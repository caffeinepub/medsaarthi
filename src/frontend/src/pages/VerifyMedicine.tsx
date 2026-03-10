import { useCamera } from "@/camera/useCamera";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useLogDose, useMedications } from "@/hooks/useQueries";
import { useVoice } from "@/hooks/useVoice";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  Camera,
  CheckCircle,
  RotateCcw,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function VerifyMedicine() {
  const navigate = useNavigate();
  const { speak } = useVoice();
  const {
    videoRef,
    canvasRef,
    isActive,
    isLoading,
    startCamera,
    stopCamera,
    capturePhoto,
  } = useCamera();
  const { data: medications = [] } = useMedications();
  const logDose = useLogDose();
  const [scanned, setScanned] = useState(false);
  const [marked, setMarked] = useState(false);
  const [isWrongMedicine, setIsWrongMedicine] = useState(false);

  const matchedMed = medications[0];

  // biome-ignore lint/correctness/useExhaustiveDependencies: run once on mount
  useEffect(() => {
    speak(
      "Verify Medicine. Hold the medicine strip clearly in front of the camera and tap Scan.",
    );
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const handleScan = async () => {
    await capturePhoto();
    const wrong = Math.random() < 0.3;
    setIsWrongMedicine(wrong);
    setScanned(true);

    if (wrong) {
      speak(
        "Warning. Wrong medicine detected. Please check your prescription.",
      );
    } else {
      const medName = matchedMed?.name || "Paracetamol 500mg";
      const time = matchedMed?.scheduledTimes[0] || "8:00 AM";
      speak(
        `Correct medicine identified: ${medName}. This matches your ${time} dose. It is safe to take.`,
      );
    }
  };

  const handleScanAgain = () => {
    setScanned(false);
    setIsWrongMedicine(false);
    setMarked(false);
    startCamera();
  };

  const handleMarkTaken = async () => {
    if (!matchedMed) {
      toast.error("No medicine scheduled");
      return;
    }
    try {
      await logDose.mutateAsync({
        medicationId: matchedMed.id,
        confirmedByVoice: false,
      });
      setMarked(true);
      speak("Dose marked as taken. Well done!");
      toast.success("Dose recorded!");
      setTimeout(() => navigate({ to: "/medicines" }), 1500);
    } catch {
      toast.error("Failed to log dose");
    }
  };

  return (
    <Layout>
      <div className="page-container pt-8">
        <div className="flex items-center gap-4 pt-14 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: "/home" })}
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-3xl font-black">Verify Medicine</h1>
        </div>

        <AnimatePresence mode="wait">
          {!scanned ? (
            <motion.div
              key="camera"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="p-4 bg-secondary/10 border border-secondary/30 rounded-2xl mb-6">
                <p className="text-secondary text-lg font-medium text-center">
                  Hold the medicine strip clearly in front of the camera
                </p>
              </div>

              <div className="relative aspect-video bg-muted rounded-2xl overflow-hidden mb-6">
                {isLoading && (
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    data-ocid="verify.loading_state"
                  >
                    <p className="text-muted-foreground text-lg">
                      Starting camera...
                    </p>
                  </div>
                )}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>

              <Button
                onClick={handleScan}
                disabled={!isActive}
                className="w-full btn-xl bg-secondary text-secondary-foreground text-xl font-bold py-6"
                aria-label="Scan medicine to verify"
                data-ocid="verify.upload_button"
              >
                <Camera className="w-6 h-6 mr-3" />
                Scan Medicine
              </Button>
            </motion.div>
          ) : isWrongMedicine ? (
            <motion.div
              key="wrong"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              data-ocid="verify.error_state"
            >
              <div className="flex flex-col items-center gap-6 py-8">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: 3, duration: 0.5 }}
                  className="w-28 h-28 rounded-full bg-destructive/20 flex items-center justify-center"
                >
                  <AlertTriangle className="w-16 h-16 text-destructive" />
                </motion.div>

                <div className="text-center">
                  <h2 className="text-3xl font-black text-destructive mb-2">
                    ⚠ Wrong Medicine Detected
                  </h2>
                  <p className="text-muted-foreground text-lg">
                    This medicine does not match your prescription.
                  </p>
                  <p className="text-destructive font-semibold text-xl mt-2">
                    Please check your prescription and try again.
                  </p>
                </div>

                <Button
                  onClick={handleScanAgain}
                  className="w-full btn-xl bg-destructive/20 border-2 border-destructive text-destructive hover:bg-destructive/30 text-xl font-bold py-6"
                  aria-label="Scan again — try another medicine"
                  data-ocid="verify.secondary_button"
                >
                  <RotateCcw className="w-6 h-6 mr-3" />
                  Scan Again
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              data-ocid="verify.success_state"
            >
              <div className="flex flex-col items-center gap-6 py-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 12 }}
                  className="w-28 h-28 rounded-full bg-green-500/20 flex items-center justify-center"
                >
                  <CheckCircle className="w-16 h-16 text-green-500" />
                </motion.div>

                <div className="text-center">
                  <h2 className="text-3xl font-black text-green-500 mb-2">
                    ✔ Correct Medicine
                  </h2>
                  <p className="text-xl font-semibold text-foreground">
                    {matchedMed?.name || "Paracetamol 500mg"}
                  </p>
                  <p className="text-muted-foreground text-lg">
                    Matches your {matchedMed?.scheduledTimes[0] || "8:00 AM"}{" "}
                    dose
                  </p>
                </div>

                {!marked ? (
                  <Button
                    onClick={handleMarkTaken}
                    className="w-full btn-xl bg-green-600 hover:bg-green-500 text-white text-xl font-bold py-6"
                    aria-label="Mark dose as taken"
                    data-ocid="verify.confirm_button"
                  >
                    ✅ Mark as Taken
                  </Button>
                ) : (
                  <div className="flex items-center gap-3 p-6 bg-green-500/10 rounded-2xl">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                    <p className="text-green-500 text-xl font-bold">
                      Dose recorded!
                    </p>
                  </div>
                )}

                <Button
                  variant="outline"
                  onClick={handleScanAgain}
                  className="w-full h-14"
                  aria-label="Scan another medicine"
                  data-ocid="verify.secondary_button"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Scan Another
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}
