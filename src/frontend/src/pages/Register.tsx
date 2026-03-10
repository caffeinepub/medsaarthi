import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppContext } from "@/context/AppContext";
import { useSaveProfile } from "@/hooks/useQueries";
import { useVoice } from "@/hooks/useVoice";
import { useNavigate } from "@tanstack/react-router";
import { Check, ChevronLeft, ChevronRight, Mic, MicOff } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi" },
  { value: "ta", label: "Tamil" },
  { value: "bn", label: "Bengali" },
  { value: "te", label: "Telugu" },
];

type StepType = "text" | "number" | "select" | "tel" | "dual";

interface Step {
  key: string;
  label: string;
  prompt: string;
  type: StepType;
  placeholder?: string;
  subFields?: Array<{
    key: string;
    label: string;
    placeholder: string;
    type: string;
  }>;
}

const STEPS: Step[] = [
  {
    key: "name",
    label: "Your Name",
    prompt: "Please tell me your name.",
    type: "text",
    placeholder: "Enter your full name",
  },
  {
    key: "age",
    label: "Your Age",
    prompt: "How old are you?",
    type: "number",
    placeholder: "Enter your age",
  },
  {
    key: "language",
    label: "Preferred Language",
    prompt: "What is your preferred language?",
    type: "select",
  },
  {
    key: "conditions",
    label: "Medical Conditions",
    prompt: "What are your medical conditions?",
    type: "text",
    placeholder: "e.g. Diabetes, Hypertension",
  },
  {
    key: "doctorContact",
    label: "Doctor Contact",
    prompt: "Please provide your doctor's name and phone number.",
    type: "dual",
    subFields: [
      {
        key: "doctorName",
        label: "Doctor's Name",
        placeholder: "Enter doctor name",
        type: "text",
      },
      {
        key: "doctorPhone",
        label: "Doctor's Phone",
        placeholder: "Enter phone number",
        type: "tel",
      },
    ],
  },
  {
    key: "caregiverContact",
    label: "Caregiver Contact",
    prompt: "Please provide your caregiver's name and phone number.",
    type: "dual",
    subFields: [
      {
        key: "caregiverName",
        label: "Caregiver's Name",
        placeholder: "Enter caregiver name",
        type: "text",
      },
      {
        key: "caregiverPhone",
        label: "Caregiver's Phone",
        placeholder: "Enter phone number",
        type: "tel",
      },
    ],
  },
];

export function Register() {
  const navigate = useNavigate();
  const { speak, listen, isListening } = useVoice();
  const saveProfile = useSaveProfile();
  const { setProfile } = useAppContext();

  const [step, setStep] = useState(0);
  const [values, setValues] = useState<Record<string, string>>({
    language: "en",
  });
  const inputRef = useRef<HTMLInputElement>(null);

  const currentStep = STEPS[step];

  // biome-ignore lint/correctness/useExhaustiveDependencies: speak on step change
  useEffect(() => {
    speak(currentStep.prompt);
    setTimeout(() => inputRef.current?.focus(), 300);
  }, [step]);

  const handleVoiceInput = () => {
    speak(currentStep.prompt);
    listen((text) => {
      if (currentStep.type === "dual" && currentStep.subFields) {
        // Fill first sub-field with voice result
        setValues((prev) => ({
          ...prev,
          [currentStep.subFields![0].key]: text,
        }));
      } else {
        setValues((prev) => ({ ...prev, [currentStep.key]: text }));
      }
    });
  };

  const handleNext = () => {
    if (currentStep.type === "dual" && currentStep.subFields) {
      const allFilled = currentStep.subFields.every((sf) =>
        values[sf.key]?.trim(),
      );
      if (!allFilled) {
        speak("Please fill in both fields before continuing.");
        toast.error("Please fill in both fields");
        return;
      }
    } else {
      const val = values[currentStep.key];
      if (!val?.trim()) {
        speak("Please provide an answer before continuing.");
        toast.error("Please fill in this field");
        return;
      }
    }

    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      handleSave();
    }
  };

  const handleSave = async () => {
    try {
      speak("Saving your profile. Please wait.");
      const profileData = {
        name: values.name || "",
        age: BigInt(Number.parseInt(values.age || "0", 10)),
        preferredLanguage: values.language || "en",
        doctor: {
          name: values.doctorName || "",
          phone: values.doctorPhone || "",
        },
        caregiver: {
          name: values.caregiverName || "",
          phone: values.caregiverPhone || "",
        },
      };
      await saveProfile.mutateAsync(profileData);
      setProfile({
        ...profileData,
        principal: null as any,
        age: profileData.age,
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
    <div className="app-shell min-h-dvh flex flex-col px-6 py-8">
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
            <h2 className="text-3xl font-bold text-foreground mb-1">
              {currentStep.label}
            </h2>
            <p className="text-muted-foreground text-lg">
              {currentStep.prompt}
            </p>
          </div>

          {currentStep.type === "select" ? (
            <div className="space-y-2">
              <Label className="text-lg font-semibold">Select Language</Label>
              <Select
                value={values.language}
                onValueChange={(v) =>
                  setValues((prev) => ({ ...prev, language: v }))
                }
              >
                <SelectTrigger
                  className="h-16 text-lg"
                  aria-label="Select preferred language"
                  data-ocid="register.select"
                >
                  <SelectValue placeholder="Choose language" />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem
                      key={lang.value}
                      value={lang.value}
                      className="text-lg py-3"
                    >
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : currentStep.type === "dual" && currentStep.subFields ? (
            <div className="space-y-4">
              {currentStep.subFields.map((sf) => (
                <div key={sf.key} className="space-y-2">
                  <Label className="text-lg font-semibold">{sf.label}</Label>
                  <Input
                    type={sf.type}
                    placeholder={sf.placeholder}
                    value={values[sf.key] || ""}
                    onChange={(e) =>
                      setValues((prev) => ({
                        ...prev,
                        [sf.key]: e.target.value,
                      }))
                    }
                    className="h-16 text-xl px-4 bg-input border-border"
                    aria-label={sf.label}
                    data-ocid="register.input"
                  />
                </div>
              ))}
              <Button
                variant="outline"
                onClick={handleVoiceInput}
                className="w-full h-14 rounded-xl mt-2"
                aria-label={
                  isListening ? "Stop listening" : "Start voice input"
                }
              >
                {isListening ? (
                  <>
                    <MicOff className="w-6 h-6 text-destructive mr-2" /> Stop
                    Listening
                  </>
                ) : (
                  <>
                    <Mic className="w-6 h-6 text-primary mr-2" /> Voice Input
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Label className="text-lg font-semibold">
                {currentStep.label}
              </Label>
              <div className="flex gap-3">
                <Input
                  ref={inputRef}
                  type={currentStep.type}
                  placeholder={currentStep.placeholder}
                  value={values[currentStep.key] || ""}
                  onChange={(e) =>
                    setValues((prev) => ({
                      ...prev,
                      [currentStep.key]: e.target.value,
                    }))
                  }
                  className="flex-1 h-16 text-xl px-4 bg-input border-border"
                  aria-label={currentStep.label}
                  data-ocid="register.input"
                  onKeyDown={(e) => e.key === "Enter" && handleNext()}
                />
                <Button
                  variant="outline"
                  onClick={handleVoiceInput}
                  className="w-16 h-16 rounded-xl flex-shrink-0"
                  aria-label={
                    isListening ? "Stop listening" : "Start voice input"
                  }
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

      <div className="flex gap-4 mt-8">
        {step > 0 && (
          <Button
            variant="outline"
            onClick={() => setStep((s) => s - 1)}
            className="flex-1 btn-large"
            aria-label="Go to previous step"
            data-ocid="register.secondary_button"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
        )}
        <Button
          onClick={handleNext}
          disabled={saveProfile.isPending}
          className="flex-1 btn-large bg-primary text-primary-foreground hover:bg-primary/90"
          aria-label={step === STEPS.length - 1 ? "Save profile" : "Next step"}
          data-ocid="register.primary_button"
        >
          {step === STEPS.length - 1 ? (
            <>
              <Check className="w-5 h-5 mr-2" />
              Save Profile
            </>
          ) : (
            <>
              Next
              <ChevronRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
