/**
 * Which brands this build serves, in one place.
 *
 * One prerendered build answers every *.deesyn.com hostname, so the brand is a
 * runtime fact rather than a build-time one: a blocking inline script in
 * Base.astro reads it off `location.hostname` and sets `[data-brand]` on the
 * root before the first paint, and the rules at the foot of src/styles/base.css
 * hide whichever `[data-brand-only]` version does not belong to it.
 *
 * This file is the TypeScript half of that. It exists so anything deciding what
 * a brand gets — which case studies appear, which study follows which — states
 * it once and against a checked type, instead of a `'wise'` string literal
 * spreading through the data layer the way it already has through the CSS, the
 * inline script and the Logo component. Those three cannot import it: two are
 * CSS and one is an inline script that must not pull in a module. Adding a
 * brand therefore still means touching them by hand, and this list is where to
 * start reading.
 *
 * A `.ts` in src/data rather than a component, deliberately, for the same
 * reason as nav.ts, reading-time.ts and analytics.ts: the component count on
 * /how-this-was-built is computed by counting `.tsx` files and
 * build-code-specs.mjs writes a contract for each one. This is data, not a
 * component, and must move neither number.
 */
export const BRANDS = ['revolut', 'wise', 'healf'] as const;

export type Brand = (typeof BRANDS)[number];

/**
 * The brand with no `[data-brand]` attribute, which is what www, the apex, any
 * unrecognised subdomain and a client running no JavaScript all resolve to. It
 * is a default in the strong sense: nothing has to work for it to be chosen,
 * which is why it is the one that must never be brand-gated.
 */
export const DEFAULT_BRAND: Brand = 'revolut';