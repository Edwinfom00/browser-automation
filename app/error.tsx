"use client"

import { useEffect } from "react"
import Link from "next/link"
import { LuHouse, LuRefreshCw } from "react-icons/lu"

import { SystemState } from "@/components/system-state"
import { Button } from "@/components/ui/button"

export default function ErrorPage({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <>
      <title>Something went wrong | Browser Automation</title>
      <SystemState
        kind="error"
        code="500"
        title="Workflow interrupted."
        description="This page could not finish loading. Retry the step, or return home without changing your saved workflows."
        reference={error.digest}
        actions={
          <>
            <Button
              type="button"
              size="lg"
              className="h-11 rounded-xl px-5"
              onClick={() => unstable_retry()}
            >
              <LuRefreshCw aria-hidden data-icon="inline-start" />
              Try again
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-11 rounded-xl px-5"
            >
              <Link href="/">
                <LuHouse aria-hidden data-icon="inline-start" />
                Return home
              </Link>
            </Button>
          </>
        }
      />
    </>
  )
}
