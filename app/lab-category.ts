/* The half of the Lab's data that the browser needs. app/lab.ts reads the
   filesystem and cannot be imported by a client component, so the category
   list, the URL shape and the remembered filter live here instead. */

export const CATEGORIES = ["Component", "Pattern", "Motion", "Concept"] as const;

export type Category = (typeof CATEGORIES)[number];

/* The query-string form. Lowercase, so a typed URL does not have to match
   the label's capital. */
export function categoryValue(category: Category): string {
  return category.toLowerCase();
}

/* Anything unrecognised reads as no filter rather than as an empty one —
   a mistyped link should land on the whole Lab, not on "nothing here". */
export function categoryFromValue(value: string | null): Category | null {
  return CATEGORIES.find((category) => categoryValue(category) === value) ?? null;
}

export function labHref(category: Category | null): string {
  return category ? `/lab?category=${categoryValue(category)}` : "/lab";
}

/* The filter an entry's Back link returns to. Kept in sessionStorage rather
   than carried on every entry URL: an entry is one page whichever list it
   was reached from, and a query string on it would say otherwise to anyone
   it was shared with. It survives Newer/Older, which a query would not.

   Storage can be missing or throw — a private window, blocked site data —
   and the only cost of that is Back going to All. */
const STORAGE_KEY = "lab-category";

export function rememberCategory(category: Category | null): void {
  try {
    if (category) {
      sessionStorage.setItem(STORAGE_KEY, categoryValue(category));
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  } catch {}
}

export function rememberedCategory(): Category | null {
  try {
    return categoryFromValue(sessionStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}
