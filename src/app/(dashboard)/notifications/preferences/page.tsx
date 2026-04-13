import { getNotificationPreferences } from "@/lib/actions/notification-preferences";
import { PreferencesForm } from "./_components/preferences-form";

export default async function NotificationsPreferencesPage() {
  const prefs = await getNotificationPreferences();

  return (
    <div className="rounded-3xl border border-white/80 bg-white/70 p-6 shadow-xl shadow-black/[0.08] backdrop-blur-xl">
      <div className="mb-6 space-y-1">
        <h2 className="text-lg font-bold tracking-tight text-[#300000]">
          Preferences
        </h2>
        <p className="text-sm text-[#888888]">
          Choose which notifications you want to receive and how.
        </p>
      </div>
      <PreferencesForm defaultValues={prefs} />
    </div>
  );
}
