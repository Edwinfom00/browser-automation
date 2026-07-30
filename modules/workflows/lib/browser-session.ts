import { logger, metadata } from "@trigger.dev/sdk"
import type { Page } from "playwright-core"

import { openSteelSession, type SteelSession } from "@/lib/steel"

export type WorkflowBrowser = {
  page: () => Promise<Page>
  release: () => Promise<void>
}

export function createWorkflowBrowser(
  options: { timeoutMs?: number } = {}
): WorkflowBrowser {
  let opening: Promise<SteelSession> | null = null
  let announced = false

  function session(): Promise<SteelSession> {
    if (!opening) {
      opening = openSteelSession({ timeoutMs: options.timeoutMs })

      opening.catch(() => {
        opening = null
      })
    }

    return opening
  }

  return {
    page: async () => {
      const opened = await session()

      if (!announced) {
        announced = true

        logger.log("Steel session open", {
          sessionId: opened.id,
          liveViewUrl: opened.liveViewUrl,
        })

        metadata
          .set("browserSessionId", opened.id)
          .set("liveViewUrl", opened.liveViewUrl)
      }

      return opened.page
    },

    release: async () => {
      if (!opening) {
        return
      }

      const opened = await opening.catch(() => null)
      opening = null

      if (opened) {
        await opened.close()
        logger.log("Steel session released", { sessionId: opened.id })
      }
    },
  }
}
