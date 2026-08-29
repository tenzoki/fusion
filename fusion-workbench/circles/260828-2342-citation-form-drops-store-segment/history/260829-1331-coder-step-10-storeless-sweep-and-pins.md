# coder: plan step 10 of `260829-1226_*_citation-form-drops-store-segment.md`

**Filed by:** coder, Kai Stalmann <kai@qantr.com>
**Date:** 2026-08-29
**Status:** Complete
**Commit:** none (the orchestrator commits; this step lands in commit B with steps 2 to 8)

## What was done

**The sweep.** `node hooks/scripts/citation-sweep.mjs --write` over the workbench (`archive/` included) and the shipped surface (`rules/`, `agents/`, `skills/`, `README*.md`, `CLAUDE.md`, `docs/`, `bin/*`, `install.sh`, `hooks/*.ts`, `hooks/lib/*.ts`; `templates/` holds no markdown). Summary line: `files=2179 rewrites=16520 residual=3239 record=9686 circle-record=341 circle-dir=616 bare-record=992 stamp-bare=4885 mode=write`. Shares: workbench 2 116 files / 16 288 rewrites, of which `archive/` 565 files / 3 475 rewrites; shipped surface 63 files / 232 rewrites. Residual by class: 2 536 ambiguous, 438 dangling, 265 exempt (workbench 2 471 / 435 / 257; shipped 65 / 3 / 8 before the hand pass).

**Three rewrites reverted by hand**, because the plan reaches the comment lines of scripts and sources and these were not comment lines: `hooks/lib/citation-scan.ts:589` (a `fix` string literal, `decision 260805-0709_*_wohin-gehoert-die-forensik-aus-protected-path-discipline.md`), `hooks/lib/domain-cascade.ts:534` (a template-string error message naming two records), and `hooks/lib/citation-scan.ts:144`, a comment whose sentence is *about* the bare stamp being the residual, so spelling it out destroyed the sentence. Three JS comment lines inside `bin/monitor`'s heredoc were rewritten by the sweep and left so: comments, outside the reference-resolution surface, harmless.

**An artefact class the sweep produced, repaired.** A truncated citation `<stamp>_o_*`, `<stamp>_*_` or the pre-v4 `<stamp>[o]` (with or without a trailing slug) tokenises as `stamp-bare`, so the sweep replaced the stamp and left the old marker tail behind: `<basename>.md_o_`, `<basename>.md[o]-slug`. 239 such tails in 89 workbench files (16 under `archive/`), stripped with one regex (`(\d{6}-\d{4}_\*_[a-z0-9-]+\.md)(?:_[a-z*]_\*?|\[[a-z]\](?:-[a-z0-9-]+)?)` → `$1`); the one in a live record was `260827-1756_*_repair-the-twenty-open-defect-records.md:287`, which the workbench gate reported as dangling. **The sweep is not idempotent** for this reason: a second dry run over the swept tree offered 211 further `stamp-bare` rewrites, all chained from tails the first pass left, and would have produced more of the same tails. Run once; do not re-run over a swept tree without reading the census.

**The hand pass over the shipped residual.** 68 non-exempt bare stamps in the shipped text after the sweep (the plan counted 14 over the markdown surface alone; the script's list is the authority and reaches the comment lines). 56 rewritten by reading each sentence, listed below; 12 left, listed with the reason, and pinned.

**Pins.** `reference-resolution-lint.test.ts`: `BASELINE` gains `stampBare: 12`; `paths`/`anchors` measured 1537/215 → 1537/215 by the gate over the swept tree, so no per-file share exists (a store-prefixed record token never counted as a plugin path). Both goldens regenerated; no baseline map edited. `bin/fusion-source-root:36` needed backticks around its new basename (a trailing full stop was swallowed into the token).

**Skills budget.** The bare-stamp expansions put `skills/` at 241 077, 638 over its bound. Paid by three cuts in `skills/setup/SKILL.md`: the bracket-marker probe paragraph (line 57) loses its restated reasoning and keeps the rule and the bound; the duplicate "(Pre-v4 workbenches are refused at Step 0 …)" in the Setup-complete report; the "same deadlock … from the shape side" clause at line 59. `skills/` ends at 240 365 (HEAD 240 346, bound 240 439): 74 bytes left for step 9.

## Hand-finished shipped residual (file:line, stamp → basename)

- `260810-0710` → `260810-0710_*_the-drift-checks-last-line-makes-the-whole-block-exit-non-zero-when-no-circle-is-active.md` (the "issue" every sentence names; the other match is a `_d_` decision): `agents/orchestrator.md:552,1033`, `bin/fusion-citation-check:39`, `bin/fusion-prose-metric:42`, `bin/fusion-review-coverage:33`, `bin/fusion-staging-drift:30`, `hooks/citation-check.ts:45`, `hooks/review-coverage.ts:48`, `hooks/staging-drift.ts:42`, `hooks/tracker.ts:226,287,362`, `hooks/lib/review-coverage.ts:106`, `hooks/lib/staging-drift.ts:50`
- `260810-1205` → `260810-1205_*_seven-of-sixteen-commits-in-the-session-range-never-reached-a-review-pass-and-nothing-measures-the-gap.md`: `agents/orchestrator.md:547,778,786`, `README-hooks.md:221`, `CLAUDE.md:48`, `bin/fusion-review-coverage:44`, `hooks/review-coverage.ts:7,133`, `hooks/tracker.ts:275,303,490`, `hooks/lib/review-coverage.ts:2,670`
- `260801-2038` → `260801-2038_*_session-bookkeeping-froze-at-turn-1-while-three-turns-ran.md`: `agents/orchestrator.md:220,253,786`, `bin/monitor:150`, `hooks/lib/review-coverage.ts:80`
- `260817-1613` → `260817-1613_*_does-a-plan-stated-precondition-get-any-mechanism-or-is-it-read-by-a-human-or-not-at-all.md`: `agents/orchestrator.md:813`
- `260815-2109` → `260815-2109_*_may-a-circle-close-over-an-uncovered-review-range-and-who-decides.md`: `agents/orchestrator.md:809`, `docs/upgrading-to-v10-14.md:7`
- `260820-2324` → `260820-2324_*_is-the-work-tree-the-refresh-source-when-setup-runs-in-the-plugins-own-repository.md`: `skills/setup/SKILL.md:31`
- `260825-1030` (both) → both named, `…_*_may-a-project-depart-from-the-four-class-partition-deliberately-and-say-so-once.md` and `…_*_does-setup-repair-a-gitignore-that-departs-from-the-four-class-partition.md`: `skills/setup/SKILL.md:365`
- `260810-1918` → `260810-1918_*_the-cleanup-skill-carries-a-second-domain-cascade-in-the-pre-fix-order-and-no-gate-reads-it.md`: `README-hooks.md:225`, `hooks/lib/domain-cascade.ts:39,112,693`
- `260811-1146` → `260811-1146_*_does-the-measurement-family-get-a-shared-chassis-before-the-fourth-module.md`: `README-hooks.md:218`, `hooks/lib/guard-state-file.ts:32`
- `260811-0109` → `260811-0109_*_the-source-root-rooting-reached-two-skills-and-two-more-still-cite-the-install-copy.md`: `CLAUDE.md:37`, `bin/fusion-source-root:36`
- `260824-1538` → `260824-1538_*_the-identity-helpers-exit-4-message-names-a-cause-it-never-established.md`: `bin/fusion-identity:33`
- `260815-0007` → Circle `260815-0007-remove-eight-mechanisms-and-cap-growth`: `bin/fusion-rules:177`
- `260810-2110` → `260810-2110_*_the-domain-capture-one-liner-is-now-copied-into-a-fourth-skill-body-and-the-copying-is-the-stated-justification.md`: `bin/fusion-session-domain:4`; and "(issues 260810-2110, three of them)" → the reach-gate issue `260810-2110_*_the-cascade-reach-gate-only-sees-a-domain-name-in-backticks-or-double-quotes-and-that-hole-is-not-named.md` "and two siblings from the same review": `hooks/lib/domain-cascade.ts:697`
- `260816-1915` → `260816-1915_*_how-much-of-the-configuration-loader-survives-when-its-only-leaf-is-the-turn-budget.md`: `hooks/turn-budget.ts:36`, `hooks/lib/config.ts:18,383`
- `260806-1031` → `260806-1031_*_referenz-lint-die-eg-ausnahme-ist-breiter-als-ihr-eigener-kommentar-behauptet.md`: `hooks/lib/citation-scan.ts:173`
- `260812-2136` → `260812-2136_*_the-citation-grammar-reads-one-ellipsis-and-one-marker-syntax-and-the-workbench-uses-two-of-each.md`: `hooks/lib/citation-scan.ts:49`
- `260815-1247` → `260815-1247_*_the-churn-leaves-were-removed-without-a-retirement-entry-and-the-retirement-table-could-not-have-held-one.md`: `hooks/lib/config.ts:358`
- `260809-1101` → `260809-1101_*_an-absent-plugin-config-layer-yields-an-empty-protected-list-with-no-diagnostic.md`: `hooks/lib/config.ts:134`; → `260809-1101_*_churn-and-cross-file-state-are-cast-not-coerced-so-a-shape-valid-file-swallows-the-halt-message.md`: `hooks/lib/guard-state-file.ts:15`
- `260815-1501` → `260815-1501_*_the-reach-gate-is-blind-to-a-copy-written-only-in-the-retired-domain-names-and-reach-holes-does-not-say-so.md`: `hooks/lib/domain-cascade.ts:104`

## The 12 pinned residual bare stamps (`stampBare: 12`)

- `rules/circle-records.md:122` `260817-1907`: the archive sweep directory, cited as a label; no artifact of that stamp exists.
- `rules/circle-records.md:202` `260824-1500`: the timestamp value inside the worked `Claimed …` example, not a citation.
- `skills/next/SKILL.md:113` `260823-0800`: the `Ranked …` value inside the quoted example line.
- `bin/fusion-review-coverage:26,28`, `hooks/review-coverage.ts:28,29,31`: ellipsis-truncated filenames in sample output blocks.
- `hooks/lib/citation-scan.ts:22,46,52,144`: the grammar's own exhibits of the token shapes it reads.

Outside the pinned surface, left bare on purpose: `hooks/lib/citation-scan.ts:542,579` and `hooks/lib/domain-cascade.ts:534` (code strings), `bin/monitor:610,847` (JS comments; 847 names no artifact).

## Measurements

- `bin/fusion-citation-check` over this repository: `files=1705 tokens=17527 judged=13519 resolved=13150 dangling=260 store-prefixed=0 undecidable=2637 exempt=1480 verdict=violations` (before the sweep: `store-prefixed=8227 dangling=707`). The 260 dangling sit in the terminal-Circle records the workbench gate's frozen-store exclusion skips and this helper's corpus does not.
- `agents/` 406 757 → 408 641 (+1 884, orchestrator +1 615, all bare-stamp expansions); within its bound.
- `git status --short | wc -l` = 2238; `git diff --stat | tail -1` = 2228 files changed, 14526 insertions(+), 14784 deletions(-).

## Verification

`cd hooks && npm run build && npm test` — exit 1. Red: `committed-dist` "git ls-files bin/ equals the directory listing" alone, green once the orchestrator stages `bin/fusion-citation-check`. Tests  1 failed | 793 passed (794).
