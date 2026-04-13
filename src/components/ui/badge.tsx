import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-lg border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all duration-200 focus-visible:border-red-500 focus-visible:ring-2 focus-visible:ring-red-500/[0.08] has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-red-500/20 aria-invalid:ring-red-500/[0.08] [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-[#c80000] text-white [a]:hover:bg-[#b10000]",
        secondary:
          "bg-red-500/[0.08] text-[#7b0000] [a]:hover:bg-red-500/[0.12]",
        destructive:
          "border-red-500/20 bg-red-500/[0.06] text-[#c80000] focus-visible:ring-red-500/[0.08] [a]:hover:bg-red-500/[0.12]",
        outline:
          "border-[#e0e0e0] text-[#300000] [a]:hover:bg-red-500/[0.04] [a]:hover:text-[#7b0000]",
        ghost:
          "hover:bg-red-500/[0.04] hover:text-[#7b0000]",
        link: "text-[#c80000] underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
