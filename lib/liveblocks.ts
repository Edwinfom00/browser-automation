import { Liveblocks, LiveblocksError } from "@liveblocks/node"

let client: Liveblocks | undefined


export function getLiveblocks() {
  if (!client) {
    if (!process.env.LIVEBLOCKS_SECRET_KEY) {
      throw new Error("LIVEBLOCKS_SECRET_KEY is not set")
    }
    client = new Liveblocks({ secret: process.env.LIVEBLOCKS_SECRET_KEY })
  }
  return client
}



export async function deleteRoom(roomId: string): Promise<void> {
  try {
    await getLiveblocks().deleteRoom(roomId)
  } catch (error) {
    if (error instanceof LiveblocksError && error.status === 404) {
      return
    }

    throw error
  }
}
