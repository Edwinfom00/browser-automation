"use client"

import { ReactNode } from "react"
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
} from "@liveblocks/react/suspense"

function getPublicApiKey() {
  const key = process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY

  if (!key) {
    throw new Error("Missing NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY")
  }

  return key
}

const publicApiKey = getPublicApiKey()

export function Room({
  roomId,
  children,
}: {
  roomId: string
  children: ReactNode
}) {
  return (
    <LiveblocksProvider throttle={16} publicApiKey={publicApiKey}>
      <RoomProvider id={roomId}>
        <ClientSideSuspense fallback={<div>Loading…</div>}>
          {children}
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  )
}
