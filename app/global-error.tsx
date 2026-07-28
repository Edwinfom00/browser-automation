"use client"

import { useEffect, useSyncExternalStore } from "react"
import Link from "next/link"
import { LuHouse, LuRefreshCw } from "react-icons/lu"

import "./globals.css"
import { SystemState } from "@/components/system-state"
import { Button } from "@/components/ui/button"

const systemThemeQuery = "(prefers-color-scheme: dark)"

function getThemeSnapshot() {
  const selectedTheme = window.localStorage.getItem("theme")

  if (selectedTheme === "dark") {
    return "dark"
  }

  if (selectedTheme === "light") {
    return ""
  }

  return window.matchMedia(systemThemeQuery).matches ? "dark" : ""
}

function getServerThemeSnapshot() {
  return ""
}

function subscribeToTheme(onStoreChange: () => void) {
  const mediaQuery = window.matchMedia(systemThemeQuery)

  mediaQuery.addEventListener("change", onStoreChange)
  window.addEventListener("storage", onStoreChange)

  return () => {
    mediaQuery.removeEventListener("change", onStoreChange)
    window.removeEventListener("storage", onStoreChange)
  }
}

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  const themeClassName = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getServerThemeSnapshot
  )

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html
      lang="en"
      className={themeClassName || undefined}
      suppressHydrationWarning
    >
      <body
        className="font-sans antialiased"
        style={
          {
            "--font-sans":
              "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          } as React.CSSProperties
        }
      >
        <title>Something went wrong | Browser Automation</title>
        <SystemState
          kind="error"
          code="500"
          title="The workspace could not start."
          description="A system error stopped the app from loading. Try again, or return home and start a fresh request."
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
      </body>
    </html>
  )
}
