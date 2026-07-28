import { cn } from "@/lib/utils"

const sizeStyles = {
  sm: "size-9 rounded-[10px] [&_svg]:size-5",
  md: "size-12 rounded-xl [&_svg]:size-7",
} as const

export function PortalPathMark({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 32 32" fill="none" className={className}>
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M6 3h20a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3h-5v5a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3Zm4 9v12h6v-6a2 2 0 0 1 2-2h6v-4H10Z"
        clipRule="evenodd"
      />
      <circle cx="9" cy="7.5" r="1.25" className="fill-violet-600" />
      <circle cx="13" cy="7.5" r="1.25" className="fill-violet-600" />
      <circle cx="17" cy="7.5" r="1.25" className="fill-violet-600" />
    </svg>
  )
}

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
      <PortalPathMark />
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
        className={cn("font-semibold tracking-tight", brandLabelStyles[size])}
      >
        Browser Automation
      </span>
    </div>
  )
}
