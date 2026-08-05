/**
 * Dev-only in-browser copy editing.
 *
 * Every string the site renders lives in src/copy/*.json. Anything rendered
 * with a `data-copy="<file>:<path>"` attribute becomes editable in the browser
 * while `astro dev` is running; blurring the element writes the new value
 * straight back into the JSON, and Astro's HMR reloads the page from it.
 *
 * Why an integration rather than an API route: this project builds to static
 * output, which prerenders GET and has nowhere to put a POST. Hooking Vite's
 * dev middleware sidesteps that, and gives a stronger guarantee than a runtime
 * flag would — both the endpoint and the client script are added inside
 * `command === 'dev'`, so neither exists in a production build at all rather
 * than existing and being switched off.
 *
 * Writes are deliberately narrow. The endpoint will only touch files inside
 * src/copy, will only replace a string that already exists at the given path,
 * and refuses to create keys. An editor that can invent structure is an editor
 * that can quietly destroy it.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve, sep } from 'node:path';

const ENDPOINT = '/__copy';

function readBody(req) {
  return new Promise((ok, fail) => {
    let raw = '';
    req.on('data', (c) => {
      raw += c;
      if (raw.length > 1e6) { req.destroy(); fail(new Error('body too large')); }
    });
    req.on('end', () => { try { ok(JSON.parse(raw)); } catch (e) { fail(e); } });
    req.on('error', fail);
  });
}

/** Walks `a.0.b` and replaces the leaf. Never creates anything. */
function setAt(obj, path, value) {
  const parts = path.split('.');
  let node = obj;
  for (const key of parts.slice(0, -1)) {
    if (node === null || typeof node !== 'object' || !(key in node)) return { ok: false, reason: `no such path segment: ${key}` };
    node = node[key];
  }
  const leaf = parts[parts.length - 1];
  if (node === null || typeof node !== 'object' || !(leaf in node)) return { ok: false, reason: `no such key: ${leaf}` };
  if (typeof node[leaf] !== 'string') return { ok: false, reason: `not a string: ${path}` };
  const before = node[leaf];
  node[leaf] = value;
  return { ok: true, before };
}

export default function copyEditor() {
  return {
    name: 'copy-editor',
    hooks: {
      'astro:config:setup': ({ command, injectScript, config, updateConfig }) => {
        if (command !== 'dev') return;
        const copyDir = resolve(config.root.pathname ?? config.root, 'src/copy');

        /*
          Keep src/copy out of Vite's watcher.

          Saving writes the JSON, which the watcher sees as a source change and
          answers with a full reload — while you are still working. You lose
          your place, and an edit in progress on the next string can go with it.
          The reload also buys nothing: the text you are looking at is the text
          you just typed, so the page is already correct.

          The cost is the other direction. When the file changes from outside
          the browser — me editing it, or a git checkout — the page will not
          notice. Refresh to pick that up.
        */
        updateConfig({ vite: { server: { watch: { ignored: [join(copyDir, '**')] } } } });

        injectScript('page', `import(${JSON.stringify('/@fs' + resolve(config.root.pathname ?? config.root, 'tools/copy-editor.client.js'))});`);

        // Stash for the server hook below.
        globalThis.__copyDir = copyDir;
      },
      'astro:server:setup': ({ server, logger }) => {
        const copyDir = globalThis.__copyDir;
        if (!copyDir) return;

        server.middlewares.use(ENDPOINT, async (req, res) => {
          if (req.method !== 'POST') { res.statusCode = 405; return res.end('POST only'); }
          const send = (code, body) => {
            res.statusCode = code;
            res.setHeader('content-type', 'application/json');
            res.end(JSON.stringify(body));
          };
          try {
            const { file, path, value } = await readBody(req);
            if (typeof file !== 'string' || typeof path !== 'string' || typeof value !== 'string') {
              return send(400, { ok: false, reason: 'file, path and value must all be strings' });
            }
            // No traversal: the resolved path must still sit inside src/copy.
            const target = resolve(join(copyDir, `${file}.json`));
            if (!target.startsWith(copyDir + sep) || !existsSync(target)) {
              return send(400, { ok: false, reason: `not a copy file: ${file}` });
            }
            const json = JSON.parse(readFileSync(target, 'utf8'));
            const result = setAt(json, path, value);
            if (!result.ok) return send(400, result);

            writeFileSync(target, JSON.stringify(json, null, 2) + '\n');
            logger.info(`copy: ${file}.json ${path}`);
            return send(200, { ok: true, before: result.before });
          } catch (err) {
            return send(400, { ok: false, reason: String(err && err.message ? err.message : err) });
          }
        });
      }
    }
  };
}