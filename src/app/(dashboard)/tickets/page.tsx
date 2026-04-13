import { getTickets, getUsers } from "@/lib/actions/tickets";
import { TicketsPageClient } from "./_components/tickets-page-client";

export const dynamic = "force-dynamic";

export default async function TicketsPage() {
  const [tickets, users] = await Promise.all([getTickets(), getUsers()]);
  return <TicketsPageClient tickets={tickets} users={users} />;
}
