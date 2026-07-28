import type { ReactNode } from "react"

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { cn } from "@/lib/utils"

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  ...props
}: Omit<React.ComponentProps<typeof Empty>, "title"> & {
  icon?: ReactNode
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
}) {
  return (
    <Empty className={cn("gap-6", className)} {...props}>
      <EmptyHeader className="gap-3">
        {icon ? (
          <EmptyMedia
            variant="icon"
            className="size-12 rounded-xl [&_svg:not([class*='size-'])]:size-6"
          >
            {icon}
          </EmptyMedia>
        ) : null}

        <EmptyTitle className="text-xl">{title}</EmptyTitle>

        {description ? (
          <EmptyDescription className="text-base/relaxed">
            {description}
          </EmptyDescription>
        ) : null}
      </EmptyHeader>

      {action ? <EmptyContent>{action}</EmptyContent> : null}
    </Empty>
  )
}
