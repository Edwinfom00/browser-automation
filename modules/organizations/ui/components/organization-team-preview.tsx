import { LuBuilding2 } from "react-icons/lu"

import { cn } from "@/lib/utils"

const TEAMMATES = [
  { initials: "NK", tone: "bg-emerald-500" },
  { initials: "LP", tone: "bg-blue-600" },
] as const


export function OrganizationTeamPreview({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("flex items-center select-none", className)}>
      <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-violet-600 text-white [&_svg]:size-7">
        <LuBuilding2 />
      </span>

      <span className="h-px w-8 bg-border" />

      <span className="flex flex-col justify-center">
        {TEAMMATES.map((teammate, index) => (
          <span key={teammate.initials} className="flex items-center">
            <span
              className={cn(
                "h-6 w-8 border-border",
                index === 0
                  ? "self-end rounded-tl-lg border-t border-l"
                  : "self-start rounded-bl-lg border-b border-l"
              )}
            />
            <span
              className={cn(
                "grid size-9 shrink-0 place-items-center rounded-full text-xs font-semibold text-white",
                teammate.tone
              )}
            >
              {teammate.initials}
            </span>
          </span>
        ))}
      </span>
    </div>
  )
}
