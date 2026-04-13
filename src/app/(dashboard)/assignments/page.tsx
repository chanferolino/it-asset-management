import {
  getCurrentAssignments,
  getDepartmentAllocation,
} from "@/lib/actions/assignments";
import { AssignmentsPageClient } from "./_components/assignments-page-client";
import type { Assignment } from "./_components/types";

export const dynamic = "force-dynamic";

export default async function AssignmentsPage() {
  const [rawAssignments, departmentAllocations] = await Promise.all([
    getCurrentAssignments(),
    getDepartmentAllocation(),
  ]);

  const assignments: Assignment[] = rawAssignments.map((asset) => ({
    id: asset.id,
    tag: asset.tag,
    name: asset.name,
    category: asset.category,
    status: asset.status,
    currentAssignee: asset.currentAssignee!,
    checkedOutAt:
      asset.checkEvents[0]?.timestamp?.toISOString() ?? null,
  }));

  return (
    <AssignmentsPageClient
      assignments={assignments}
      departmentAllocations={departmentAllocations}
    />
  );
}
