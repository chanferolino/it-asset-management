import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 cursor-pointer items-center justify-center rounded-xl border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all duration-200 outline-none select-none focus-visible:border-red-500 focus-visible:ring-2 focus-visible:ring-red-500/[0.08] active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-red-500/20 aria-invalid:ring-2 aria-invalid:ring-red-500/[0.08] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-[#c80000] text-white hover:bg-[#b10000] active:bg-[#7b0000] active:scale-[0.98]",
        outline:
          "border-[#e0e0e0] bg-transparent text-[#7b0000] hover:bg-red-500/[0.04] hover:border-[#c80000] aria-expanded:bg-red-500/[0.08] aria-expanded:text-[#c80000]",
        secondary:
          "bg-red-500/[0.08] text-[#7b0000] hover:bg-red-500/[0.12] aria-expanded:bg-red-500/[0.08] aria-expanded:text-[#c80000]",
        ghost:
          "hover:bg-red-500/[0.04] hover:text-[#7b0000] aria-expanded:bg-red-500/[0.08] aria-expanded:text-[#c80000]",
        destructive:
          "border-red-500/20 bg-red-500/[0.06] text-[#c80000] hover:bg-red-500/[0.12] focus-visible:border-red-500/40 focus-visible:ring-red-500/[0.08]",
        link: "text-[#c80000] underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        icon: "size-8",
        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
