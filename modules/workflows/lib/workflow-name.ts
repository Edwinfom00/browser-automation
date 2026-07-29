import {
  adjectives,
  animals,
  colors,
  uniqueNamesGenerator,
} from "unique-names-generator"

import { WORKFLOW_NAME_MAX_LENGTH } from "@/modules/workflows/constants"


export function randomWorkflowName(): string {
  return uniqueNamesGenerator({
    dictionaries: [adjectives, colors, animals],
    separator: "-",
    length: 2,
    style: "lowerCase",
  }).slice(0, WORKFLOW_NAME_MAX_LENGTH)
}


export function normalizeWorkflowName(value: string): string {
  return value.replace(/\s+/g, " ").trim().slice(0, WORKFLOW_NAME_MAX_LENGTH)
}
