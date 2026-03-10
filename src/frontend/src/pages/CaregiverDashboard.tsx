import { Layout } from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAppContext } from "@/context/AppContext";
import {
  useAcknowledgeAlert,
  useAlerts,
  useDoseLogsToday,
  useMedications,
} from "@/hooks/useQueries";
import { useVoice } from "@/hooks/useVoice";
import {
  AlertTriangle,
  Bell,
  CheckCircle,
  Pill,
  Users,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import { toast } from "sonner";

const ALERT_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  emergency: {
    label: "Emergency",
    color: "bg-destructive text-destructive-foreground",
  },
  missedDose: { label: "Missed Dose", color: "bg-primary/20 text-primary" },
  healthUpdate: {
    label: "Health Update",
    color: "bg-secondary/20 text-secondary",
  },
};

export function CaregiverDashboard() {
  const { speak } = useVoice();
  const { profile } = useAppContext();
  const { data: alerts = [], isLoading: alertsLoading } = useAlerts();
  const { data: doseLogs = [] } = useDoseLogsToday();
  const { data: medications = [] } = useMedications();
  const acknowledgeAlert = useAcknowledgeAlert();

  const unacknowledged = alerts.filter((a) => !a.acknowledged);
  const totalDoses = medications.reduce(
    (sum, m) => sum + m.scheduledTimes.length,
    0,
  );
  const takenCount = doseLogs.length;
  const missedCount = Math.max(0, totalDoses - takenCount);
  const progressPct = totalDoses > 0 ? (takenCount / totalDoses) * 100 : 0;

  // Get medication names that were missed
  const missedMeds = medications.filter(
    (med) => !doseLogs.some((log: any) => log.medicationId === med.id),
  );

  // Last health update
  const lastAlert = alerts
    .filter((a) => a.alertType?.toString() === "healthUpdate")
    .sort((a, b) => Number(b.timestamp) - Number(a.timestamp))[0];

  // biome-ignore lint/correctness/useExhaustiveDependencies: speak on mount
  useEffect(() => {
    speak(
      `Caregiver Dashboard. ${takenCount} of ${totalDoses} doses taken today. ${unacknowledged.length} unacknowledged alerts.`,
    );
  }, []);

  const handleAcknowledge = async (alertId: bigint) => {
    try {
      await acknowledgeAlert.mutateAsync(alertId);
      toast.success("Alert acknowledged");
    } catch {
      toast.error("Failed to acknowledge alert");
    }
  };

  const formatTime = (ts: bigint) => {
    const ms = Number(ts) / 1_000_000;
    return new Date(ms).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Layout>
      <div className="page-container pt-16 pb-24">
        <div className="flex items-center gap-3 mb-6">
          <Users className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-black">Caregiver Dashboard</h1>
        </div>

        {profile && (
          <Card className="mb-4 bg-card border-border">
            <CardContent className="p-4">
              <p className="text-muted-foreground text-sm">Patient</p>
              <p className="text-xl font-bold">{profile.name}</p>
              {profile.caregiver?.name && (
                <p className="text-muted-foreground">
                  Caregiver: {profile.caregiver.name} —{" "}
                  {profile.caregiver.phone}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Section 1: Medication Taken Today */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-4"
          data-ocid="caregiver.panel"
        >
          <Card className="border-green-500/30 bg-green-500/5">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <h2 className="text-xl font-bold text-green-500">
                  Medication Taken Today
                </h2>
              </div>
              <p className="text-3xl font-black text-foreground mb-2">
                {takenCount}{" "}
                <span className="text-xl text-muted-foreground font-normal">
                  / {totalDoses} doses
                </span>
              </p>
              <Progress value={progressPct} className="h-3 mb-2" />
              <p className="text-muted-foreground text-sm">
                {progressPct === 100
                  ? "All medicines taken ✅"
                  : `${Math.round(progressPct)}% complete`}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Section 2: Missed Doses */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mb-4"
        >
          <Card
            className={`border-${missedCount > 0 ? "destructive" : "border"}/30 bg-${missedCount > 0 ? "destructive" : "muted"}/5`}
          >
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <XCircle
                  className={`w-6 h-6 ${missedCount > 0 ? "text-destructive" : "text-muted-foreground"}`}
                />
                <h2
                  className={`text-xl font-bold ${missedCount > 0 ? "text-destructive" : "text-muted-foreground"}`}
                >
                  Missed Doses
                </h2>
              </div>
              {missedCount === 0 ? (
                <p className="text-green-500 font-semibold text-lg">
                  No missed doses today 🎉
                </p>
              ) : (
                <>
                  <p className="text-3xl font-black text-destructive mb-3">
                    {missedCount} missed
                  </p>
                  <div className="space-y-2">
                    {missedMeds.map((med) => (
                      <div
                        key={String(med.id)}
                        className="flex items-center gap-2 p-2 rounded-lg bg-destructive/10"
                      >
                        <Pill className="w-4 h-4 text-destructive" />
                        <span className="text-destructive font-medium">
                          {med.name} — {med.dosage}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Section 3: Last Health Update */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="mb-6"
        >
          <Card className="border-secondary/30 bg-secondary/5">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <Bell className="w-6 h-6 text-secondary" />
                <h2 className="text-xl font-bold text-secondary">
                  Last Health Update
                </h2>
              </div>
              {lastAlert ? (
                <>
                  <p className="text-foreground text-lg font-semibold">
                    {lastAlert.message}
                  </p>
                  <p className="text-muted-foreground text-sm mt-1">
                    {formatTime(lastAlert.timestamp)}
                  </p>
                </>
              ) : (
                <p className="text-muted-foreground text-lg">No updates yet</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Alerts Section */}
        <div className="mb-4">
          <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-primary" />
            Alerts
            {unacknowledged.length > 0 && (
              <Badge className="bg-destructive text-destructive-foreground">
                {unacknowledged.length}
              </Badge>
            )}
          </h2>

          {alertsLoading ? (
            <div
              className="p-6 text-center"
              data-ocid="caregiver.loading_state"
            >
              <p className="text-muted-foreground">Loading alerts...</p>
            </div>
          ) : alerts.length === 0 ? (
            <div
              className="p-6 text-center bg-card rounded-xl border border-border"
              data-ocid="caregiver.empty_state"
            >
              <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
              <p className="text-muted-foreground">No alerts</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert, idx) => {
                const typeInfo =
                  ALERT_TYPE_LABELS[alert.alertType?.toString()] ||
                  ALERT_TYPE_LABELS.healthUpdate;
                return (
                  <motion.div
                    key={String(alert.id)}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-4 rounded-xl border border-border bg-card"
                    data-ocid={`caregiver.item.${idx + 1}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={typeInfo.color}>
                            {typeInfo.label}
                          </Badge>
                          {alert.acknowledged && (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                        <p className="text-foreground font-medium">
                          {alert.message}
                        </p>
                        <p className="text-muted-foreground text-sm mt-1">
                          {formatTime(alert.timestamp)}
                        </p>
                      </div>
                      {!alert.acknowledged && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAcknowledge(alert.id)}
                          className="flex-shrink-0"
                          aria-label="Acknowledge alert"
                          data-ocid="caregiver.confirm_button"
                        >
                          OK
                        </Button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
