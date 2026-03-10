import Map "mo:core/Map";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";

actor {
  type Phone = Text;

  type Contact = {
    name : Text;
    phone : Phone;
  };

  type Profile = {
    principal : Principal;
    name : Text;
    age : Nat;
    preferredLanguage : Text;
    doctor : Contact;
    caregiver : Contact;
  };

  type MedicationId = Nat;

  type Medication = {
    id : MedicationId;
    name : Text;
    dosage : Text;
    frequency : Nat;
    scheduledTimes : [Text];
    notes : Text;
  };

  type DoseLog = {
    medicationId : MedicationId;
    timestamp : Time.Time;
    confirmedByVoice : Bool;
  };

  type AlertType = {
    #missedDose;
    #emergency;
    #healthUpdate;
  };

  type AlertId = Nat;

  type Alert = {
    id : AlertId;
    alertType : AlertType;
    message : Text;
    timestamp : Time.Time;
    acknowledged : Bool;
  };

  type Mood = {
    #good;
    #fair;
    #poor;
  };

  type HealthCheckIn = {
    symptoms : Text;
    sideEffects : Text;
    mood : Mood;
    timestamp : Time.Time;
  };

  module Profile {
    public func compare(profile1 : Profile, profile2 : Profile) : Order.Order {
      Principal.compare(profile1.principal, profile2.principal);
    };
  };

  module Medication {
    public func compare(med1 : Medication, med2 : Medication) : Order.Order {
      Text.compare(med1.name, med2.name);
    };
  };

  let profiles = Map.empty<Principal, Profile>();
  let medications = Map.empty<Principal, Map.Map<MedicationId, Medication>>();
  let doseLogs = Map.empty<Principal, Map.Map<Time.Time, DoseLog>>();
  let alerts = Map.empty<Principal, Map.Map<AlertId, Alert>>();
  let healthCheckIns = Map.empty<Principal, Map.Map<Time.Time, HealthCheckIn>>();

  var nextMedicationId = 0;
  var nextAlertId = 0;

  // User Profile
  public shared ({ caller }) func createOrUpdateProfile(name : Text, age : Nat, preferredLanguage : Text, doctor : Contact, caregiver : Contact) : async () {
    let newProfile : Profile = {
      principal = caller;
      name;
      age;
      preferredLanguage;
      doctor;
      caregiver;
    };
    profiles.add(caller, newProfile);
  };

  public query ({ caller }) func getProfile() : async Profile {
    switch (profiles.get(caller)) {
      case (null) { Runtime.trap("No profile found for user: " # caller.toText()) };
      case (?profile) { profile };
    };
  };

  // Medications
  public shared ({ caller }) func addMedication(name : Text, dosage : Text, frequency : Nat, scheduledTimes : [Text], notes : Text) : async () {
    let medication : Medication = {
      id = nextMedicationId;
      name;
      dosage;
      frequency;
      scheduledTimes;
      notes;
    };
    let userMedications = switch (medications.get(caller)) {
      case (null) {
        Map.empty<MedicationId, Medication>();
      };
      case (?existing) {
        existing;
      };
    };
    userMedications.add(nextMedicationId, medication);
    medications.add(caller, userMedications);
    nextMedicationId += 1;
  };

  public query ({ caller }) func listMedications() : async [Medication] {
    switch (medications.get(caller)) {
      case (null) { [] };
      case (?userMedications) {
        userMedications.values().toArray().sort();
      };
    };
  };

  public shared ({ caller }) func deleteMedication(medicationId : MedicationId) : async () {
    switch (medications.get(caller)) {
      case (null) { Runtime.trap("No medications found for user: " # caller.toText()) };
      case (?userMedications) {
        switch (userMedications.get(medicationId)) {
          case (null) { Runtime.trap("Medication not found: " # medicationId.toText()) };
          case (_) {
            userMedications.remove(medicationId);
          };
        };
      };
    };
  };

  // Dose Logs
  public shared ({ caller }) func logDose(medicationId : MedicationId, timestamp : Time.Time, confirmedByVoice : Bool) : async () {
    let doseLog : DoseLog = {
      medicationId;
      timestamp;
      confirmedByVoice;
    };

    let userLogs = switch (doseLogs.get(caller)) {
      case (null) {
        Map.empty<Time.Time, DoseLog>();
      };
      case (?existing) {
        existing;
      };
    };

    userLogs.add(timestamp, doseLog);
    doseLogs.add(caller, userLogs);
  };

  public query ({ caller }) func getDoseLogsForToday() : async [DoseLog] {
    switch (doseLogs.get(caller)) {
      case (null) { [] };
      case (?userLogs) {
        userLogs.values().toArray();
      };
    };
  };

  // Caregiver Alerts
  public shared ({ caller }) func createAlert(alertType : AlertType, message : Text, timestamp : Time.Time) : async () {
    let alert : Alert = {
      id = nextAlertId;
      alertType;
      message;
      timestamp;
      acknowledged = false;
    };

    let userAlerts = switch (alerts.get(caller)) {
      case (null) {
        Map.empty<AlertId, Alert>();
      };
      case (?existing) {
        existing;
      };
    };

    userAlerts.add(nextAlertId, alert);
    alerts.add(caller, userAlerts);
    nextAlertId += 1;
  };

  public query ({ caller }) func listAlerts() : async [Alert] {
    switch (alerts.get(caller)) {
      case (null) { [] };
      case (?userAlerts) {
        userAlerts.values().toArray();
      };
    };
  };

  public shared ({ caller }) func acknowledgeAlert(alertId : AlertId) : async () {
    switch (alerts.get(caller)) {
      case (null) { Runtime.trap("No alerts found for user: " # caller.toText()) };
      case (?userAlerts) {
        switch (userAlerts.get(alertId)) {
          case (null) { Runtime.trap("Alert not found: " # alertId.toText()) };
          case (?alert) {
            let updatedAlert : Alert = { alert with acknowledged = true };
            userAlerts.add(alertId, updatedAlert);
          };
        };
      };
    };
  };

  // Health Check-Ins
  public shared ({ caller }) func submitCheckIn(symptoms : Text, sideEffects : Text, mood : Mood, timestamp : Time.Time) : async () {
    let checkIn : HealthCheckIn = {
      symptoms;
      sideEffects;
      mood;
      timestamp;
    };

    let userCheckIns = switch (healthCheckIns.get(caller)) {
      case (null) {
        Map.empty<Time.Time, HealthCheckIn>();
      };
      case (?existing) {
        existing;
      };
    };

    userCheckIns.add(timestamp, checkIn);
    healthCheckIns.add(caller, userCheckIns);
  };

  public query ({ caller }) func listRecentCheckIns() : async [HealthCheckIn] {
    switch (healthCheckIns.get(caller)) {
      case (null) { [] };
      case (?userCheckIns) {
        userCheckIns.values().toArray();
      };
    };
  };
};
