# Bugfix: the citation-sweep gate was a corpus drift, and fifteen tokens were repaired by hand

**Date:** 2026-09-05 05:52
**Status:** Complete
**Trigger:** Orchestrator dispatch, against the open defect `260904-1839_*_citation-sweep-test-is-red-at-head-and-was-already-red-before-this-session-started.md`
**Filed by:** bugfixer, Kai Stalmann <ks@qantr.com>

## Error

`citation-sweep.test.ts` red at HEAD. The suite asserts that `bin/fusion-citation-sweep --dry-run` reports `rewrites=0` over this repository's own committed workbench; it reported `files=8 rewrites=15`.

## Root Cause

The corpus, not the sweep. Every one of the fifteen rewrites carried class `bare-record`, whose rule is one line of `hooks/lib/citation-sweep.ts` — a citation's literal state marker becomes the wildcard. A non-idempotent sweep would show a second class or a re-rewrite of its own output; it showed neither. So the sweep is idempotent over this corpus and the corpus is what drifted: fifteen record citations were written with the marker letter the target happened to carry at the time instead of `_*_`, against `rules/fusion-workbench-conventions.md` `## Filename Patterns`.

Where they stood: one in this Circle's own record (the Grounding snapshot's terminal-record citation), one plan pointer in each of six coder history records under this Circle, and eight in `260904-1636-playmaker-direct-dispatch.md` in the shared history store. The playmaker's own regenerated `portfolio.md` carries the same six citations in the correct `_*_` form, which is what shows the history record as the drifted copy rather than the convention as unsettled.

## Fix

Fifteen tokens edited by hand, one per citation, marker position to `_*_`. Nothing else in any file changed. `--write` was not used: it stands behind a clean-work-tree guard this tree does not meet, and a hand edit makes each token a judgement.

Two judgements the rules ask for were made and neither fired. No token was a path named as the **subject** of a statement — the case `rules/fusion-workbench-conventions.md` `## Marker globs` closing paragraph reserves, where correcting the spelling would delete the finding; all fifteen are pointers whose surrounding prose already carries the state in words (`terminal`, `an issue closed`, `already`, `stays`, `a deferred decision`). And no token sat in a fenced code block, the second exemption. Both targets resolve: `find` locates the plan and the closed issue each at one path.

| File | Change |
|------|--------|
| `_t_circle.md:58` | the Grounding snapshot's terminal-record citation wildcarded |
| `260904-1908-coder-layout-tree-and-four-class-partition.md:5` | plan pointer wildcarded |
| `260904-2029-coder-presence-canonicalisation.md:5` | plan pointer wildcarded |
| `260904-2110-coder-setup-registers-this-checkout.md:6` | plan pointer wildcarded |
| `260904-2119-coder-setup-registers-this-checkout.md:6` | plan pointer wildcarded |
| `260904-2128-coder-sessionstart-exports-fusion-alias.md:6` | plan pointer wildcarded |
| `260904-2130-coder-monitor-header-carries-the-checkout-name.md:7` | plan pointer wildcarded |
| `260904-1636-playmaker-direct-dispatch.md:17,18,21,58,60,61,77` | eight citations wildcarded across seven lines |
| `260904-1839_*_citation-sweep-test-is-red-at-head-and-was-already-red-before-this-session-started.md` | `Resolved:` appended naming the cause; marker `_o_` to `_c_` |

## Verification

Census before: `files=8 rewrites=15 bare-record=15`. Census after: `files=0 rewrites=0 bare-record=0`.

`cd hooks && npm test` — exit 0, 48 test files passed, 825 tests, run twice: once after the token repairs and once after the defect record was closed and renamed. `citation-sweep.test.ts` passes, and so do the three gates that recompute from the tree — `workbench-citation-lint.test.ts`, `reference-resolution-lint.test.ts`, `portfolio-citation-form-lint.test.ts`. `monitor-warnings-panel.test.ts`, the filed intermittent, passed on both runs with no re-run needed.

No shipped file was touched: `bin/`, `hooks/`, `rules/`, `skills/`, `agents/`, the docs and the READMEs are byte-identical to what the session handed over.

A sixteenth token was repaired on the way, in this file. The changed-files table above first spelled the closed defect with its new `_c_`, which is exactly the drift the fix is about: the gate caught it on the run after this record was written, and the token became `_*_` with the transition stated in the table's right-hand column instead. Worth recording because it shows the fault is a writing habit rather than a one-off, and the gate is what catches it.

## Unrelated Issues Found

None filed. The census's `residual=2797` line counts bare stamps the sweep refuses to judge by design, and the second defect standing in the shared store, `260904-1839_*_the-playmaker-writes-a-store-prefixed-circle-citation-into-the-portfolio-it-regenerates.md`, is already filed and outside this dispatch.
