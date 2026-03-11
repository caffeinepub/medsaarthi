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
  useAddMedicine,
  useAllMedicines,
  useDeleteMedicine,
  useLogAdherence,
} from "@/hooks/useQueries";
import { useVoice } from "@/hooks/useVoice";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle, Pill, Plus, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const TIME_OPTIONS = ["Morning", "Afternoon", "Night"];

export function Medicines() {
  const navigate = useNavigate();
  const { speak } = useVoice();
  const { data: medicines = [], isLoading } = useAllMedicines();
  const addMed = useAddMedicine();
  const deleteMed = useDeleteMedicine();
  const logAdherence = useLogAdherence();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [form, setForm] = useState({ name: "", dosage: "", time: "Morning" });

  // biome-ignore lint/correctness/useExhaustiveDependencies: speak on load
  useEffect(() => {
    if (medicines.length > 0) {
      speak(`Your medicines: ${medicines.map((m) => m.name).join(", ")}.`);
    } else {
      speak("No medicines added yet. Tap the Add Medicine button to add one.");
    }
  }, [medicines.length]);

  const handleAdd = async () => {
    if (!form.name.trim()) {
      toast.error("Please enter medicine name");
      return;
    }
    try {
      await addMed.mutateAsync({
        name: form.name,
        dosage: form.dosage,
        time: form.time,
        source: "manual",
      });
      speak(`${form.name} added.`);
      toast.success("Medicine added!");
      setSheetOpen(false);
      setForm({ name: "", dosage: "", time: "Morning" });
    } catch {
      toast.error("Failed to add medicine");
    }
  };

  const handleTake = async (id: bigint, name: string) => {
    try {
      await logAdherence.mutateAsync({ medicineId: id, confirmed: true });
      speak(`Dose of ${name} logged. Well done!`);
      toast.success("Dose logged!");
    } catch {
      toast.error("Failed to log dose");
    }
  };

  const handleDelete = async (id: bigint, name: string) => {
    if (!confirm(`Remove ${name}?`)) return;
    try {
      await deleteMed.mutateAsync(id);
      speak(`${name} removed.`);
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
          <h1 className="text-3xl font-black">My Medicines</h1>
        </div>

        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button
              className="w-full h-16 rounded-xl text-lg bg-primary text-primary-foreground mb-6 font-bold"
              data-ocid="medicines.add_button"
              aria-label="Add new medicine"
            >
              <Plus className="w-6 h-6 mr-2" /> Add Medicine
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[70vh] overflow-y-auto">
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
                  placeholder="e.g. Paracetamol"
                  className="h-14 text-lg"
                  data-ocid="medicines.input"
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
                  data-ocid="medicines.input"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-base font-semibold">Time of Day</Label>
                <div className="flex gap-3">
                  {TIME_OPTIONS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, time: t }))}
                      className={`flex-1 py-4 rounded-xl text-base font-bold border-2 transition-colors ${
                        form.time === t
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card text-foreground border-border"
                      }`}
                      data-ocid="medicines.toggle"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <Button
                onClick={handleAdd}
                disabled={addMed.isPending}
                className="w-full h-14 rounded-xl text-lg bg-primary text-primary-foreground font-bold"
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
                className="h-28 bg-muted rounded-2xl animate-pulse"
              />
            ))}
          </div>
        )}

        {!isLoading && medicines.length === 0 && (
          <div
            data-ocid="medicines.empty_state"
            className="text-center py-16 space-y-4"
          >
            <Pill className="w-16 h-16 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground text-xl">
              No medicines added yet
            </p>
          </div>
        )}

        <AnimatePresence>
          {medicines.map((med, i) => (
            <motion.div
              key={String(med.id)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ delay: i * 0.05 }}
              className="mb-4 p-5 bg-card rounded-2xl border border-border"
              data-ocid={`medicines.item.${i + 1}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-xl font-bold">{med.name}</h3>
                  <p className="text-muted-foreground text-base">
                    {med.dosage}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(med.id, med.name)}
                  className="text-destructive hover:bg-destructive/10"
                  aria-label={`Remove ${med.name}`}
                  data-ocid={`medicines.delete_button.${i + 1}`}
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
              <Badge variant="secondary" className="mb-3 text-sm px-3 py-1">
                {med.time}
              </Badge>
              <Button
                onClick={() => handleTake(med.id, med.name)}
                className="w-full h-14 rounded-xl text-base bg-green-600/20 text-green-400 border border-green-600/40 hover:bg-green-600/30 font-bold"
                aria-label={`Mark ${med.name} as taken`}
                data-ocid={`medicines.primary_button.${i + 1}`}
              >
                <CheckCircle className="w-5 h-5 mr-2" /> I Took This
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Layout>
  );
}
