import { ORGANIZATION_SLUG_MAX_LENGTH } from "@/modules/organizations/constants"

/**
 * Derives a URL-safe slug from a free-form organization name. Accents are
 * decomposed first so "Café Noir" becomes "cafe-noir" rather than "caf-noir".
 */
export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, ORGANIZATION_SLUG_MAX_LENGTH)
    .replace(/-+$/g, "")
}

/**
 * Same normalisation as {@link slugify}, but keeps a trailing hyphen so the
 * field stays typeable while someone is still writing the next word.
 */
export function normalizeSlugInput(value: string): string {
  const slug = slugify(value)

  const keepTrailingHyphen =
    slug.length > 0 &&
    slug.length < ORGANIZATION_SLUG_MAX_LENGTH &&
    /[^a-z0-9]$/i.test(value)

  return keepTrailingHyphen ? `${slug}-` : slug
}
