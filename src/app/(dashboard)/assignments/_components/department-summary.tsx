"use client";

import { Monitor } from "lucide-react";
import type { DepartmentAllocation } from "./types";

interface DepartmentSummaryProps {
  allocations: DepartmentAllocation[];
}

export function DepartmentSummary({ allocations }: DepartmentSummaryProps) {
  if (allocations.length === 0) return null;

  const total = allocations.reduce((sum, a) => sum + a.count, 0);

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      {/* Total card */}
      <div className="rounded-2xl border border-[#c80000]/20 bg-[#c80000]/[0.06] p-5 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#c80000]">
            Total Assigned
          </p>
          <Monitor className="size-4 text-[#c80000]" />
        </div>
        <p className="mt-2 text-3xl font-bold text-[#c80000]">{total}</p>
        <p className="mt-0.5 text-xs text-[#888888]">across {allocations.length} departments</p>
      </div>

      {/* Per-department cards */}
      {allocations.map((item) => (
        <div
          key={item.department}
          className="rounded-2xl border border-white/80 bg-white/70 p-5 shadow-lg shadow-black/[0.04] backdrop-blur-xl transition-all hover:shadow-xl hover:shadow-black/[0.08]"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-[#555555]">
            {item.department}
          </p>
          <p className="mt-2 text-3xl font-bold text-[#300000]">{item.count}</p>
          <p className="mt-0.5 text-xs text-[#888888]">
            {item.count === 1 ? "device" : "devices"}
          </p>
        </div>
      ))}
    </div>
  );
}
