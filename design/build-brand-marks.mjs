/**
 * Fetches the three EGDS brands' real marks from their own favicons.
 *
 *   node design/build-brand-marks.mjs
 *
 * Why this exists
 * ---------------
 * The token-tiers diagram used to draw each brand as an initial in a coloured
 * disc, which was a deliberate second-best: the repo already holds the rule, in
 * build-service-marks.mjs, that a hand-traced logo is a wrong logo, and someone
 * else's mark is the one place "close enough" is a real problem. Simple Icons
 * carries Expedia and Hotels.com and does not carry Vrbo, so a faithful set was
 * unavailable there and a mixed one would have read as an oversight.
 *
 * A favicon is the way out. It is the mark each company publishes at its own
 * root for exactly this purpose, so it is real, current, and fetched rather
 * than redrawn. Same rule as the service marks and the same one the whole repo
 * is built on: measure the live thing, do not trust a copy of it.
 *
 * NOT part of `npm run specs`, and not in the gate, for the same two reasons
 * build-service-marks.mjs is not: it needs the network, and a check that goes
 * red on a train is one people learn to skip. These change roughly never.
 *
 * Provenance: third-party trademarks, used to identify the products the case
 * study is about. Recorded here rather than in design/asset-provenance.json,
 * which covers src/assets — this emits a .ts, deliberately, so that it moves
 * neither the component count nor the contract count. Same reason
 * service-marks.ts and analytics.ts are .ts files.
 */
import { writeFileSync } from 'node:fs';
import sharp from 'sharp';

const SOURCES = [
  { name: 'Expedia', url: 'https://www.expedia.com/favicon.ico' },
  { name: 'Hotels.com', url: 'https://www.hotels.com/favicon.ico' },
  { name: 'Vrbo', url: 'https://www.vrbo.com/favicon.ico' }
];

/** Rendered at 40px, so 96 covers a 2x screen with a little to spare. */
const MAX = 96;
const OUT = 'src/data/egds-brand-marks.ts';
const PNG_SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47]);

/**
 * The largest frame in an .ico, as something sharp can open.
 *
 * An .ico is a directory of frames and the frames are not all one format: the
 * big ones are usually an embedded PNG, and the small ones are usually a raw
 * DIB left over from the Windows icon format. Expedia serves 16/32/48 as DIBs;
 * Hotels.com and Vrbo go up to 256 as PNG. So both paths are real and both are
 * handled, rather than assuming the common case and failing on one brand.
 */
function largestFrame(buf) {
  if (buf.readUInt16LE(0) !== 0 || buf.readUInt16LE(2) !== 1) throw new Error('not an .ico');
  const count = buf.readUInt16LE(4);
  let best = null;
  for (let i = 0; i < count; i++) {
    const e = 6 + i * 16;
    // A zero byte means 256: the field is one byte and 256 does not fit in it.
    const w = buf.readUInt8(e) || 256;
    const h = buf.readUInt8(e + 1) || 256;
    const entry = { w, h, bpp: buf.readUInt16LE(e + 6), size: buf.readUInt32LE(e + 8), off: buf.readUInt32LE(e + 12) };
    if (!best || entry.w * entry.h > best.w * best.h) best = entry;
  }
  const data = buf.subarray(best.off, best.off + best.size);
  if (data.subarray(0, 4).equals(PNG_SIG)) return { input: sharp(data), source: `${best.w}px PNG` };

  /*
    A DIB, so decode it here. The header claims DOUBLE the real height, because
    the format stacks a colour image and a 1-bit transparency mask in one bitmap
    and reports the pair. Rows are stored bottom-up and channels are BGRA, so
    both are reversed on the way out. Only 32-bit is handled: every icon in the
    wild at this size is 32-bit, and guessing at a palette format would be a
    quiet way to emit a wrong mark rather than an error.
  */
  const headerSize = data.readUInt32LE(0);
  const width = data.readInt32LE(4);
  const height = data.readInt32LE(8) / 2;
  const bpp = data.readUInt16LE(14);
  if (bpp !== 32) throw new Error(`${best.w}px frame is ${bpp}-bit; only 32-bit DIB frames are decoded`);
  const px = data.subarray(headerSize);
  const rgba = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const s = ((height - 1 - y) * width + x) * 4;
      const d = (y * width + x) * 4;
      rgba[d] = px[s + 2]; rgba[d + 1] = px[s + 1]; rgba[d + 2] = px[s]; rgba[d + 3] = px[s + 3];
    }
  }
  return {
    input: sharp(rgba, { raw: { width, height, channels: 4 } }),
    source: `${best.w}px DIB`
  };
}

const marks = [];
for (const { name, url } of SOURCES) {
  const res = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0' } });
  if (!res.ok) throw new Error(`${name}: ${res.status} from ${url}`);
  const { input, source } = largestFrame(Buffer.from(await res.arrayBuffer()));
  const png = await input
    .resize(MAX, MAX, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9, palette: true })
    .toBuffer();
  marks.push({ name, uri: `data:image/png;base64,${png.toString('base64')}`, source, bytes: png.length });
  console.log(`${name.padEnd(11)} ${source.padEnd(11)} -> ${png.length}B`);
}

const body = `/**
 * GENERATED by design/build-brand-marks.mjs. Do not edit.
 *
 * Each brand's own favicon, fetched from its own root and embedded as a data
 * URI. Real marks rather than traced ones, for the reason build-service-marks
 * states: someone else's logo is the one place "close enough" is a real problem.
 *
 * A .ts and not a .tsx, deliberately. The component count on /how-this-was-built
 * counts .tsx files and build-code-specs.mjs writes a contract for each one; a
 * brand mark is an asset rather than a component and must move neither number.
 *
 * Third-party trademarks, used to identify the products the case study is about.
 *
 * Sources, and the frame taken from each:
${marks.map((m) => ` *   ${m.name.padEnd(11)} ${m.source}`).join('\n')}
 */
export const EGDS_BRAND_MARKS: Record<string, string> = {
${marks.map((m) => `  ${JSON.stringify(m.name)}: '${m.uri}'`).join(',\n')}
};
`;
writeFileSync(OUT, body);
console.log(`\n${OUT} written, ${(body.length / 1024).toFixed(1)}kB`);
