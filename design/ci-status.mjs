#!/usr/bin/env node
/**
 * What CI made of the last few pushes, without the GitHub CLI.
 *
 *   node design/ci-status.mjs        # last 5 runs
 *   node design/ci-status.mjs 12     # last 12
 *   node design/ci-status.mjs --jobs # also break the newest run into its jobs
 *
 * WHY THIS EXISTS. `gh` is not installed here and neither is Homebrew, so every
 * claim about a build being green was the pre-push hook's word rather than the
 * runner's — the hook proves the checks pass on this machine, which is not the
 * same statement. Installing a CLI to read four fields is the heavier answer.
 *
 * THE REPO IS PUBLIC, so the Actions API answers unauthenticated. That is the
 * whole trick, and it is also the limit: 60 requests an hour per IP, and
 * nothing here works on a private repo. If this repo is ever made private this
 * script stops working, and the fix then is a token rather than a patch.
 *
 * Reads only. It cannot re-run a job or push anything.
 */
const REPO = 'rohitsehmi/deesyn-portfolio';
const API = `https://api.github.com/repos/${REPO}`;

const args = process.argv.slice(2);
const wantJobs = args.includes('--jobs');
const limit = Number(args.find((a) => /^\d+$/.test(a))) || 5;

async function get(path) {
  const res = await fetch(API + path, {
    headers: { accept: 'application/vnd.github+json', 'user-agent': 'deesyn-ci-status' }
  });
  if (res.status === 403) {
    // The unauthenticated limit is the one failure worth naming precisely,
    // because it looks like a permissions problem and is not.
    const reset = res.headers.get('x-ratelimit-reset');
    const when = reset ? new Date(Number(reset) * 1000).toLocaleTimeString() : 'shortly';
    throw new Error(`GitHub rate limit reached (60/hour, unauthenticated). Resets around ${when}.`);
  }
  if (!res.ok) throw new Error(`${path} -> ${res.status} ${res.statusText}`);
  return res.json();
}

const MARK = { success: '✓', failure: '✗', cancelled: '—', skipped: '·', neutral: '·' };
const secs = (a, b) => (a && b ? Math.round((new Date(b) - new Date(a)) / 1000) + 's' : '');

try {
  const { workflow_runs: runs } = await get(`/actions/runs?per_page=${limit}`);
  if (!runs?.length) {
    console.log('\nno workflow runs found\n');
    process.exit(0);
  }

  console.log('');
  for (const r of runs) {
    const state = r.status === 'completed' ? r.conclusion : r.status;
    const mark = MARK[state] ?? '•';
    const subject = (r.head_commit?.message ?? '').split('\n')[0];
    console.log(
      `  ${mark} ${r.head_sha.slice(0, 7)}  ${String(state).padEnd(11)}` +
      `${secs(r.run_started_at, r.updated_at).padStart(5)}  ${subject.slice(0, 56)}`
    );
  }

  if (wantJobs) {
    const { jobs } = await get(`/actions/runs/${runs[0].id}/jobs`);
    console.log(`\n  ${runs[0].head_sha.slice(0, 7)} jobs:`);
    for (const job of jobs) {
      console.log(`    ${MARK[job.conclusion] ?? '•'} ${job.name.padEnd(22)} ${secs(job.started_at, job.completed_at)}`);
      // Only the steps that did not pass — a green run should print nothing more.
      for (const st of job.steps ?? []) {
        if (st.conclusion && st.conclusion !== 'success') {
          console.log(`        ${MARK[st.conclusion] ?? '•'} ${st.name} -> ${st.conclusion}`);
        }
      }
    }
  }

  const newest = runs[0];
  const bad = newest.status === 'completed' && newest.conclusion !== 'success';
  console.log(`\n  ${bad ? 'newest run is NOT green' : 'newest run is green'}  ·  ${newest.html_url}\n`);
  process.exit(bad ? 1 : 0);
} catch (e) {
  console.error(`\nci-status: ${e.message}\n`);
  process.exit(1);
}