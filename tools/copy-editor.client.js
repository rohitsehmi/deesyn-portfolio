/**
 * The browser half of the dev-only copy editor. Injected by tools/copy-editor.mjs
 * and only while `astro dev` is running.
 *
 * Off by default. Nothing on the page behaves differently until you turn it on,
 * because a site where every paragraph is a text field is a site you cannot
 * read — and reading it is how you judge the voice.
 */
const KEY = 'copy-edit-on';
const state = { on: sessionStorage.getItem(KEY) === '1' };

const style = document.createElement('style');
style.textContent = `
  .copy-edit-bar {
    position: fixed; inset-inline-start: 16px; inset-block-end: 16px; z-index: 2147483647;
    display: inline-flex; align-items: center; gap: 8px;
    padding: 8px 14px; border-radius: 999px; border: 0;
    font: 500 13px/1 ui-sans-serif, system-ui, sans-serif;
    background: #191c1f; color: #fff; cursor: pointer;
    box-shadow: 0 2px 12px rgb(0 0 0 / 0.25);
  }
  .copy-edit-bar[data-on='true'] { background: #0666eb; }
  .copy-edit-bar__dot { width: 7px; height: 7px; border-radius: 50%; background: currentColor; opacity: .5; }
  .copy-edit-bar[data-on='true'] .copy-edit-bar__dot { opacity: 1; }

  [data-copy][contenteditable] {
    outline: 1px dashed rgb(6 102 235 / .5); outline-offset: 3px; border-radius: 2px;
  }
  [data-copy][contenteditable]:focus { outline: 2px solid #0666eb; outline-offset: 3px; }
  [data-copy][data-copy-state='saving'] { outline-color: #b4870a; }
  [data-copy][data-copy-state='saved']  { outline-color: #128a4c; }
  [data-copy][data-copy-state='error']  { outline: 2px solid #d3232f; }

  .copy-edit-toast {
    position: fixed; inset-inline-start: 16px; inset-block-end: 64px; z-index: 2147483647;
    max-width: 34ch; padding: 10px 12px; border-radius: 8px;
    font: 400 12px/1.4 ui-sans-serif, system-ui, sans-serif;
    background: #d3232f; color: #fff;
  }
`;
document.head.append(style);

const bar = document.createElement('button');
bar.className = 'copy-edit-bar';
bar.type = 'button';
document.body.append(bar);

let toast;
function say(message) {
  toast?.remove();
  if (!message) return;
  toast = document.createElement('div');
  toast.className = 'copy-edit-toast';
  toast.textContent = message;
  document.body.append(toast);
  setTimeout(() => toast?.remove(), 6000);
}

function targets() {
  return [...document.querySelectorAll('[data-copy]')];
}

function render() {
  bar.dataset.on = String(state.on);
  bar.innerHTML = `<span class="copy-edit-bar__dot"></span>Copy edit ${state.on ? 'on' : 'off'} <span style="opacity:.6">⌥E</span>`;
  for (const el of targets()) {
    if (state.on) {
      el.setAttribute('contenteditable', 'plaintext-only');
      el.spellcheck = true;
    } else {
      el.removeAttribute('contenteditable');
      el.removeAttribute('data-copy-state');
    }
  }
}

async function save(el) {
  const ref = el.getAttribute('data-copy');
  const [file, path] = ref.split(':');
  const value = el.innerText.replace(/ /g, ' ').trim();
  if (value === el.dataset.copyOriginal) return;

  el.dataset.copyState = 'saving';
  try {
    const res = await fetch('/__copy', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ file, path, value })
    });
    const body = await res.json();
    if (!res.ok || !body.ok) throw new Error(body.reason || `HTTP ${res.status}`);
    el.dataset.copyOriginal = value;
    el.dataset.copyState = 'saved';
    say('');
    setTimeout(() => { if (el.dataset.copyState === 'saved') delete el.dataset.copyState; }, 1200);
  } catch (err) {
    el.dataset.copyState = 'error';
    // Loud on purpose: a silent failure here means you keep typing into
    // something that is not being kept.
    say(`Not saved — ${err.message}. ${ref}`);
  }
}

document.addEventListener('focusin', (e) => {
  const el = e.target.closest?.('[data-copy][contenteditable]');
  if (el) el.dataset.copyOriginal = el.innerText.replace(/ /g, ' ').trim();
});
document.addEventListener('focusout', (e) => {
  const el = e.target.closest?.('[data-copy][contenteditable]');
  if (el) save(el);
});
// Enter commits rather than inserting a newline: these are single strings, and
// a stray line break in JSON is a change nobody meant to make.
document.addEventListener('keydown', (e) => {
  if (e.altKey && (e.key === 'e' || e.key === 'E')) {
    state.on = !state.on;
    sessionStorage.setItem(KEY, state.on ? '1' : '0');
    render();
    return;
  }
  const el = e.target.closest?.('[data-copy][contenteditable]');
  if (el && e.key === 'Enter') { e.preventDefault(); el.blur(); }
  if (el && e.key === 'Escape') {
    el.innerText = el.dataset.copyOriginal ?? el.innerText;
    el.blur();
  }
});

bar.addEventListener('click', () => {
  state.on = !state.on;
  sessionStorage.setItem(KEY, state.on ? '1' : '0');
  render();
});

render();
console.info(`[copy-editor] ${targets().length} editable strings on this page. Alt+E to toggle.`);