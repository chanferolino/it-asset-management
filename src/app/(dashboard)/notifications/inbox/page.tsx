import { getNotifications } from "@/lib/actions/notifications";
import { NotificationList } from "./_components/notification-list";

export const dynamic = "force-dynamic";

export default async function NotificationsInboxPage() {
  const result = await getNotifications();
  const notifications = result.success ? result.notifications : [];

  return (
    <div className="rounded-3xl border border-white/80 bg-white/70 p-6 shadow-xl shadow-black/[0.08] backdrop-blur-xl">
      <div className="mb-6 space-y-1">
        <h2 className="text-lg font-bold tracking-tight text-[#300000]">
          Inbox
        </h2>
        <p className="text-sm text-[#888888]">
          All recent alerts. Filter by category or hide read items.
        </p>
      </div>
      <NotificationList initialNotifications={notifications} />
    </div>
  );
}
