export type Assignment = {
  id: string;
  tag: string;
  name: string;
  category: string;
  status: string;
  currentAssignee: {
    id: string;
    name: string;
    email: string;
    department: string | null;
  };
  checkedOutAt: string | null; // ISO date of latest CHECK_OUT event
};

export type DepartmentAllocation = {
  department: string;
  count: number;
};

export type CheckEventItem = {
  id: string;
  type: "CHECK_OUT" | "CHECK_IN";
  timestamp: string;
  notes: string | null;
  user: { id: string; name: string };
};
