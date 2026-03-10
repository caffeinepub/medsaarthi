import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export type MedicationId = bigint;
export interface Contact {
    name: string;
    phone: Phone;
}
export type AlertId = bigint;
export type Phone = string;
export interface HealthCheckIn {
    mood: Mood;
    timestamp: Time;
    sideEffects: string;
    symptoms: string;
}
export interface Profile {
    age: bigint;
    principal: Principal;
    preferredLanguage: string;
    doctor: Contact;
    name: string;
    caregiver: Contact;
}
export interface DoseLog {
    medicationId: MedicationId;
    timestamp: Time;
    confirmedByVoice: boolean;
}
export interface Medication {
    id: MedicationId;
    dosage: string;
    name: string;
    notes: string;
    scheduledTimes: Array<string>;
    frequency: bigint;
}
export interface Alert {
    id: AlertId;
    alertType: AlertType;
    acknowledged: boolean;
    message: string;
    timestamp: Time;
}
export enum AlertType {
    emergency = "emergency",
    missedDose = "missedDose",
    healthUpdate = "healthUpdate"
}
export enum Mood {
    fair = "fair",
    good = "good",
    poor = "poor"
}
export interface backendInterface {
    acknowledgeAlert(alertId: AlertId): Promise<void>;
    addMedication(name: string, dosage: string, frequency: bigint, scheduledTimes: Array<string>, notes: string): Promise<void>;
    createAlert(alertType: AlertType, message: string, timestamp: Time): Promise<void>;
    createOrUpdateProfile(name: string, age: bigint, preferredLanguage: string, doctor: Contact, caregiver: Contact): Promise<void>;
    deleteMedication(medicationId: MedicationId): Promise<void>;
    getDoseLogsForToday(): Promise<Array<DoseLog>>;
    getProfile(): Promise<Profile>;
    listAlerts(): Promise<Array<Alert>>;
    listMedications(): Promise<Array<Medication>>;
    listRecentCheckIns(): Promise<Array<HealthCheckIn>>;
    logDose(medicationId: MedicationId, timestamp: Time, confirmedByVoice: boolean): Promise<void>;
    submitCheckIn(symptoms: string, sideEffects: string, mood: Mood, timestamp: Time): Promise<void>;
}
