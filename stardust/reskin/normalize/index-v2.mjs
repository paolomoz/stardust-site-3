// index-v2 — the AI-tell cleanup variant (2026-10-12). Extends the index ledger verbatim, then adds
// the two content removals the v2 design needs. index.html keeps using normalize/index.mjs untouched.
import { LEDGER as BASE_LEDGER, NORMALIZE as BASE_NORMALIZE } from './index.mjs';

export const LEDGER = [
  ...BASE_LEDGER,
  {
    id: 'V2-N16',
    what: 'remove the chapter step numbers (.chapter .ch-no .num-display — "0 1", "0 2", "0 3" ×2)',
    why: 'USER-REQUESTED (v2, AI-tell #4/#5): numbered eyebrow rows above step titles removed; the step name + command move into the heading. v2 only',
  },
  {
    id: 'V2-N17',
    what: 'remove the "In this step" labels (.chapter .ch-covers > .label) ×6',
    why: 'USER-REQUESTED (v2, AI-tell #4): kicker above the checklist removed; the list stands on its own. v2 only',
  },
];

// The base ledger ends in an async IIFE; eval returns its promise so v2 runs strictly after it.
export const NORMALIZE = `(async () => {
  await eval(${JSON.stringify(BASE_NORMALIZE)});
  // V2-N16 — chapter step numbers.
  document.querySelectorAll('main .chapter .ch-no .num-display').forEach((e) => e.remove());
  // V2-N17 — "In this step" labels.
  document.querySelectorAll('main .chapter .ch-covers > .label').forEach((e) => { if (/^in this step$/i.test(e.textContent.trim())) e.remove(); });
})()`;
