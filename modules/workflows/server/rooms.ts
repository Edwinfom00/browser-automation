import { getLiveblocks } from "@/lib/liveblocks"



export async function ensureWorkflowRoom(
  workflowId: string,
  organizationId: string
): Promise<void> {
  await getLiveblocks().getOrCreateRoom(workflowId, {
    defaultAccesses: [],
    groupsAccesses: {
      [organizationId]: ["room:write"],
    },
  })
}
