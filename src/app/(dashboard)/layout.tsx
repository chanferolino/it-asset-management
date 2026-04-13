import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { NotificationsBell } from "@/components/notifications-bell";
import { getNotifications } from "@/lib/actions/notifications";
import type { Notification } from "@/lib/notifications/types";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let notifications: Notification[];
  try {
    notifications = await getNotifications();
  } catch {
    notifications = [];
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 items-center gap-2 border-b border-black/[0.06] bg-white/70 px-4 backdrop-blur-xl">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-6" />
          <div className="ml-auto flex items-center gap-2">
            <NotificationsBell initialNotifications={notifications} />
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
