import { Layout } from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAppContext } from "@/context/AppContext";
import {
  useAllMedicines,
  useMissedDoses,
  useTodaysAdherence,
} from "@/hooks/useQueries";
import { useVoice } from "@/hooks/useVoice";
import { AlertTriangle, CheckCircle, Pill, Users, XCircle } from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";

export function CaregiverDashboard() {
  const { speak } = useVoice();
  const { profile } = useAppContext();
  const { data: allMeds = [] } = useAllMedicines();
  const { data: adherence = [] } = useTodaysAdherence();
  const { data: missedMeds = [] } = useMissedDoses();

  const takenCount = adherence.length;
  const totalCount = allMeds.length;
  const progressPct = totalCount > 0 ? (takenCount / totalCount) * 100 : 0;

  // biome-ignore lint/correctness/useExhaustiveDependencies: speak on mount
  useEffect(() => {
    speak(
      `Caregiver Dashboard. ${takenCount} of ${totalCount} doses taken today. ${missedMeds.length} missed.`,
    );
  }, []);

  return (
    <Layout>
      <div className="page-container pt-16 pb-24">
        <div className="flex items-center gap-3 mb-6">
          <Users className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-black">Caregiver Dashboard</h1>
        </div>

        {profile && (
          <Card className="mb-4">
            <CardContent className="p-4">
              <p className="text-muted-foreground text-sm">Patient</p>
              <p className="text-xl font-bold">{profile.name}</p>
              <p className="text-muted-foreground text-sm">
                Age: {String(profile.age)} | Blood: {profile.bloodGroup}
              </p>
              {profile.primaryCaregiverContact && (
                <p className="text-muted-foreground text-sm mt-1">
                  Caregiver: {profile.primaryCaregiverContact}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Medication Taken */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
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
              <p className="text-3xl font-black mb-2">
                {takenCount}{" "}
                <span className="text-xl text-muted-foreground font-normal">
                  / {totalCount}
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

        {/* Missed Doses */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-4"
        >
          <Card
            className={
              missedMeds.length > 0
                ? "border-destructive/30 bg-destructive/5"
                : ""
            }
          >
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <XCircle
                  className={`w-6 h-6 ${missedMeds.length > 0 ? "text-destructive" : "text-muted-foreground"}`}
                />
                <h2
                  className={`text-xl font-bold ${missedMeds.length > 0 ? "text-destructive" : "text-muted-foreground"}`}
                >
                  Missed Doses
                </h2>
              </div>
              {missedMeds.length === 0 ? (
                <p className="text-green-500 font-semibold text-lg">
                  No missed doses today 🎉
                </p>
              ) : (
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
                      <Badge className="ml-auto" variant="destructive">
                        {med.time}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Emergency Contact */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-primary/30">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <AlertTriangle className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-bold">Emergency Contacts</h2>
              </div>
              {profile?.primaryCaregiverContact ? (
                <div className="space-y-2">
                  <a
                    href={`tel:${profile.primaryCaregiverContact}`}
                    className="flex items-center gap-2 p-3 rounded-xl bg-primary/10 text-primary font-bold text-lg"
                    data-ocid="caregiver.primary_button"
                  >
                    📞 Call Primary Caregiver
                  </a>
                  {profile.secondaryCaregiverContact && (
                    <a
                      href={`tel:${profile.secondaryCaregiverContact}`}
                      className="flex items-center gap-2 p-3 rounded-xl bg-muted text-foreground font-semibold text-base"
                      data-ocid="caregiver.secondary_button"
                    >
                      📞 Call Secondary Caregiver
                    </a>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  No caregiver contact saved
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}
