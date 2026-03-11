import type { Medicine, UserProfile } from "@/backend";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";

export function useProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["profile"],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getUserProfile();
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMedicinesByTime(
  timeOfDay: "Morning" | "Afternoon" | "Night",
) {
  const { actor, isFetching } = useActor();
  return useQuery<Medicine[]>({
    queryKey: ["medicines", timeOfDay],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMedicinesByTime(timeOfDay);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllMedicines() {
  const { actor, isFetching } = useActor();
  return useQuery<Medicine[]>({
    queryKey: ["medicines", "all"],
    queryFn: async () => {
      if (!actor) return [];
      const [m, a, n] = await Promise.all([
        actor.getMedicinesByTime("Morning"),
        actor.getMedicinesByTime("Afternoon"),
        actor.getMedicinesByTime("Night"),
      ]);
      return [...m, ...a, ...n];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useTodaysAdherence() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["adherence", "today"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTodaysAdherence();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMissedDoses() {
  const { actor, isFetching } = useActor();
  return useQuery<Medicine[]>({
    queryKey: ["medicines", "missed"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMissedDoses();
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
      weight: bigint;
      bloodGroup: string;
      preferredLanguage: string;
      medicalConditions: string[];
      doctorContact: string | null;
      primaryCaregiverContact: string;
      secondaryCaregiverContact: string | null;
    }) => {
      if (!actor) throw new Error("No actor");
      await actor.updateUserProfile(
        data.name,
        data.age,
        data.weight,
        data.bloodGroup,
        data.preferredLanguage,
        data.medicalConditions,
        data.doctorContact,
        data.primaryCaregiverContact,
        data.secondaryCaregiverContact,
        true,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  });
}

export function useAddMedicine() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      dosage: string;
      time: string;
      source: string;
    }) => {
      if (!actor) throw new Error("No actor");
      await actor.addMedicine(data.name, data.dosage, data.time, data.source);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["medicines"] }),
  });
}

export function useDeleteMedicine() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      await actor.deleteMedicine(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["medicines"] }),
  });
}

export function useLogAdherence() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { medicineId: bigint; confirmed: boolean }) => {
      if (!actor) throw new Error("No actor");
      await actor.logAdherence(data.medicineId, data.confirmed);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adherence"] }),
  });
}

export function useSubmitHealthCheckin() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      session: string;
      date: string;
      questionsAndAnswers: Array<{ question: string; answer: string }>;
    }) => {
      if (!actor) throw new Error("No actor");
      await actor.submitHealthCheckin(
        data.session,
        data.date,
        data.questionsAndAnswers,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["checkins"] }),
  });
}

export function useCreateEmergencyAlert() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (note: string) => {
      if (!actor) throw new Error("No actor");
      await actor.createEmergencyAlert(note);
    },
  });
}
