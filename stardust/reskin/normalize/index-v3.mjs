// index-v3 — second AI-tell pass (2026-10-12): v2 ledger + authored casing. v1/v2 ledgers untouched.
import { LEDGER as V2_LEDGER, NORMALIZE as V2_NORMALIZE } from './index-v2.mjs';

export const LEDGER = [
  ...V2_LEDGER,
  {
    id: 'V3-N18',
    what: 'neutralise text-transform on the source (main * { text-transform: none })',
    why: 'USER-REQUESTED (v3, AI-tell #15): stardust.style authors its labels in sentence case ("Follow the redesign", "In this step", "Shortcut") and only uppercases them in CSS. Presentation-only: the captured text becomes the authored text; no characters change',
  },
];

export const NORMALIZE = `(async () => {
  await eval(${JSON.stringify(V2_NORMALIZE)});
  // V3-N18 — authored casing.
  const st = document.createElement('style');
  st.dataset.reskinNormalize = 'V3-N18';
  st.textContent = 'main *, main *::first-line { text-transform: none !important; }';
  document.head.append(st);
  await new Promise((r) => setTimeout(r, 300));
})()`;
