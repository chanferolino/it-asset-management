import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface IntegrationCardProps {
  name: string;
  description: string;
  icon: LucideIcon;
}

export function IntegrationCard({
  name,
  description,
  icon: Icon,
}: IntegrationCardProps) {
  return (
    <div className="rounded-3xl border border-white/80 bg-white/70 p-6 shadow-xl shadow-black/[0.08] backdrop-blur-xl">
      <div className="flex items-start justify-between">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-red-500/[0.08] text-[#c80000]">
          <Icon className="size-6" />
        </div>
        <Badge
          variant="outline"
          className="border-[#e0e0e0] bg-white/60 text-[#888888]"
        >
          Coming soon
        </Badge>
      </div>
      <div className="mt-4 space-y-1">
        <h3 className="text-base font-bold tracking-tight text-[#300000]">
          {name}
        </h3>
        <p className="text-sm text-[#888888]">{description}</p>
      </div>
    </div>
  );
}
