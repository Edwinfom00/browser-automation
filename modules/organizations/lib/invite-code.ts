import { INVITE_CODE_LENGTH } from "@/modules/organizations/constants"

const DIGITS = "0123456789"


const UNBIASED_CEILING = 250

const COMPLETE_CODE = new RegExp(`^\\d{${INVITE_CODE_LENGTH}}$`)


export function generateInviteCode(length: number = INVITE_CODE_LENGTH): string {
  let code = ""

  while (code.length < length) {
    const bytes = new Uint8Array(length)
    crypto.getRandomValues(bytes)

    for (const byte of bytes) {
      if (byte >= UNBIASED_CEILING) {
        continue
      }

      code += DIGITS[byte % DIGITS.length]

      if (code.length === length) {
        break
      }
    }
  }

  return code
}


export function normalizeInviteCode(value: string): string {
  return value.replace(/\D/g, "").slice(0, INVITE_CODE_LENGTH)
}

export function isCompleteInviteCode(value: string): boolean {
  return COMPLETE_CODE.test(value)
}


export function formatInviteCode(code: string): string {
  const half = Math.ceil(code.length / 2)

  return `${code.slice(0, half)} ${code.slice(half)}`.trim()
}

export function inviteCodeDigits(code: string, length = INVITE_CODE_LENGTH) {
  return Array.from({ length }, (_, index) => code[index] ?? "")
}
