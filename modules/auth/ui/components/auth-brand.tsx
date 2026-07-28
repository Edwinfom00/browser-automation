import { LuPanelsTopLeft } from "react-icons/lu"

import { cn } from "@/lib/utils"

const sizeStyles = {
  sm: "size-9 rounded-[10px] [&_svg]:size-4.5",
  md: "size-12 rounded-xl [&_svg]:size-6",
} as const

export function AuthLogo({
  size = "md",
  className,
}: {
  size?: keyof typeof sizeStyles
  className?: string
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid shrink-0 place-items-center bg-violet-600 text-white shadow-lg shadow-violet-600/20",
        sizeStyles[size],
        className
      )}
    >
      <LuPanelsTopLeft />
    </span>
  )
}

const brandLabelStyles = {
  sm: "text-lg",
  md: "text-2xl",
} as const

export function AuthBrand({
  size = "md",
  className,
}: {
  size?: keyof typeof sizeStyles
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex items-center",
        size === "sm" ? "gap-3" : "gap-4",
        className
      )}
    >
      <AuthLogo size={size} />
      <span
        className={cn(
          "font-semibold tracking-tight",
          brandLabelStyles[size]
        )}
      >
        Browser Automation
      </span>
    </div>
  )
}
