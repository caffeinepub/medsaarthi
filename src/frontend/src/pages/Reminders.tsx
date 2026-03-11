import { Layout } from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  useAllMedicines,
  useLogAdherence,
  useTodaysAdherence,
} from "@/hooks/useQueries";
import { useReminders } from "@/hooks/useReminders";
import { useVoice } from "@/hooks/useVoice";
import {
  Bell,
  CheckCircle,
  Clock,
  Moon,
  Pill,
  Sun,
  Sunset,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import { toast } from "sonner";

type TOD = "Morning" | "Afternoon" | "Night";

const GROUP_CONFIG: Record<
  TOD,
  { label: string; icon: typeof Sun; color: string; bg: string }
> = {
  Morning: {
    label: "Morning",
    icon: Sun,
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
  },
  Afternoon: {
    label: "Afternoon",
    icon: Sunset,
    color: "text-orange-400",
    bg: "bg-orange-400/10",
  },
  Night: {
    label: "Night",
    icon: Moon,
    color: "text-indigo-400",
    bg: "bg-indigo-400/10",
  },
};

export function Reminders() {
  const { speak } = useVoice();
  const { data: medicines = [], isLoading } = useAllMedicines();
  const { data: adherence = [] } = useTodaysAdherence();
  const logAdherence = useLogAdherence();

  const takenIds = new Set(adherence.map((a) => String(a.medicineId)));

  useReminders(medicines, (med) => {
    toast(`Time to take ${med.name}!`, { duration: 10000 });
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: speak on load
  useEffect(() => {
    const pending = medicines.filter((m) => !takenIds.has(String(m.id))).length;
    speak(`Reminders. You have ${pending} pending doses today.`);
  }, [medicines.length]);

  const handleMarkTaken = async (id: bigint, name: string) => {
    try {
      await logAdherence.mutateAsync({ medicineId: id, confirmed: true });
      speak(`${name} marked as taken. Thank you.`);
      toast.success(`${name} marked as taken`);
    } catch {
      toast.error("Failed to log dose");
    }
  };

  const handleConfirmAll = () => {
    const pending = medicines.filter((m) => !takenIds.has(String(m.id)));
    if (pending.length === 0) {
      speak("All medicines have been taken. Great job!");
      toast.success("All medicines taken!");
      return;
    }
    handleMarkTaken(pending[0].id, pending[0].name);
  };

  const grouped: Record<TOD, typeof medicines> = {
    Morning: [],
    Afternoon: [],
    Night: [],
  };
  for (const med of medicines) {
    const tod = med.time as TOD;
    if (grouped[tod]) grouped[tod].push(med);
  }

  if (isLoading) {
    return (
      <Layout>
        <div
          className="page-container pt-16 flex items-center justify-center min-h-[50vh]"
          data-ocid="reminders.loading_state"
        >
          <p className="text-muted-foreground text-xl">Loading reminders...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="page-container pt-16 pb-36">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-black">Today's Medicines</h1>
        </div>

        <div className="space-y-6">
          {(["Morning", "Afternoon", "Night"] as TOD[]).map((tod) => {
            const config = GROUP_CONFIG[tod];
            const meds = grouped[tod];
            const Icon = config.icon;
            return (
              <motion.div
                key={tod}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div
                  className={`flex items-center gap-2 mb-3 p-3 rounded-xl ${config.bg}`}
                >
                  <Icon className={`w-6 h-6 ${config.color}`} />
                  <h2 className={`text-xl font-bold ${config.color}`}>
                    {config.label}
                  </h2>
                </div>
                {meds.length === 0 ? (
                  <div className="p-4 rounded-xl border border-border bg-card">
                    <Badge
                      variant="outline"
                      className="text-muted-foreground text-base px-3 py-1"
                    >
                      No medicines scheduled
                    </Badge>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {meds.map((med, idx) => {
                      const taken = takenIds.has(String(med.id));
                      return (
                        <motion.div
                          key={String(med.id)}
                          className="flex items-center justify-between p-4 rounded-xl border border-border bg-card"
                          data-ocid={`reminders.item.${idx + 1}`}
                        >
                          <div className="flex items-center gap-3">
                            <Pill className="w-6 h-6 text-primary" />
                            <div>
                              <p className="text-lg font-bold">{med.name}</p>
                              <p className="text-muted-foreground text-sm">
                                {med.dosage}
                              </p>
                            </div>
                          </div>
                          {taken ? (
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-6 h-6 text-green-500" />
                              <span className="text-green-500 font-semibold">
                                Taken
                              </span>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleMarkTaken(med.id, med.name)}
                              className="bg-primary text-primary-foreground rounded-lg px-4 h-10"
                              data-ocid={`reminders.primary_button.${idx + 1}`}
                            >
                              Take
                            </Button>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            );
          })}

          {medicines.length === 0 && (
            <div
              className="text-center py-12"
              data-ocid="reminders.empty_state"
            >
              <Pill className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-xl text-muted-foreground">
                No medicines scheduled today
              </p>
            </div>
          )}
        </div>

        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-full max-w-md px-6">
          <Button
            onClick={handleConfirmAll}
            className="w-full h-16 rounded-2xl text-xl font-bold bg-green-600 hover:bg-green-500 text-white shadow-lg"
            aria-label="I took my medicine"
            data-ocid="reminders.confirm_button"
          >
            <CheckCircle className="w-6 h-6 mr-2" /> I Took My Medicine
          </Button>
        </div>
      </div>
    </Layout>
  );
}
