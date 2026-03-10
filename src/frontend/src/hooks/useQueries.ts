import type {
  Alert,
  DoseLog,
  HealthCheckIn,
  Medication,
  Profile,
} from "@/backend";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";

export function useProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<Profile | null>({
    queryKey: ["profile"],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getProfile();
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMedications() {
  const { actor, isFetching } = useActor();
  return useQuery<Medication[]>({
    queryKey: ["medications"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listMedications();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAlerts() {
  const { actor, isFetching } = useActor();
  return useQuery<Alert[]>({
    queryKey: ["alerts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listAlerts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useDoseLogsToday() {
  const { actor, isFetching } = useActor();
  return useQuery<DoseLog[]>({
    queryKey: ["doseLogs", "today"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getDoseLogsForToday();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRecentCheckins() {
  const { actor, isFetching } = useActor();
  return useQuery<HealthCheckIn[]>({
    queryKey: ["checkins"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listRecentCheckIns();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      age: bigint;
      preferredLanguage: string;
      doctor: { name: string; phone: string };
      caregiver: { name: string; phone: string };
    }) => {
      if (!actor) throw new Error("No actor");
      await actor.createOrUpdateProfile(
        data.name,
        data.age,
        data.preferredLanguage,
        data.doctor,
        data.caregiver,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  });
}

export function useAddMedication() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      dosage: string;
      frequency: bigint;
      scheduledTimes: string[];
      notes: string;
    }) => {
      if (!actor) throw new Error("No actor");
      await actor.addMedication(
        data.name,
        data.dosage,
        data.frequency,
        data.scheduledTimes,
        data.notes,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["medications"] }),
  });
}

export function useDeleteMedication() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      await actor.deleteMedication(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["medications"] }),
  });
}

export function useLogDose() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      medicationId: bigint;
      confirmedByVoice: boolean;
    }) => {
      if (!actor) throw new Error("No actor");
      const ts = BigInt(Date.now()) * BigInt(1_000_000);
      await actor.logDose(data.medicationId, ts, data.confirmedByVoice);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["doseLogs"] }),
  });
}

export function useCreateAlert() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { alertType: string; message: string }) => {
      if (!actor) throw new Error("No actor");
      const ts = BigInt(Date.now()) * BigInt(1_000_000);
      await actor.createAlert(data.alertType as any, data.message, ts);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["alerts"] }),
  });
}

export function useAcknowledgeAlert() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (alertId: bigint) => {
      if (!actor) throw new Error("No actor");
      await actor.acknowledgeAlert(alertId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["alerts"] }),
  });
}

export function useSubmitCheckin() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      symptoms: string;
      sideEffects: string;
      mood: string;
    }) => {
      if (!actor) throw new Error("No actor");
      const ts = BigInt(Date.now()) * BigInt(1_000_000);
      await actor.submitCheckIn(
        data.symptoms,
        data.sideEffects,
        data.mood as any,
        ts,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["checkins"] }),
  });
}
