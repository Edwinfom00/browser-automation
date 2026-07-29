import { relations, sql } from "drizzle-orm"
import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core"

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



export const organizationInviteCodes = pgTable(
  "organization_invite_codes",
  {
    ...id,
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    code: text("code").notNull(),
    role: text("role").notNull().default("member"),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at").notNull(),
    revokedAt: timestamp("revoked_at"),
    usedCount: integer("used_count").notNull().default(0),
    ...timestamps,
  },
  (table) => [
    index("organization_invite_codes_organizationId_idx").on(
      table.organizationId
    ),
    uniqueIndex("organization_invite_codes_code_live_uidx")
      .on(table.code)
      .where(sql`revoked_at is null`),
  ]
)

export const organizationInviteCodesRelations = relations(
  organizationInviteCodes,
  ({ one }) => ({
    organization: one(organization, {
      fields: [organizationInviteCodes.organizationId],
      references: [organization.id],
    }),
    creator: one(user, {
      fields: [organizationInviteCodes.createdBy],
      references: [user.id],
    }),
  })
)

export type OrganizationInviteCode =
  typeof organizationInviteCodes.$inferSelect


export * from "./auth-schema"
