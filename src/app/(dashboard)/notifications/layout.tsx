import { NotificationsTabs } from "./_components/notifications-tabs";

export default function NotificationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-[#300000]">
          Notifications
        </h1>
        <p className="text-[#888888]">
          Real-time alerts and notification history.
        </p>
      </div>

      <div className="rounded-2xl border border-white/80 bg-white/70 p-1 backdrop-blur-xl">
        <NotificationsTabs />
      </div>

      <div>{children}</div>
    </div>
  );
}
