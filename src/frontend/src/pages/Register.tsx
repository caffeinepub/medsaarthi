import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppContext } from "@/context/AppContext";
import { useSaveProfile } from "@/hooks/useQueries";
import { useVoice } from "@/hooks/useVoice";
import { useNavigate } from "@tanstack/react-router";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Mic,
  MicOff,
  SkipForward,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
const LANGUAGES = ["English", "Hindi", "Tamil", "Telugu", "Bengali"];

type FieldKey =
  | "name"
  | "age"
  | "weight"
  | "bloodGroup"
  | "language"
  | "conditions"
  | "doctorContact"
  | "primaryCaregiver"
  | "secondaryCaregiver";

interface Step {
  key: FieldKey;
  label: string;
  prompt: string;
  placeholder?: string;
  inputType?: string;
  optional?: boolean;
  skipPrompt?: string;
  type: "text" | "number" | "buttons" | "tel";
  options?: string[];
}

const STEPS: Step[] = [
  {
    key: "name",
    label: "Your Name",
    prompt: "Please tell me your name.",
    placeholder: "Enter your full name",
    type: "text",
  },
  {
    key: "age",
    label: "Your Age",
    prompt: "How old are you?",
    placeholder: "Enter your age",
    type: "number",
    inputType: "number",
  },
  {
    key: "weight",
    label: "Your Weight (kg)",
    prompt: "What is your weight in kilograms?",
    placeholder: "Enter weight in kg",
    type: "number",
    inputType: "number",
  },
  {
    key: "bloodGroup",
    label: "Blood Group",
    prompt: "What is your blood group? Please select one.",
    type: "buttons",
    options: BLOOD_GROUPS,
  },
  {
    key: "language",
    label: "Preferred Language",
    prompt: "What is your preferred language?",
    type: "buttons",
    options: LANGUAGES,
  },
  {
    key: "conditions",
    label: "Medical Conditions",
    prompt:
      "What are your medical conditions? Say them or type, separated by commas.",
    placeholder: "e.g. Diabetes, Hypertension",
    type: "text",
  },
  {
    key: "doctorContact",
    label: "Doctor Contact",
    prompt:
      "Do you have a personal doctor? If yes, provide their phone number. If not, skip this step.",
    placeholder: "Doctor's phone number",
    type: "tel",
    inputType: "tel",
    optional: true,
    skipPrompt: "No problem, skipping doctor contact.",
  },
  {
    key: "primaryCaregiver",
    label: "Primary Caregiver Phone",
    prompt:
      "Please provide your primary caregiver's phone number. This is required.",
    placeholder: "Primary caregiver phone",
    type: "tel",
    inputType: "tel",
  },
  {
    key: "secondaryCaregiver",
    label: "Secondary Caregiver Phone",
    prompt:
      "Do you have a secondary caregiver? If yes, provide their phone number. If not, skip.",
    placeholder: "Secondary caregiver phone (optional)",
    type: "tel",
    inputType: "tel",
    optional: true,
    skipPrompt: "Skipping secondary caregiver.",
  },
];

export function Register() {
  const navigate = useNavigate();
  const { speak, listen, isListening } = useVoice();
  const saveProfile = useSaveProfile();
  const { setProfile } = useAppContext();

  const [step, setStep] = useState(0);
  const [values, setValues] = useState<Record<string, string>>({});
  const inputRef = useRef<HTMLInputElement>(null);

  const currentStep = STEPS[step];

  // biome-ignore lint/correctness/useExhaustiveDependencies: speak on step change
  useEffect(() => {
    const prompt = currentStep.optional
      ? `${currentStep.prompt} This step is optional. You can tap Skip to continue.`
      : currentStep.prompt;
    speak(prompt);
    setTimeout(() => inputRef.current?.focus(), 300);
  }, [step]);

  const handleVoiceInput = () => {
    speak(currentStep.prompt);
    listen((text) => {
      setValues((prev) => ({ ...prev, [currentStep.key]: text }));
    });
  };

  const handleSkip = () => {
    if (currentStep.skipPrompt) speak(currentStep.skipPrompt);
    setValues((prev) => {
      const n = { ...prev };
      delete n[currentStep.key];
      return n;
    });
    if (step < STEPS.length - 1) setStep((s) => s + 1);
    else handleSave();
  };

  const handleNext = () => {
    const val = values[currentStep.key]?.trim();
    if (!val && !currentStep.optional) {
      speak("Please provide an answer before continuing.");
      toast.error("Please fill in this field");
      return;
    }
    if (step < STEPS.length - 1) setStep((s) => s + 1);
    else handleSave();
  };

  const handleSave = async () => {
    try {
      speak("Saving your profile. Please wait.");
      const conditions = (values.conditions || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const age = BigInt(Math.max(1, Number.parseInt(values.age || "25", 10)));
      const weight = BigInt(
        Math.max(1, Number.parseInt(values.weight || "60", 10)),
      );
      const data = {
        name: values.name || "User",
        age,
        weight,
        bloodGroup: values.bloodGroup || "O+",
        preferredLanguage: values.language || "English",
        medicalConditions: conditions,
        doctorContact: values.doctorContact?.trim() || null,
        primaryCaregiverContact: values.primaryCaregiver || "",
        secondaryCaregiverContact: values.secondaryCaregiver?.trim() || null,
      };
      await saveProfile.mutateAsync(data);
      setProfile({
        name: data.name,
        age: data.age,
        weight: data.weight,
        bloodGroup: data.bloodGroup,
        preferredLanguage: data.preferredLanguage,
        medicalConditions: data.medicalConditions,
        doctorContact: data.doctorContact ?? undefined,
        primaryCaregiverContact: data.primaryCaregiverContact,
        secondaryCaregiverContact: data.secondaryCaregiverContact ?? undefined,
        registrationComplete: true,
        principal: null as any,
      });
      speak("Profile saved successfully. Welcome to MEDSAARTHI.");
      toast.success("Profile saved!");
      navigate({ to: "/home" });
    } catch {
      speak("Failed to save profile. Please try again.");
      toast.error("Failed to save profile");
    }
  };

  const progressPct = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-dvh flex flex-col px-6 py-8 bg-background">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-muted-foreground text-base">
            Step {step + 1} of {STEPS.length}
          </span>
          <span className="text-primary font-bold text-base">
            {Math.round(progressPct)}%
          </span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -60 }}
          transition={{ duration: 0.3 }}
          className="flex-1 flex flex-col gap-6"
        >
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-3xl font-bold text-foreground">
                {currentStep.label}
              </h2>
              {currentStep.optional && (
                <span className="text-sm font-medium px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">
                  Optional
                </span>
              )}
            </div>
            <p className="text-muted-foreground text-lg">
              {currentStep.prompt}
            </p>
          </div>

          {currentStep.type === "buttons" ? (
            <div className="flex flex-wrap gap-3">
              {currentStep.options?.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() =>
                    setValues((prev) => ({ ...prev, [currentStep.key]: opt }))
                  }
                  className={`px-6 py-4 rounded-xl text-lg font-bold border-2 transition-colors ${
                    values[currentStep.key] === opt
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-foreground border-border hover:border-primary"
                  }`}
                  aria-pressed={values[currentStep.key] === opt}
                  data-ocid="register.toggle"
                >
                  {opt}
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              <Label className="text-lg font-semibold">
                {currentStep.label}
              </Label>
              <div className="flex gap-3">
                <Input
                  ref={inputRef}
                  type={currentStep.inputType || "text"}
                  placeholder={currentStep.placeholder}
                  value={values[currentStep.key] || ""}
                  onChange={(e) =>
                    setValues((prev) => ({
                      ...prev,
                      [currentStep.key]: e.target.value,
                    }))
                  }
                  className="flex-1 h-16 text-xl px-4"
                  aria-label={currentStep.label}
                  data-ocid="register.input"
                  onKeyDown={(e) => e.key === "Enter" && handleNext()}
                />
                <Button
                  variant="outline"
                  onClick={handleVoiceInput}
                  className="w-16 h-16 rounded-xl flex-shrink-0"
                  aria-label={isListening ? "Stop listening" : "Voice input"}
                  data-ocid="register.toggle"
                >
                  {isListening ? (
                    <MicOff className="w-6 h-6 text-destructive" />
                  ) : (
                    <Mic className="w-6 h-6 text-primary" />
                  )}
                </Button>
              </div>
            </div>
          )}

          {isListening && (
            <div className="flex items-center gap-3 p-4 bg-primary/10 rounded-xl border border-primary/30">
              <div className="w-4 h-4 rounded-full bg-primary animate-pulse" />
              <p className="text-primary font-medium text-lg">
                Listening... Speak now
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex flex-col gap-3 mt-8">
        <div className="flex gap-4">
          {step > 0 && (
            <Button
              variant="outline"
              onClick={() => setStep((s) => s - 1)}
              className="flex-1 h-16 rounded-xl text-lg"
              aria-label="Previous step"
              data-ocid="register.secondary_button"
            >
              <ChevronLeft className="w-5 h-5 mr-2" /> Back
            </Button>
          )}
          <Button
            onClick={handleNext}
            disabled={saveProfile.isPending}
            className="flex-1 h-16 rounded-xl text-lg bg-primary text-primary-foreground font-bold"
            aria-label={
              step === STEPS.length - 1 ? "Save profile" : "Next step"
            }
            data-ocid="register.primary_button"
          >
            {step === STEPS.length - 1 ? (
              <>
                <Check className="w-5 h-5 mr-2" /> Save Profile
              </>
            ) : (
              <>
                Next <ChevronRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </div>
        {currentStep.optional && (
          <Button
            variant="outline"
            onClick={handleSkip}
            className="w-full h-16 rounded-xl text-lg font-bold bg-amber-500/10 border-2 border-amber-500 text-amber-400 hover:bg-amber-500/20 hover:text-amber-300"
            aria-label="Skip this optional step"
            data-ocid="register.cancel_button"
          >
            <SkipForward className="w-6 h-6 mr-2" /> Skip This Step (Optional)
          </Button>
        )}
      </div>
    </div>
  );
}
