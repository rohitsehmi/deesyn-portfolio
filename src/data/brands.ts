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
export const BRANDS = ['deesyn', 'wise', 'healf', 'ticketmaster', 'asos', 'spotify'] as const;

export type Brand = (typeof BRANDS)[number];

/**
 * The brand with no `[data-brand]` attribute, which is what www, the apex, any
 * unrecognised subdomain and a client running no JavaScript all resolve to. It
 * is a default in the strong sense: nothing has to work for it to be chosen,
 * which is why it is the one that must never be brand-gated.
 *
 * IT NAMES NO COMPANY, since 2026-08-26, and that is the point of it rather
 * than a gap waiting to be filled. `revolut` held this slot until then, so the
 * one hostname anybody reaches by typing the address rendered another
 * company's logotype in its chrome and their name in its first sentence. An
 * `x` lockup conventionally reads as a partnership; on a targeted subdomain
 * sent to a named person that says the right thing, and on the open apex it
 * implies an engagement that does not exist. The apex now carries the mark
 * alone and the lockup survives only where it was aimed at somebody.
 *
 * REVOLUT WAS DEMOTED TO AN ORDINARY PARTNER ON 2026-08-26 AND RETIRED
 * OUTRIGHT ON 2026-09-01, and those are two different edits made for two
 * different reasons. The demotion was about what the apex says to a stranger:
 * making the default generic is not the same as retiring a partner, and an
 * earlier attempt conflated them, took `revolut.deesyn.com` down to a 307 as a
 * side effect, and had to be reverted. The retirement is the deliberate
 * version of that same removal — Revolut turned the work down, so the one
 * hostname addressed to them has nobody left to address. The lockup was aimed
 * at a reader who is no longer going to see it.
 *
 * What that does NOT do is unpick the study underneath. The 249 tokens still
 * reconstruct Revolut's public brand values from their live CSS and the 15
 * icons are still their assets verbatim, exactly as before; neither is
 * attributed anywhere a reader sees, and both were already unnamed on the page.
 * Retiring the hostname stops the site ADDRESSING them. It does not stop the
 * site being BUILT from a study of them, and that remains a deliberate scope
 * decision rather than an oversight.
 *
 * So this is the only brand with no partner logotype, and PartnerBrand below
 * is what makes that a checked fact rather than a convention.
 *
 * `deesyn` is ALSO declared by tokens/brands/portfolio.json's ancestor comment
 * as a palette reference, and it is deliberately not in that pack's `brands`
 * list: a pack emits `:root[data-brand=x]`, this brand never carries the
 * attribute, and a rule that can never match is worse than no rule because it
 * reads as a theme somebody is getting.
 */
export const DEFAULT_BRAND = 'deesyn' as const satisfies Brand;

/**
 * Every brand except the default, which is the set that needs its own partner
 * logotype, its own hero copy and its own row in the CSS.
 *
 * `as const satisfies Brand` above rather than `: Brand` is what makes this
 * resolvable: annotating the constant widens it back to the whole union, so
 * Exclude<Brand, typeof DEFAULT_BRAND> would come out `never` and every map
 * keyed by it would accept anything. It is a one-word difference that turns a
 * type into a check.
 *
 * PARTNER_WORDMARKS is keyed by this, so adding a brand above without drawing
 * its logotype is a typecheck failure rather than an undefined path that
 * renders as a lockup with nothing after the `x`.
 *
 * It is also what the `x` glyph itself is gated on, since the default brand
 * stopped having a partner: the glyph belongs to the lockup, not to the mark,
 * and deriving its `data-brand-only` list from here is what stops a sixth
 * brand arriving to find the `x` hidden on its own hostname.
 */
export type PartnerBrand = Exclude<Brand, typeof DEFAULT_BRAND>;
/**
 * The same set at runtime, in the order BRANDS declares them.
 *
 * It exists because the `x` glyph in the lockup has to be hidden on the one
 * brand that has nothing to its right, and `data-brand-only` is a string of
 * whitespace-separated brand names rather than a type. Derived rather than
 * typed out, for the reason every other count on this site is derived: a list
 * that has to be edited in step with BRANDS is a list that will not be.
 */
export const PARTNER_BRANDS = BRANDS.filter(
  (b): b is PartnerBrand => b !== DEFAULT_BRAND
);
