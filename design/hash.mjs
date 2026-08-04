/**
 * The checksum used across every export in this repo, so a number printed by
 * one script means the same thing as a number printed by another, and so the
 * Figma-side snippets can reproduce it.
 *
 * FNV-style 32-bit rolling hash over a canonical string. Deliberately simple:
 * it has to be reimplementable inside a Figma plugin sandbox in four lines.
 * Do not change it without re-recording every checksum in CLAUDE.md.
 */
export function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(h, 31) + str.charCodeAt(i)) >>> 0;
  return h;
}
