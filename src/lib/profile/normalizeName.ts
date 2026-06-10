/**
 * Normalize a display name so that variations of the same name
 * ("Alejandro Herrero", "  alejandro  herrero  ", "Álejandro Herrero")
 * all resolve to the same canonical string.
 *
 * Steps: trim → decompose unicode (NFD) → strip combining diacritics →
 *        collapse repeated whitespace → lowercase.
 */
export function normalizeName(name: string): string {
  return name
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .toLowerCase();
}
