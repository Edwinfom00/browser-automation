import { chromium, type Page } from "playwright-core"
import Steel from "steel-sdk"

const STEEL_CONNECT_ENDPOINT = "wss://connect.steel.dev"

export const DEFAULT_SESSION_TIMEOUT_MS = 10 * 60 * 1000

export type SteelSession = {
  id: string
  page: Page
  liveViewUrl: string
  viewerUrl: string
  close: () => Promise<void>
}

export type OpenSteelSessionOptions = {
  timeoutMs?: number
}

function requireApiKey(): string {
  const steelAPIKey = process.env.STEEL_API_KEY

  if (!steelAPIKey) {
    throw new Error(
      "STEEL_API_KEY is required — get one at https://app.steel.dev/settings/api-keys"
    )
  }

  return steelAPIKey
}

export function createSteelClient(): Steel {
  return new Steel({ steelAPIKey: requireApiKey() })
}

export async function openSteelSession(
  options: OpenSteelSessionOptions = {}
): Promise<SteelSession> {
  const steelAPIKey = requireApiKey()
  const client = new Steel({ steelAPIKey })

  const session = await client.sessions.create({
    timeout: options.timeoutMs ?? DEFAULT_SESSION_TIMEOUT_MS,
  })

  const cdpUrl = `${STEEL_CONNECT_ENDPOINT}?apiKey=${steelAPIKey}&sessionId=${session.id}`

  const browser = await chromium.connectOverCDP(cdpUrl).catch(async (error) => {
    await client.sessions.release(session.id).catch(() => {})
    throw error
  })

  const context = browser.contexts()[0]
  const page = context.pages()[0] ?? (await context.newPage())

  let closed = false

  return {
    id: session.id,
    page,
    liveViewUrl: session.debugUrl,
    viewerUrl: session.sessionViewerUrl,
    close: async () => {
      if (closed) {
        return
      }

      closed = true

      try {
        await browser.close()
      } catch (error) {
        console.warn("Steel: closing the browser failed", error)
      }

      try {
        await client.sessions.release(session.id)
      } catch (error) {
        console.warn("Steel: releasing the session failed", error)
      }
    },
  }
}

export async function withSteelSession<T>(
  run: (session: SteelSession) => Promise<T>,
  options: OpenSteelSessionOptions = {}
): Promise<T> {
  const session = await openSteelSession(options)

  try {
    return await run(session)
  } finally {
    await session.close()
  }
}
