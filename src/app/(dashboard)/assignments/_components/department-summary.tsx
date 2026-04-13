"use client";

import type { DepartmentAllocation } from "./types";

interface DepartmentSummaryProps {
  allocations: DepartmentAllocation[];
}

export function DepartmentSummary({ allocations }: DepartmentSummaryProps) {
  if (allocations.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-3">
      {allocations.map((item) => (
        <div
          key={item.department}
          className="rounded-2xl border border-white/80 bg-white/70 p-4 shadow-lg shadow-black/[0.04] backdrop-blur-xl"
        >
          <p className="text-sm font-medium text-[#300000]">
            {item.department}
          </p>
          <p className="mt-1 text-2xl font-bold text-[#c80000]">
            {item.count}
          </p>
          <p className="text-xs text-[#888888]">devices</p>
        </div>
      ))}
    </div>
  );
}
