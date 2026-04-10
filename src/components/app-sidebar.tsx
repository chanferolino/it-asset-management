"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ArrowLeftRight,
  ArrowDownUp,
  Users,
  Building2,
  Ticket,
  BarChart3,
  Settings,
  Bell,
  LogOut,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

const navItems = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard },
  { title: "Inventory", href: "/inventory", icon: Package },
  { title: "Assignments", href: "/assignments", icon: ArrowLeftRight },
  { title: "Check-in/Out", href: "/checkinout", icon: ArrowDownUp },
  { title: "Users", href: "/users", icon: Users },
  { title: "Vendors", href: "/vendors", icon: Building2 },
  { title: "Tickets", href: "/tickets", icon: Ticket },
  { title: "Reports", href: "/reports", icon: BarChart3 },
  { title: "Configuration", href: "/configuration", icon: Settings },
  { title: "Notifications", href: "/notifications", icon: Bell },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar className="border-r border-black/[0.06] bg-white/70 backdrop-blur-xl">
      <SidebarHeader className="border-b border-black/[0.06] px-4 py-3">
        <span className="text-lg font-bold tracking-tight text-[#300000]">IT Assets</span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wide text-[#555555]">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={isActive}
                      className={cn(
                        "rounded-xl transition-all",
                        isActive
                          ? "bg-red-500/[0.08] text-[#c80000] font-medium"
                          : "text-[#888888] hover:bg-red-500/[0.04] hover:text-[#7b0000]"
                      )}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-black/[0.06]">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="rounded-xl text-[#888888] transition-all hover:bg-red-500/[0.04] hover:text-[#7b0000]"
            >
              <LogOut />
              <span>Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
