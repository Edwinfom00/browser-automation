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

export function AuthBrand({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-4", className)}>
      <AuthLogo />
      <span className="text-2xl font-semibold tracking-tight">
        Browser Automation
      </span>
    </div>
  )
}
