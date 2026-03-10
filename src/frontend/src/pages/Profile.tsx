import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAppContext } from "@/context/AppContext";
import { useProfile } from "@/hooks/useQueries";
import { useVoice } from "@/hooks/useVoice";
import { useNavigate } from "@tanstack/react-router";
import { Edit3, Globe, Stethoscope, User, Users } from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";

const LANG_LABELS: Record<string, string> = {
  en: "English",
  hi: "Hindi",
  ta: "Tamil",
  bn: "Bengali",
  te: "Telugu",
};

export function Profile() {
  const navigate = useNavigate();
  const { speak } = useVoice();
  const { data: profile, isLoading } = useProfile();
  const { setProfile } = useAppContext();

  // biome-ignore lint/correctness/useExhaustiveDependencies: speak on profile load
  useEffect(() => {
    if (profile?.name) {
      speak(`Profile page. Viewing details for ${profile.name}.`);
    }
  }, [profile?.name]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: sync profile to context
  useEffect(() => {
    if (profile) setProfile(profile);
  }, [profile]);

  const profileItems = profile
    ? [
        { icon: User, label: "Name", value: profile.name },
        { icon: User, label: "Age", value: `${String(profile.age)} years` },
        {
          icon: Globe,
          label: "Language",
          value:
            LANG_LABELS[profile.preferredLanguage] || profile.preferredLanguage,
        },
        {
          icon: Stethoscope,
          label: "Doctor",
          value: `${profile.doctor?.name} — ${profile.doctor?.phone}`,
        },
        {
          icon: Users,
          label: "Caregiver",
          value: `${profile.caregiver?.name} — ${profile.caregiver?.phone}`,
        },
      ]
    : [];

  return (
    <Layout>
      <div className="page-container pt-16">
        <div className="flex items-center gap-3 mb-6">
          <User className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-black">My Profile</h1>
        </div>

        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 bg-muted rounded-2xl animate-pulse"
              />
            ))}
          </div>
        )}

        {!isLoading && !profile && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-xl mb-6">
              No profile found
            </p>
            <Button
              onClick={() => navigate({ to: "/register" })}
              className="btn-large bg-primary text-primary-foreground w-full"
              aria-label="Set up your profile"
            >
              Set Up Profile
            </Button>
          </div>
        )}

        {profile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-center mb-8">
              <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-5xl font-black text-primary">
                  {profile.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>

            {profileItems.map((item) => (
              <Card key={item.label} className="bg-card border-border">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">
                      {item.label}
                    </p>
                    <p className="text-foreground text-lg font-semibold">
                      {item.value}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button
              onClick={() => navigate({ to: "/register" })}
              className="w-full btn-large bg-primary/15 text-primary border border-primary/30 hover:bg-primary/25 mt-6"
              aria-label="Edit your profile"
              data-ocid="profile.edit_button"
            >
              <Edit3 className="w-5 h-5 mr-2" /> Edit Profile
            </Button>
          </motion.div>
        )}

        <footer className="text-center mt-12 pb-4">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      </div>
    </Layout>
  );
}
