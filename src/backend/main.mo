import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Time "mo:core/Time";



actor {
  type PhoneNumber = Text;

  type UserProfile = {
    principal : Principal;
    name : Text;
    age : Nat;
    weight : Nat;
    bloodGroup : Text;
    preferredLanguage : Text;
    medicalConditions : [Text];
    doctorContact : ?PhoneNumber;
    primaryCaregiverContact : PhoneNumber;
    secondaryCaregiverContact : ?PhoneNumber;
    registrationComplete : Bool;
  };

  type MedicineId = Nat;

  type Medicine = {
    id : MedicineId;
    name : Text;
    dosage : Text;
    time : Text; // "Morning", "Afternoon", "Night"
    addedAt : Time.Time;
    source : Text; // "manual" or "scan"
  };

  type AdherenceLog = {
    medicineId : MedicineId;
    takenAt : Time.Time;
    confirmed : Bool;
  };

  type HealthCheckinResponse = {
    session : Text; // "Morning", "Afternoon", "Night"
    date : Text;
    questionsAndAnswers : [{ question : Text; answer : Text }];
    timestamp : Time.Time;
  };

  type EmergencyAlert = {
    timestamp : Time.Time;
    caregiverNotified : Bool;
    note : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let medicines = Map.empty<Principal, Map.Map<MedicineId, Medicine>>();
  let adherenceLogs = Map.empty<Principal, Map.Map<MedicineId, Map.Map<Time.Time, AdherenceLog>>>();
  let healthCheckins = Map.empty<Principal, Map.Map<Text, HealthCheckinResponse>>(); // Keyed by date
  let emergencyAlerts = Map.empty<Principal, EmergencyAlert>();

  var nextMedicineId = 0;

  /////////////////////////////
  // User Profile Methods
  /////////////////////////////
  public shared ({ caller }) func updateUserProfile(
    name : Text,
    age : Nat,
    weight : Nat,
    bloodGroup : Text,
    preferredLanguage : Text,
    medicalConditions : [Text],
    doctorContact : ?PhoneNumber,
    primaryCaregiverContact : PhoneNumber,
    secondaryCaregiverContact : ?PhoneNumber,
    registrationComplete : Bool,
  ) : async () {
    let newProfile : UserProfile = {
      principal = caller;
      name;
      age;
      weight;
      bloodGroup;
      preferredLanguage;
      medicalConditions;
      doctorContact;
      primaryCaregiverContact;
      secondaryCaregiverContact;
      registrationComplete;
    };
    userProfiles.add(caller, newProfile);
  };

  public query ({ caller }) func getUserProfile() : async ?UserProfile {
    userProfiles.get(caller);
  };

  /////////////////////////////
  // Medicine Management
  /////////////////////////////
  public shared ({ caller }) func addMedicine(
    name : Text,
    dosage : Text,
    time : Text,
    source : Text,
  ) : async MedicineId {
    let medicine : Medicine = {
      id = nextMedicineId;
      name;
      dosage;
      time;
      addedAt = Time.now();
      source;
    };

    let userMedicines = switch (medicines.get(caller)) {
      case (null) { Map.empty<MedicineId, Medicine>() };
      case (?existing) { existing };
    };

    userMedicines.add(nextMedicineId, medicine);
    medicines.add(caller, userMedicines);

    nextMedicineId += 1;
    nextMedicineId - 1;
  };

  public query ({ caller }) func getMedicinesByTime(timeOfDay : Text) : async [Medicine] {
    switch (medicines.get(caller)) {
      case (null) { [] };
      case (?userMedicines) {
        userMedicines.values().toArray().filter(func(m) { m.time == timeOfDay });
      };
    };
  };

  public shared ({ caller }) func deleteMedicine(medicineId : MedicineId) : async () {
    switch (medicines.get(caller)) {
      case (null) { Runtime.trap("No medicines found for user"); };
      case (?userMedicines) {
        switch (userMedicines.get(medicineId)) {
          case (null) { Runtime.trap("Medicine not found"); };
          case (_) {
            userMedicines.remove(medicineId);
          };
        };
      };
    };
  };

  /////////////////////////////
  // Adherence Logging
  /////////////////////////////
  public shared ({ caller }) func logAdherence(medicineId : MedicineId, confirmed : Bool) : async () {
    let log : AdherenceLog = {
      medicineId;
      takenAt = Time.now();
      confirmed;
    };

    let medicineLogs = switch (adherenceLogs.get(caller)) {
      case (null) { Map.empty<MedicineId, Map.Map<Time.Time, AdherenceLog>>() };
      case (?existing) { existing };
    };

    let dailyLogs = switch (medicineLogs.get(medicineId)) {
      case (null) { Map.empty<Time.Time, AdherenceLog>() };
      case (?existing) { existing };
    };

    dailyLogs.add(Time.now(), log);
    medicineLogs.add(medicineId, dailyLogs);
    adherenceLogs.add(caller, medicineLogs);
  };

  public query ({ caller }) func getTodaysAdherence() : async [AdherenceLog] {
    switch (adherenceLogs.get(caller)) {
      case (null) { [] };
      case (?medicineLogs) {
        let allLogs = medicineLogs.toArray();
        if (allLogs.size() > 0) {
          let firstEntry = allLogs[0];
          let dailyLogs = firstEntry.1;
          dailyLogs.values().toArray();
        } else { [] };
      };
    };
  };

  /////////////////////////////
  // Health Check-In
  /////////////////////////////
  public shared ({ caller }) func submitHealthCheckin(
    session : Text,
    date : Text,
    questionsAndAnswers : [{ question : Text; answer : Text }],
  ) : async () {
    let response : HealthCheckinResponse = {
      session;
      date;
      questionsAndAnswers;
      timestamp = Time.now();
    };

    let userCheckins = switch (healthCheckins.get(caller)) {
      case (null) { Map.empty<Text, HealthCheckinResponse>() };
      case (?existing) { existing };
    };

    userCheckins.add(date, response);
    healthCheckins.add(caller, userCheckins);
  };

  public query ({ caller }) func getHealthCheckinsByDate(date : Text) : async ?HealthCheckinResponse {
    switch (healthCheckins.get(caller)) {
      case (null) { null };
      case (?userCheckins) { userCheckins.get(date) };
    };
  };

  /////////////////////////////
  // Emergency Alerts
  /////////////////////////////
  public shared ({ caller }) func createEmergencyAlert(note : Text) : async () {
    let alert : EmergencyAlert = {
      timestamp = Time.now();
      caregiverNotified = false;
      note;
    };
    emergencyAlerts.add(caller, alert);
  };

  /////////////////////////////
  // Helper Methods
  /////////////////////////////
  public query ({ caller }) func getMissedDoses() : async [Medicine] {
    let missingDoses : [Medicine] = switch (medicines.get(caller)) {
      case (null) { [] };
      case (?userMedicines) {
        userMedicines.values().toArray().filter(func(m) { true });
      };
    };
    missingDoses;
  };
};
