import { Layout } from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  useAddMedication,
  useDeleteMedication,
  useLogDose,
  useMedications,
} from "@/hooks/useQueries";
import { useVoice } from "@/hooks/useVoice";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Pill,
  Plus,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function Medicines() {
  const navigate = useNavigate();
  const { speak } = useVoice();
  const { data: medications = [], isLoading } = useMedications();
  const addMed = useAddMedication();
  const deleteMed = useDeleteMedication();
  const logDose = useLogDose();
  const [sheetOpen, setSheetOpen] = useState(false);

  const [form, setForm] = useState({
    name: "",
    dosage: "",
    frequency: "1",
    times: ["08:00", "", "", ""],
    notes: "",
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: speak on data load
  useEffect(() => {
    if (medications.length > 0) {
      const names = medications.map((m) => m.name).join(", ");
      speak(`Your medicines are: ${names}.`);
    } else {
      speak("You have no medicines added yet. Tap the plus button to add one.");
    }
  }, [medications.length]);

  const handleAdd = async () => {
    if (!form.name.trim()) {
      toast.error("Please enter medicine name");
      return;
    }
    const times = form.times.filter(Boolean);
    try {
      await addMed.mutateAsync({
        name: form.name,
        dosage: form.dosage,
        frequency: BigInt(Number.parseInt(form.frequency) || 1),
        scheduledTimes: times,
        notes: form.notes,
      });
      speak(`${form.name} added to your medicines.`);
      toast.success("Medicine added!");
      setSheetOpen(false);
      setForm({
        name: "",
        dosage: "",
        frequency: "1",
        times: ["08:00", "", "", ""],
        notes: "",
      });
    } catch {
      toast.error("Failed to add medicine");
    }
  };

  const handleTake = async (med: any) => {
    try {
      await logDose.mutateAsync({
        medicationId: med.id,
        confirmedByVoice: false,
      });
      speak(`Dose of ${med.name} logged. Well done!`);
      toast.success("Dose logged. Well done! 💊");
    } catch {
      toast.error("Failed to log dose");
    }
  };

  const handleDelete = async (id: bigint, name: string) => {
    if (!confirm(`Remove ${name} from your medicines?`)) return;
    try {
      await deleteMed.mutateAsync(id);
      speak(`${name} has been removed.`);
      toast.success("Medicine removed");
    } catch {
      toast.error("Failed to remove medicine");
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
          <h1 className="text-3xl font-black text-foreground">My Medicines</h1>
        </div>

        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button
              className="w-full btn-large bg-primary text-primary-foreground mb-6 shadow-card"
              aria-label="Add new medicine"
              data-ocid="medicines.add_button"
            >
              <Plus className="w-6 h-6 mr-2" /> Add Medicine
            </Button>
          </SheetTrigger>
          <SheetContent
            side="bottom"
            className="bg-card border-border h-[85vh] overflow-y-auto"
          >
            <SheetHeader>
              <SheetTitle className="text-2xl font-bold">
                Add Medicine
              </SheetTitle>
            </SheetHeader>
            <div className="space-y-5 mt-6 px-1 pb-10">
              <div className="space-y-2">
                <Label className="text-base font-semibold">
                  Medicine Name *
                </Label>
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="e.g. Metformin"
                  className="h-14 text-lg"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-base font-semibold">Dosage</Label>
                <Input
                  value={form.dosage}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, dosage: e.target.value }))
                  }
                  placeholder="e.g. 500mg"
                  className="h-14 text-lg"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-base font-semibold">
                  Frequency (times per day)
                </Label>
                <Input
                  type="number"
                  min={1}
                  max={4}
                  value={form.frequency}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, frequency: e.target.value }))
                  }
                  className="h-14 text-lg"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-base font-semibold">
                  Scheduled Times
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  {form.times.map((t, i) => (
                    <Input
                      // biome-ignore lint/suspicious/noArrayIndexKey: fixed 4 slots
                      key={`time-${i}`}
                      type="time"
                      value={t}
                      onChange={(e) =>
                        setForm((p) => {
                          const times = [...p.times];
                          times[i] = e.target.value;
                          return { ...p, times };
                        })
                      }
                      className="h-14 text-lg"
                      aria-label={`Time ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-base font-semibold">Notes</Label>
                <Input
                  value={form.notes}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, notes: e.target.value }))
                  }
                  placeholder="Take with food, etc."
                  className="h-14 text-lg"
                />
              </div>
              <Button
                onClick={handleAdd}
                disabled={addMed.isPending}
                className="w-full btn-large bg-primary text-primary-foreground"
              >
                {addMed.isPending ? "Saving..." : "Save Medicine"}
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        {isLoading && (
          <div data-ocid="medicines.loading_state" className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-32 bg-muted rounded-2xl animate-pulse"
              />
            ))}
          </div>
        )}

        {!isLoading && medications.length === 0 && (
          <div
            data-ocid="medicines.empty_state"
            className="text-center py-16 space-y-4"
          >
            <Pill className="w-16 h-16 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground text-xl">
              No medicines added yet
            </p>
            <p className="text-muted-foreground">
              Tap "Add Medicine" to get started
            </p>
          </div>
        )}

        <AnimatePresence>
          {medications.map((med, i) => (
            <motion.div
              key={String(med.id)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ delay: i * 0.05 }}
              className="mb-4 p-5 bg-card rounded-2xl border border-border shadow-card"
              data-ocid={`medicines.item.${i + 1}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-foreground">
                    {med.name}
                  </h3>
                  <p className="text-muted-foreground text-base">
                    {med.dosage}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(med.id, med.name)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  aria-label={`Remove ${med.name}`}
                  data-ocid={`medicines.delete_button.${i + 1}`}
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
              {med.scheduledTimes.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {med.scheduledTimes.map((t) => (
                    <Badge
                      key={t}
                      variant="secondary"
                      className="flex items-center gap-1 py-1 px-3 text-sm"
                    >
                      <Clock className="w-3 h-3" />
                      {t}
                    </Badge>
                  ))}
                </div>
              )}
              {med.notes && (
                <p className="text-muted-foreground text-sm mb-4">
                  {med.notes}
                </p>
              )}
              <Button
                onClick={() => handleTake(med)}
                className="w-full btn-large bg-secondary/20 text-secondary border border-secondary/40 hover:bg-secondary/30"
                aria-label={`Mark ${med.name} as taken`}
                data-ocid={`medicines.take_button.${i + 1}`}
              >
                <CheckCircle className="w-5 h-5 mr-2" /> Take Now
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Layout>
  );
}
