import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type PhoneNumber = string;
export type Time = bigint;
export interface HealthCheckinResponse {
    date: string;
    questionsAndAnswers: Array<{
        question: string;
        answer: string;
    }>;
    session: string;
    timestamp: Time;
}
export type MedicineId = bigint;
export interface Medicine {
    id: MedicineId;
    dosage: string;
    source: string;
    name: string;
    time: string;
    addedAt: Time;
}
export interface AdherenceLog {
    takenAt: Time;
    confirmed: boolean;
    medicineId: MedicineId;
}
export interface UserProfile {
    age: bigint;
    weight: bigint;
    principal: Principal;
    preferredLanguage: string;
    name: string;
    medicalConditions: Array<string>;
    doctorContact?: PhoneNumber;
    bloodGroup: string;
    primaryCaregiverContact: PhoneNumber;
    registrationComplete: boolean;
    secondaryCaregiverContact?: PhoneNumber;
}
export interface backendInterface {
    addMedicine(name: string, dosage: string, time: string, source: string): Promise<MedicineId>;
    createEmergencyAlert(note: string): Promise<void>;
    deleteMedicine(medicineId: MedicineId): Promise<void>;
    getHealthCheckinsByDate(date: string): Promise<HealthCheckinResponse | null>;
    getMedicinesByTime(timeOfDay: string): Promise<Array<Medicine>>;
    getMissedDoses(): Promise<Array<Medicine>>;
    getTodaysAdherence(): Promise<Array<AdherenceLog>>;
    getUserProfile(): Promise<UserProfile | null>;
    logAdherence(medicineId: MedicineId, confirmed: boolean): Promise<void>;
    submitHealthCheckin(session: string, date: string, questionsAndAnswers: Array<{
        question: string;
        answer: string;
    }>): Promise<void>;
    updateUserProfile(name: string, age: bigint, weight: bigint, bloodGroup: string, preferredLanguage: string, medicalConditions: Array<string>, doctorContact: PhoneNumber | null, primaryCaregiverContact: PhoneNumber, secondaryCaregiverContact: PhoneNumber | null, registrationComplete: boolean): Promise<void>;
}
