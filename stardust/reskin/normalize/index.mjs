import { DEFAULT_NORMALIZE, DEFAULT_LEDGER } from '../../scripts/reskin/source-normalize.mjs';

export const LEDGER = [
  ...DEFAULT_LEDGER,
  {
    id: 'N1',
    what: 'flatten the scroll-choreography stage: scroll every .sc-group/.sc-layer into view once so lazily-built blocks (chapters.migrate, install) decorate, then force every parked/waiting layer visible (visibility/opacity/display) and settle reveal/scramble animations',
    why: 'the live page parks off-screen layers with visibility:hidden, so innerText depends on scroll position (3168 chars at load, 848–3729 while scrolling); un-parking gives a deterministic reading-order reference with every authored chapter present. Presentation-only — no node is removed',
  },
  {
    id: 'N2',
    what: 'remove scroll-rail chrome: .sc-rail, .rail-overlay, .lane-tab, .lane-in, .sc-probe',
    why: 'progress-rail decoration that duplicates the chapter names ("REDESIGN", "Migrate as is") as a scroll indicator — duplication, not content',
  },
  {
    id: 'N3',
    what: 'finish the install terminal typewriter by clicking its own [data-skip] control (the block removes the skip button and writes the full script)',
    why: 'the terminal types the authored script at random 14–54ms per key on reveal — innerText is time-dependent mid-typing; skip is the block\'s own deterministic end state. The "skip" label is transient UI, not content',
  },
  {
    id: 'N4',
    what: 'remove the hero version tag (.hero .ver — "v0.20.0")',
    why: 'USER-REQUESTED CONTENT REMOVAL (2026-10-11, "remove the version above the H1"). Not chrome — an explicit owner decision, recorded here so capture and gate exclude it identically',
  },
  {
    id: 'N5',
    what: 'remove the spotlight route diagram (.spotlight .spot-media — labels: extract direct prototype migrate replica deploy rollout)',
    why: 'USER-REQUESTED CONTENT REMOVAL (2026-10-11, "Two ways in." section: remove the route diagram). Owner decision; capture and gate exclude it identically',
  },
  {
    id: 'N6',
    what: 'remove the hero wordmark text (.hero .hero-word — "stardust")',
    why: 'USER-REQUESTED CONTENT REMOVAL (2026-10-11, "remove the stardust chip above the H1 to make more space for the demo"). The brand stays in the nav; capture and gate exclude it identically',
  },
  {
    id: 'N7',
    what: 'remove the chapter intro titles (.chapters .sc-title — "Redesign", "Migrate as is") next to their [TAB] labels',
    why: 'USER-REQUESTED CONTENT REMOVAL (2026-10-11, "just say REDESIGN in square brackets"); applied to both chapter intros for consistency. The tab label carries the same word',
  },
  {
    id: 'N8',
    what: 'remove the hero scroll link (.hero .scroll — "SCROLL")',
    why: 'USER-REQUESTED CONTENT REMOVAL (2026-10-12, "remove SCROLL which is useless"). Owner decision',
  },
  {
    id: 'N9',
    what: 'COPY EDIT of the hero kicker first line: "Takes a website. Brings it back" -> "Takes a website & brings it back," (rev 17 wording; only when the old string is present)',
    why: 'USER-REQUESTED COPY CHANGE (2026-10-12). Not yet on the live source: until the stardust.style hero is re-authored, the live page still reads the old line. Guarded, so it becomes a no-op once the source carries the new copy',
  },
  {
    id: 'N10',
    what: 'remove the install credit line (.install .credit — "Built on impeccable.")',
    why: 'USER-REQUESTED CONTENT REMOVAL (2026-10-12, "remove mentions that stardust is built on impeccable — that has been reducing over time"). Owner decision',
  },
  {
    id: 'N11',
    what: 'remove the impeccable lines from the install terminal (.install .terminal pre span containing "impeccable": the marketplace add, the install command, and the "installed impeccable · design craft" reply)',
    why: 'USER-REQUESTED CONTENT REMOVAL (2026-10-12, "remove impeccable from the install demo too"). Runs after N3 finished the typewriter. Owner decision',
  },
  {
    id: 'N12',
    what: 'COPY EDIT of the install heading second line: "Then ask it." -> "Docs included." (guarded on the old string)',
    why: 'USER-REQUESTED COPY CHANGE (2026-10-12): heading becomes "Install it. Docs included." Not on the live source until re-authored',
  },
  {
    id: 'N13',
    what: 'COPY EDIT of the install lede -> "Stardust is a set of AI skills. Install it, then say what you want in your own words." (guarded on the exact old paragraph)',
    why: 'USER-REQUESTED COPY CHANGE (2026-10-12); drops the impeccable/Playwright dependency sentence and "Slash commands are optional." Not on the live source until re-authored',
  },
  {
    id: 'N14',
    what: 'COPY EDIT of the "Two ways in." lede: drop the trailing sentence " Or open a door yourself." (guarded on the exact old paragraph)',
    why: 'USER-REQUESTED COPY CHANGE (2026-10-12). Not on the live source until re-authored',
  },
  {
    id: 'N15',
    what: 'CONTENT ADDITION in the "Migrate as is" door: clone the Redesign door\'s Shortcut label + command paragraphs and set the command to "/stardust:replica <url>", inserted before "Follow the migration"',
    why: 'USER-REQUESTED ADDITION (2026-10-12, "put a shortcut like in the redesign box: /stardust:replica <url>"). Cloned from the source\'s own elements so markup/casing match. Not on the live source until re-authored',
  },
];

export const NORMALIZE = `${DEFAULT_NORMALIZE};(async () => {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  // N1 — visit every choreographed layer so lazy blocks decorate, then un-park.
  const H = () => document.documentElement.scrollHeight;
  for (let y = 0; y < H(); y += 300) { window.scrollTo(0, y); await wait(60); }
  window.scrollTo(0, H()); await wait(800);
  window.scrollTo(0, 0); await wait(800);
  const st = document.createElement('style');
  st.dataset.reskinNormalize = 'N1';
  st.textContent = 'main .sc-layer, main .parked, main .waiting, main [data-reveal], main .sc-group, main .stack, main .chapter { visibility: visible !important; opacity: 1 !important; } main .sc-group, main .stack { display: block !important; }';
  document.head.append(st);
  await wait(2500);
  // N3 — finish the typewriter deterministically via the block's own skip control.
  document.querySelectorAll('main [data-skip]').forEach((b) => b.click());
  await wait(500);
  // N4 — user-requested removal of the hero version tag.
  document.querySelectorAll('main .hero .ver').forEach((e) => e.remove());
  // N5 — user-requested removal of the spotlight route diagram.
  document.querySelectorAll('main .spotlight .spot-media').forEach((e) => e.remove());
  // N6 — user-requested removal of the hero wordmark.
  document.querySelectorAll('main .hero .hero-word').forEach((e) => e.remove());
  // N7 — user-requested removal of the chapter intro titles (tab labels remain).
  document.querySelectorAll('main .chapters .sc-title').forEach((e) => e.remove());
  // N8 — user-requested removal of the hero scroll link.
  document.querySelectorAll('main .hero .scroll').forEach((e) => e.remove());
  // N9 — user-requested copy edit of the kicker's first line (guarded).
  document.querySelectorAll('main .hero p.lines .line:first-child > span').forEach((e) => {
    if (e.textContent === 'Takes a website. Brings it back') e.textContent = 'Takes a website & brings it back,';
  });
  // N10 — user-requested removal of the "Built on impeccable." credit.
  document.querySelectorAll('main .install .credit').forEach((e) => e.remove());
  // N11 — user-requested removal of the impeccable lines from the install terminal (after N3).
  document.querySelectorAll('main .install .terminal pre span').forEach((e) => { if (/impeccable/.test(e.textContent)) e.remove(); });
  // N12/N13 — user-requested install copy edits (guarded).
  document.querySelectorAll('main .install h2 .line > span').forEach((e) => { if (e.textContent === 'Then ask it.') e.textContent = 'Docs included.'; });
  document.querySelectorAll('main .install p').forEach((e) => {
    if (e.textContent === 'Stardust is a set of AI skills. It needs impeccable for the design craft and Playwright to render pages. Install both, then say what you want in your own words. Slash commands are optional.') {
      e.textContent = 'Stardust is a set of AI skills. Install it, then say what you want in your own words.';
    }
  });
  // N14 — user-requested "Two ways in." lede edit (guarded).
  document.querySelectorAll('main .spotlight .spot-copy p').forEach((e) => {
    if (e.textContent === 'Say what you want in a sentence and the master skill picks the route. Or open a door yourself.') {
      e.textContent = 'Say what you want in a sentence and the master skill picks the route.';
    }
  });
  // N15 — user-requested addition: a Shortcut block in the Migrate door (cloned from the Redesign door's .short).
  (() => {
    const doors = document.querySelectorAll('main .spot-tiles a.door');
    if (doors.length !== 2) return;
    const [red, mig] = doors;
    if (mig.querySelector(':scope > .short')) return; // already authored upstream
    const short = red.querySelector(':scope > .short');
    const go = mig.querySelector(':scope > .door-go');
    if (!short || !go) return;
    const s2 = short.cloneNode(true);
    const kids = [...s2.children];
    const ci = kids.findIndex((k) => k.tagName === 'CODE' || k.querySelector('code'));
    if (ci < 0) return;
    kids.slice(ci + 1).forEach((k) => k.remove()); // label + command only, no note
    const code = kids[ci].tagName === 'CODE' ? kids[ci] : kids[ci].querySelector('code');
    code.textContent = '/stardust:replica <url>';
    mig.insertBefore(s2, go);
  })();
  // N2 — scroll-rail chrome duplicating chapter names.
  document.querySelectorAll('main .sc-rail, main .rail-overlay, main .lane-tab, main .lane-in, main .sc-probe').forEach((e) => e.remove());
})()`;
