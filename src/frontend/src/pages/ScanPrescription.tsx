import { useCamera } from "@/camera/useCamera";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAddMedication } from "@/hooks/useQueries";
import { useVoice } from "@/hooks/useVoice";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Camera,
  CheckCircle,
  Clock,
  Pill,
  Plus,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const MOCK_MEDICINES = [
  {
    name: "Paracetamol",
    dosage: "500mg",
    times: ["08:00", "20:00"],
    notes: "Take after meals",
    frequency: 2,
  },
  {
    name: "Metformin",
    dosage: "500mg",
    times: ["08:00", "20:00"],
    notes: "Take with meals",
    frequency: 2,
  },
];

function formatTime12h(time: string): string {
  const [h] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour} ${ampm}`;
}

export function ScanPrescription() {
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
  const addMed = useAddMedication();
  const [captured, setCaptured] = useState(false);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: run once on mount
  useEffect(() => {
    speak(
      "Scan Prescription. Point your camera at the prescription and tap Capture.",
    );
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const handleCapture = async () => {
    await capturePhoto();
    setCaptured(true);
    speak(
      "Medicine: Paracetamol. Dosage 500 milligrams. Time: 8 AM and 8 PM. Medicine: Metformin. Dosage 500 milligrams. Time: 8 AM and 8 PM.",
    );
  };

  const handleAddAll = async () => {
    setAdding(true);
    try {
      await Promise.all(
        MOCK_MEDICINES.map((m) =>
          addMed.mutateAsync({
            name: m.name,
            dosage: m.dosage,
            frequency: BigInt(m.frequency),
            scheduledTimes: m.times,
            notes: m.notes,
          }),
        ),
      );
      setAdded(true);
      speak(
        "All medicines added to your list. Paracetamol and Metformin have been saved.",
      );
      toast.success("Medicines added!");
      setTimeout(() => navigate({ to: "/medicines" }), 1500);
    } catch {
      toast.error("Failed to add medicines");
    } finally {
      setAdding(false);
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
          <h1 className="text-3xl font-black">Scan Prescription</h1>
        </div>

        <AnimatePresence mode="wait">
          {!captured ? (
            <motion.div
              key="camera"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="p-4 bg-primary/10 border border-primary/30 rounded-2xl mb-6">
                <p className="text-primary text-lg font-medium text-center">
                  Point your camera at the prescription
                </p>
              </div>

              <div className="relative aspect-video bg-muted rounded-2xl overflow-hidden mb-6">
                {isLoading && (
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    data-ocid="scan.loading_state"
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
                onClick={handleCapture}
                disabled={!isActive}
                className="w-full btn-xl bg-primary text-primary-foreground text-xl font-bold py-6"
                aria-label="Capture prescription photo"
                data-ocid="scan.upload_button"
              >
                <Camera className="w-6 h-6 mr-3" />
                Scan Prescription
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-2xl mb-6 flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <p className="text-green-500 text-lg font-semibold">
                  Prescription scanned — {MOCK_MEDICINES.length} medicines found
                </p>
              </div>

              <div className="space-y-4 mb-8" data-ocid="scan.list">
                {MOCK_MEDICINES.map((med, idx) => (
                  <Card
                    key={med.name}
                    className="border-border"
                    data-ocid={`scan.item.${idx + 1}`}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3 mb-3">
                        <Pill className="w-6 h-6 text-primary mt-1" />
                        <div className="flex-1">
                          <p className="text-xl font-black text-foreground">
                            Medicine: {med.name}
                          </p>
                          <p className="text-lg text-muted-foreground font-semibold">
                            Dosage: {med.dosage}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pl-9">
                        <Clock className="w-5 h-5 text-muted-foreground" />
                        <p className="text-lg font-semibold text-foreground">
                          Time: {med.times.map(formatTime12h).join(" / ")}
                        </p>
                      </div>
                      {med.notes && (
                        <p className="text-sm text-muted-foreground pl-9 mt-1">
                          {med.notes}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {!added ? (
                <Button
                  onClick={handleAddAll}
                  disabled={adding}
                  className="w-full btn-xl bg-primary text-primary-foreground text-xl font-bold py-6"
                  aria-label="Add all medicines to my list"
                  data-ocid="scan.primary_button"
                >
                  <Plus className="w-6 h-6 mr-3" />
                  {adding ? "Adding..." : "Add All to My Medicines"}
                </Button>
              ) : (
                <div
                  className="flex items-center justify-center gap-3 p-6 bg-green-500/10 rounded-2xl"
                  data-ocid="scan.success_state"
                >
                  <CheckCircle className="w-8 h-8 text-green-500" />
                  <p className="text-green-500 text-xl font-bold">
                    Medicines saved!
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}
