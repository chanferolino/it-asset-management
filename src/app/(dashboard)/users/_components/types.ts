export type User = {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "MANAGER" | "USER";
  status: "ACTIVE" | "INACTIVE";
  department: string | null;
  phone: string | null;
  createdAt: Date;
  updatedAt: Date;
};
