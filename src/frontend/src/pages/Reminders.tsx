import { Layout } from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  useDoseLogsToday,
  useLogDose,
  useMedications,
} from "@/hooks/useQueries";
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

function getTimeGroup(timeStr: string): "morning" | "afternoon" | "night" {
  const [h] = timeStr.split(":").map(Number);
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "night";
}

function formatTime12h(timeStr: string): string {
  const [h, m] = timeStr.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
}

const GROUP_CONFIG = {
  morning: {
    label: "Morning",
    icon: Sun,
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
  },
  afternoon: {
    label: "Afternoon",
    icon: Sunset,
    color: "text-orange-400",
    bg: "bg-orange-400/10",
  },
  night: {
    label: "Night",
    icon: Moon,
    color: "text-indigo-400",
    bg: "bg-indigo-400/10",
  },
};

export function Reminders() {
  const { speak } = useVoice();
  const { data: medications = [], isLoading } = useMedications();
  const { data: doseLogs = [] } = useDoseLogsToday();
  const logDose = useLogDose();

  type DoseEntry = {
    med: any;
    time: string;
    group: "morning" | "afternoon" | "night";
    taken: boolean;
  };

  const todayDoses: DoseEntry[] = [];
  for (const med of medications) {
    for (const time of med.scheduledTimes) {
      const taken = doseLogs.some((l: any) => l.medicationId === med.id);
      todayDoses.push({ med, time, group: getTimeGroup(time), taken });
    }
  }
  todayDoses.sort((a, b) => a.time.localeCompare(b.time));

  const grouped = {
    morning: todayDoses.filter((d) => d.group === "morning"),
    afternoon: todayDoses.filter((d) => d.group === "afternoon"),
    night: todayDoses.filter((d) => d.group === "night"),
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: speak on data load
  useEffect(() => {
    const upcoming = todayDoses.filter((d) => !d.taken).length;
    speak(
      `Reminders. You have ${upcoming} pending doses today. It is time to take your medicine.`,
    );
  }, [medications.length]);

  const handleMarkTaken = async (med: any, _time: string) => {
    try {
      await logDose.mutateAsync({
        medicationId: med.id,
        confirmedByVoice: false,
      });
      speak(
        `${med.name} marked as taken. Thank you. Your medicine has been recorded.`,
      );
      toast.success(`${med.name} marked as taken`);
    } catch {
      toast.error("Failed to log dose");
    }
  };

  const handleConfirmMostRecent = () => {
    const pending = todayDoses.filter((d) => !d.taken);
    if (pending.length === 0) {
      speak("All medicines have been taken. Great job!");
      toast.success("All medicines taken!");
      return;
    }
    const next = pending[0];
    handleMarkTaken(next.med, next.time);
    speak("Thank you. Your medicine has been recorded.");
  };

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
          <h1 className="text-3xl font-black">Today&apos;s Medicines</h1>
        </div>

        <div className="space-y-6">
          {(
            Object.keys(grouped) as Array<"morning" | "afternoon" | "night">
          ).map((groupKey) => {
            const config = GROUP_CONFIG[groupKey];
            const doses = grouped[groupKey];
            const Icon = config.icon;

            return (
              <motion.div
                key={groupKey}
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

                {doses.length === 0 ? (
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
                    {doses.map((dose, idx) => (
                      <motion.div
                        key={`${dose.med.id}-${dose.time}`}
                        className="flex items-center justify-between p-4 rounded-xl border border-border bg-card"
                        whileTap={{ scale: 0.98 }}
                        data-ocid={`reminders.item.${idx + 1}`}
                      >
                        <div className="flex items-center gap-3">
                          <Pill className="w-6 h-6 text-primary" />
                          <div>
                            <p className="text-lg font-bold">{dose.med.name}</p>
                            <p className="text-muted-foreground text-sm">
                              {dose.med.dosage} · {formatTime12h(dose.time)}
                            </p>
                          </div>
                        </div>
                        {dose.taken ? (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-6 h-6 text-green-500" />
                            <span className="text-green-500 font-semibold">
                              ✔ Taken
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-muted-foreground" />
                            <Badge
                              variant="secondary"
                              className="text-base px-3 py-1"
                            >
                              Pending
                            </Badge>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}

          {todayDoses.length === 0 && (
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

        {/* Fixed confirm button */}
        <div
          className="fixed bottom-20 left-0 right-0 px-6"
          style={{
            maxWidth: "480px",
            margin: "0 auto",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          <Button
            onClick={handleConfirmMostRecent}
            className="w-full btn-xl bg-green-600 hover:bg-green-500 text-white text-xl font-bold py-6 rounded-2xl shadow-lg"
            aria-label="I took my medicine — confirm dose taken"
            data-ocid="reminders.confirm_button"
          >
            ✅ I Took My Medicine
          </Button>
        </div>
      </div>
    </Layout>
  );
}
