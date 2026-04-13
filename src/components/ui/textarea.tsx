import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-xl border border-[#e0e0e0] bg-white/60 backdrop-blur-sm px-2.5 py-2 text-base text-[#300000] transition-colors outline-none placeholder:text-[#bbbbbb] focus:border-red-500 focus:ring-2 focus:ring-red-500/[0.08] disabled:cursor-not-allowed disabled:bg-[#e0e0e0]/50 disabled:opacity-50 aria-invalid:border-red-500/20 aria-invalid:ring-2 aria-invalid:ring-red-500/[0.08] md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
