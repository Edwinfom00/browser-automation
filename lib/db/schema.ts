import { relations } from "drizzle-orm"
import { index, jsonb, pgTable, text } from "drizzle-orm/pg-core"

import { invitation, member, organization, user } from "./auth-schema"
import { id, timestamps } from "./helpers"


export type User = typeof user.$inferSelect
export type Organization = typeof organization.$inferSelect
export type Member = typeof member.$inferSelect
export type Invitation = typeof invitation.$inferSelect


export type WorkflowGraph = {
  nodes: Array<{
    id: string
    type: string
    position: { x: number; y: number }
    data?: Record<string, unknown>
  }>
  edges: Array<{
    id: string
    source: string
    target: string
    sourceHandle?: string | null
    targetHandle?: string | null
  }>
}

export const workflows = pgTable(
  "workflows",
  {
    ...id,
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    graph: jsonb("graph").$type<WorkflowGraph>(),
    ...timestamps,
  },
  (table) => [
    index("workflows_organizationId_idx").on(table.organizationId),
    index("workflows_updatedAt_idx").on(table.updatedAt),
  ],
)

export const workflowsRelations = relations(workflows, ({ one }) => ({
  organization: one(organization, {
    fields: [workflows.organizationId],
    references: [organization.id],
  }),
}))

export type Workflow = typeof workflows.$inferSelect
export type NewWorkflow = typeof workflows.$inferInsert


export * from "./auth-schema"
