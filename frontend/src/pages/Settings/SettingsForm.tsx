import type { User } from "../../types";
import AccountSection from "./AccountSection";
import SecuritySection from "./SecuritySection";
import PreferencesSection from "./PreferencesSection";
import DangerZoneSection from "./DangerZoneSection";

export default function SettingsForm({ user }: { user: User }) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <AccountSection user={user} />
      <SecuritySection />
      <PreferencesSection user={user} />
      <DangerZoneSection />
    </div>
  );
}
