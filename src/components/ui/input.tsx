import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-8 w-full min-w-0 rounded-xl border border-[#e0e0e0] bg-white/60 backdrop-blur-sm px-2.5 py-1 text-base text-[#300000] transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[#300000] placeholder:text-[#bbbbbb] focus:border-red-500 focus:ring-2 focus:ring-red-500/[0.08] disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-[#e0e0e0]/50 disabled:opacity-50 aria-invalid:border-red-500/20 aria-invalid:ring-2 aria-invalid:ring-red-500/[0.08] md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Input }
