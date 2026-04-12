import { getUsers, getDepartments } from "@/lib/actions/users";
import { UsersPageClient } from "./_components/users-page-client";

export default async function UsersPage() {
  const [users, departments] = await Promise.all([
    getUsers(),
    getDepartments(),
  ]);
  return <UsersPageClient users={users} departments={departments} />;
}
