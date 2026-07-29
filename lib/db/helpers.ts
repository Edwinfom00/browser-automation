import { timestamp, uuid } from "drizzle-orm/pg-core"


export const id = {
  id: uuid("id").primaryKey().defaultRandom(),
}

export const timestamps = {
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
}
