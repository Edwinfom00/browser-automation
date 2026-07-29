import { Liveblocks } from "@liveblocks/node"

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
