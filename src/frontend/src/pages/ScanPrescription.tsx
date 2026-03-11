import { useCamera } from "@/camera/useCamera";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAddMedicine } from "@/hooks/useQueries";
import { useVoice } from "@/hooks/useVoice";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Camera,
  CheckCircle,
  Pill,
  Plus,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const TIME_OPTIONS = ["Morning", "Afternoon", "Night"];

interface MedEntry {
  id: number;
  name: string;
  dosage: string;
  time: string;
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
  const addMed = useAddMedicine();
  const [captured, setCaptured] = useState(false);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [medicines, setMedicines] = useState<MedEntry[]>([
    { id: Date.now(), name: "", dosage: "", time: "Morning" },
  ]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: run once
  useEffect(() => {
    speak(
      "Scan Prescription. Point your camera at the prescription and tap Scan. Then enter the medicine names you see.",
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
      "Photo captured. Please read the prescription and enter the medicine names and dosage below.",
    );
  };

  const handleAddRow = () => {
    setMedicines((prev) => [
      ...prev,
      { id: Date.now(), name: "", dosage: "", time: "Morning" },
    ]);
  };

  const handleRemoveRow = (idx: number) => {
    setMedicines((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleChange = (idx: number, field: keyof MedEntry, value: string) => {
    setMedicines((prev) =>
      prev.map((m, i) => (i === idx ? { ...m, [field]: value } : m)),
    );
  };

  const handleSaveAll = async () => {
    const valid = medicines.filter((m) => m.name.trim());
    if (valid.length === 0) {
      toast.error("Please enter at least one medicine name");
      speak("Please enter at least one medicine name.");
      return;
    }
    setAdding(true);
    try {
      await Promise.all(
        valid.map((m) =>
          addMed.mutateAsync({
            name: m.name.trim(),
            dosage: m.dosage.trim(),
            time: m.time,
            source: "scan",
          }),
        ),
      );
      setAdded(true);
      speak(
        `${valid.length} medicine${valid.length > 1 ? "s" : ""} saved: ${valid.map((m) => m.name).join(", ")}.`,
      );
      toast.success("Medicines saved!");
      setTimeout(() => navigate({ to: "/medicines" }), 1500);
    } catch {
      toast.error("Failed to save medicines");
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
                className="w-full h-16 rounded-xl text-xl font-bold bg-primary text-primary-foreground"
                aria-label="Scan prescription"
                data-ocid="scan.upload_button"
              >
                <Camera className="w-6 h-6 mr-3" /> Scan Prescription
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="entry"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 pb-12"
            >
              <div className="p-4 bg-primary/10 border border-primary/30 rounded-2xl flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-primary shrink-0" />
                <p className="text-primary text-base font-semibold">
                  Photo captured. Read the prescription and enter each medicine
                  below.
                </p>
              </div>

              {medicines.map((med, idx) => (
                <Card
                  key={med.id}
                  className="border-border"
                  data-ocid={`scan.item.${idx + 1}`}
                >
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Pill className="w-5 h-5 text-primary" />
                        <span className="font-bold text-base">
                          Medicine {idx + 1}
                        </span>
                      </div>
                      {medicines.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveRow(idx)}
                          className="text-destructive hover:bg-destructive/10"
                          aria-label="Remove medicine"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm font-semibold">
                        Medicine Name *
                      </Label>
                      <Input
                        value={med.name}
                        onChange={(e) =>
                          handleChange(idx, "name", e.target.value)
                        }
                        placeholder="e.g. Paracetamol"
                        className="h-12 text-base"
                        data-ocid="scan.input"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm font-semibold">Dosage</Label>
                      <Input
                        value={med.dosage}
                        onChange={(e) =>
                          handleChange(idx, "dosage", e.target.value)
                        }
                        placeholder="e.g. 500mg"
                        className="h-12 text-base"
                        data-ocid="scan.input"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm font-semibold">
                        Time of Day
                      </Label>
                      <div className="flex gap-2">
                        {TIME_OPTIONS.map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => handleChange(idx, "time", t)}
                            className={`flex-1 py-3 rounded-xl text-sm font-bold border-2 transition-colors ${
                              med.time === t
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-card text-foreground border-border"
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button
                variant="outline"
                onClick={handleAddRow}
                className="w-full h-14 rounded-xl text-base font-semibold border-dashed"
                data-ocid="scan.secondary_button"
              >
                <Plus className="w-5 h-5 mr-2" /> Add Another Medicine
              </Button>

              {!added ? (
                <Button
                  onClick={handleSaveAll}
                  disabled={adding}
                  className="w-full h-16 rounded-xl text-xl font-bold bg-primary text-primary-foreground"
                  aria-label="Save all medicines"
                  data-ocid="scan.primary_button"
                >
                  <CheckCircle className="w-6 h-6 mr-3" />{" "}
                  {adding ? "Saving..." : "Save to My Medicines"}
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
