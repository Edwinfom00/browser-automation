"use client"

import {
  Handle,
  Position,
  type Node,
  type NodeProps,
  type NodeTypes,
} from "@xyflow/react"

import {
  FlowPreview,
  flowEdge,
  flowNode,
} from "@/components/shared/flow-preview"
import { cn } from "@/lib/utils"
import { PortalPathMark } from "@/modules/auth/ui/components/auth-brand"

const TEAMMATES = [
  { initials: "NK", tone: "bg-emerald-500" },
  { initials: "LP", tone: "bg-blue-600" },
] as const

/* Node geometry — mirrored by the markup below so server and client agree. */
const ORG_SIZE = 84
const MEMBER_SIZE = 42
const COLUMN_GAP = 163
const MEMBER_GAP = 20

type OrgNode = Node<Record<string, never>, "org">

function OrgNode() {
  return (
    <span className="grid size-full place-items-center rounded-2xl bg-violet-600 text-white [&_svg]:size-10">
      <PortalPathMark />
      <Handle
        type="source"
        position={Position.Right}
        className="invisible"
        isConnectable={false}
      />
    </span>
  )
}

type MemberNodeData = { initials: string; tone: string }

type MemberNode = Node<MemberNodeData, "member">

function MemberNode({ data }: NodeProps<MemberNode>) {
  return (
    <span
      className={cn(
        "grid size-full place-items-center rounded-full text-sm font-semibold text-white",
        data.tone
      )}
    >
      {data.initials}
      <Handle
        type="target"
        position={Position.Left}
        className="invisible"
        isConnectable={false}
      />
    </span>
  )
}

const nodeTypes: NodeTypes = { org: OrgNode, member: MemberNode }

const membersHeight =
  TEAMMATES.length * MEMBER_SIZE + (TEAMMATES.length - 1) * MEMBER_GAP

const nodes: Node[] = [
  flowNode<Record<string, never>>({
    id: "org",
    type: "org",
    data: {},
    x: 0,
    y: (membersHeight - ORG_SIZE) / 2,
    width: ORG_SIZE,
    height: ORG_SIZE,
  }),
  ...TEAMMATES.map((teammate, index) =>
    flowNode<MemberNodeData>({
      id: teammate.initials,
      type: "member",
      data: { initials: teammate.initials, tone: teammate.tone },
      x: ORG_SIZE + COLUMN_GAP,
      y: index * (MEMBER_SIZE + MEMBER_GAP),
      width: MEMBER_SIZE,
      height: MEMBER_SIZE,
    })
  ),
]

const edges = TEAMMATES.map((teammate) => flowEdge("org", teammate.initials))

export function OrganizationTeamPreview({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("h-32 w-full max-w-sm select-none", className)}
    >
      <FlowPreview
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        padding={0.08}
        width={340}
        height={128}
      />
    </div>
  )
}
