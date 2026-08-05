/**
 * One-off. Run inside Figma (Desktop Bridge plugin console, file "Revolut") to
 * bring the banding spec's `media` key up to date with what the code actually
 * does, then re-export with design/banding-export.snippet.js and paste the
 * result into design/banding-export.json.
 *
 * Why a snippet and not an edit to the JSON: banding-export.json is *measured*
 * off Figma, not authored. Hand-editing it would make the file agree with the
 * code and disagree with the source it claims to be measured from, which is
 * exactly the drift the checksum exists to catch.
 *
 * What changed, 2026-08-05. The spec said content over media "resolves to the
 * dark mode values unconditionally", and that an image "is dark in both"
 * themes. The first half is now only half true and the second was never a
 * property of images in general — it was a property of the one image the rule
 * was written against.
 *
 * Absolute is not the same as dark. A pale image treated as dark still passes
 * AA; it just needs a scrim heavy enough to destroy it, which is a failure no
 * contrast check reports. So there are two tonalities, both emitted
 * unconditionally: `data-on-media` (dark) and `data-on-media="light"`.
 *
 * Idempotent — running it twice leaves the same value.
 */
await figma.loadAllPagesAsync();
const page = figma.root.children.find((p) => p.name === 'Banding');
if (!page) throw new Error('no page named "Banding"');

const raw = page.getSharedPluginData('banding', 'spec');
if (!raw) throw new Error('no banding spec on that page');
const spec = JSON.parse(raw);

const before = JSON.stringify(spec.media);

spec.media = {
  mechanism:
    'content over a full-bleed image carries data-on-media, which resolves to one mode\'s values unconditionally. Two tonalities: data-on-media is the dark default, data-on-media="light" is for a pale image',
  why:
    'bands are relative, so inverse flips with the theme. An image does not, so the foreground over it has to be absolute or it inverts in one of the two themes. Absolute is not the same as dark: treating a pale image as dark still passes AA, but only with a scrim heavy enough to destroy the image, which no contrast check reports',
  tones: {
    dark: 'the default. Emits the dark-mode values, so the foreground is light and bg/scrim is 70% black. The scrim is not optional on a dark photograph',
    light: 'emits the light-mode values, so the foreground is dark and the scrim is off — a black scrim under a dark foreground subtracts contrast rather than adding it'
  },
  contrast:
    'a scrimless hero puts the contrast burden on the composition, so object-position and measure stop being cosmetic. Verified with design/measure-media-contrast.mjs, which measures glyph coverage rather than text bounding boxes and samples across the drift range',
  counted: false,
  note: 'not a band role, and like the hero it does not count toward the alternation'
};

page.setSharedPluginData('banding', 'spec', JSON.stringify(spec));

return {
  changed: before !== JSON.stringify(spec.media),
  before: JSON.parse(before),
  after: spec.media,
  next: 'run design/banding-export.snippet.js, paste its `json` into design/banding-export.json, then re-record the checksum in CLAUDE.md'
};
