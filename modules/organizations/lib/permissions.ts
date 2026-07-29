import { createAccessControl } from "better-auth/plugins/access"
import {
  adminAc,
  defaultStatements,
  memberAc,
  ownerAc,
} from "better-auth/plugins/organization/access"


export const statement = {
  ...defaultStatements,
  workflow: ["create", "update", "delete", "run"],
} as const

export const ac = createAccessControl(statement)

const ownerRole = ac.newRole({
  ...ownerAc.statements,
  workflow: ["create", "update", "delete", "run"],
})

const adminRole = ac.newRole({
  ...adminAc.statements,
  workflow: ["create", "update", "delete", "run"],
})


const memberRole = ac.newRole({
  ...memberAc.statements,
  workflow: ["create", "update", "run"],
})

export const roles = {
  owner: ownerRole,
  admin: adminRole,
  member: memberRole,
}
