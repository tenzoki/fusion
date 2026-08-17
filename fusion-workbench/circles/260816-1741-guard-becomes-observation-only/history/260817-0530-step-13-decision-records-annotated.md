# Step 13 — the decision records are annotated

**Agent:** ontocoder
**Date:** 2026-08-17
**Circle:** 260816-1741-guard-becomes-observation-only
**Plan:** `circles/260816-1741-guard-becomes-observation-only/planning/260816-1915_p_the-compliance-guard-becomes-observation-only.md`, step 13
**Status:** Complete

## What was asked

Walk the decision and issue records this Circle's eleven landed commits realise,
retire or resolve, using the instrument each transition calls for from
`rules/fusion-workbench-conventions.md` `## Inline State Tracking`. The dispatch
carried a correction the user approved at a human gate: the step's `Retired:`
list is wrong in three of its four entries, and its own re-derivation safeguard
would confirm the one entry that must not carry a line. The defect record
`circles/260816-1741-guard-becomes-observation-only/issues/260816-2316_*_step-13s-retired-line-list-is-wrong-in-three-of-its-four-entries-and-its-marker-scope-misses-a-fifth-record.md`
overrides the step's list.

Records only. No code, no tests, no `CLAUDE.md`, nothing under `rules/`, no commit.

## What was done

Eleven records were edited and ten of them renamed. Every commit citation was read
out of `git show` before it was written down, and every code claim was checked at
HEAD rather than taken from a record or from the dispatch.

### `_a_` → `_i_`, with an `Implemented:` line — six records

| Record | Cited | What the commits actually did |
|---|---|---|
| `shared/decisions/260809-1224_*_is-the-decision-governed-escalation-check-3-a-live-feature.md` | `2f624ca` (P-2), `fab8a4b` (P-7a), `6890ea2` (P-7b) | Option 1, retired. The dispatch named `2f624ca` alone; the recorded answer is "remove CHECK 3 **and its four configuration keys**", and the keys went in `fab8a4b` with `findRelevantDecisions` and `sensitivityLevel`, their declaring files in `6890ea2`. Citing one commit would have left two thirds of the answer unattributed. |
| `shared/decisions/260812-1232_*_does-the-escalation-counter-survive-a-block-source-that-ships-inert.md` | `9c79202` (P-3, P-6), `05d848b` (P-1), `2f624ca` (P-2) | Option 3. `9c79202` is the removal; `05d848b` is named because the record's own sequencing constraint required the legacy-halt remedy to exist first, and `9c79202`'s message states it was honoured. |
| `shared/decisions/260812-1232_*_does-the-write-guards-fusion-repo-stand-down-survive-the-loss-of-its-subject.md` | `2f624ca` (P-2), `ec3b6ad` (P-4) | Option 3, the question dissolved. **The dispatch had these two the wrong way round** — it said `ec3b6ad` for the `guard.ts` half and `2f624ca` for the branch. The commits say the opposite: `2f624ca` removed the stand-down branch from `hooks/guard.ts` (its diff drops `import { isFusionPluginCwd }` and the `if (isFusionPluginCwd())` block), and `ec3b6ad` then deleted the now-callerless `isFusionPluginCwd()` and rewrote the `self-detect.ts` header. Written as the tree has it. |
| `…/decisions/260816-1742_*_where-does-the-orchestrators-turn-budget-live-once-the-guard-configuration-file-is-gone.md` | `fab8a4b` (P-7a), `6890ea2` (P-7b) | Option 1, a renamed project-root file. |
| `…/decisions/260816-1915_*_how-much-of-the-configuration-loader-survives-when-its-only-leaf-is-the-turn-budget.md` | `fab8a4b` (P-7a), `6890ea2` (P-7b) | Option 1, two layers. Verified rather than assumed: `hooks/config.json` and `hooks/config.example.json` appear as deletions in `6890ea2`'s stat, and `validateLayer` in `hooks/lib/config.ts` no longer takes a layer kind. |
| `…/decisions/260816-1916_*_does-setup-offer-to-move-a-projects-turn-budget-out-of-the-retired-configuration-file.md` | `fab8a4b` (P-7a), `92db96a` (P-8), `18c125b` (P-12) | Option 1. **A third commit was added on verification.** The dispatch named the first two; the record's own `Answered:` line includes "`docs/upgrading-to-v10.md` states the same at length", and that file landed at step 12 in `18c125b`. Omitting it would have left part of the recorded answer uncited. |

`**Status:**` was moved from `answered` to `implemented` on all six, which is the
correction a prior reconciliation made by hand on this store's records and which
`shared/issues/260812-1232_*_thirty-four-of-seventy-four-decision-records-carry-a-status-header-that-contradicts-their-filename-marker.md`
counts.

### `Retired:`, no rename — one record

`circles/260801-1244-guard-rules-write/decisions/260804-1631_i_may-a-project-file-set-guard-enabled-and-switch-the-whole-guard-off.md`,
citing `fab8a4b`. `guard.enabled` exists at no layer: `RETIRED_TOP_LEVEL_KEYS` in
`hooks/lib/config.ts` names `guard` whole, and the project-only refusal this record
chose has nothing left to refuse. The marker stays `_i_`, so the filename still
reads as implemented and a history pass has to open the body — which is the
property `Retired:` was defined to have.

### `_a_` → `_s_`, with a `Superseded by:` line — one record

`circles/260807-0923-guard-misst-statt-orakelt/decisions/260807-0945_*_integritaet-des-eskalationsspeichers.md`,
superseded by `shared/decisions/260812-1232_*_does-the-escalation-counter-survive-a-block-source-that-ships-inert.md`.
`**Status:**` read `open` while the marker read `_a_`; set to `superseded`.

The annotation states why `Superseded by:` is the right instrument here and not a
stretched one: a later decision genuinely overrides this record, which is what the
vocabulary asks for. The neighbouring class — an `_a_` record whose answer is
unrealisable with **no** successor — is a different thing and is open at
`circles/260815-0007-remove-eight-mechanisms-and-cap-growth/decisions/260815-2056_*_what-marks-an-answered-decision-whose-answer-can-no-longer-be-realised.md`.
This record is not one of its instances.

### `Resolved:` and rename to `_c_` — three issues

- `shared/issues/260812-1546_*_check-3-the-guards-only-remaining-block-source-allows-from-any-subdirectory-and-nothing-tests-it.md`
  — the guard has no block source, and `hooks/lib/project-relative.ts` (the cwd
  anchoring it measured) went with its last caller in `3c2e1c6`. The resolution
  says plainly what did **not** go: the cwd-anchored assumption is still live in the
  four `bin/` helpers and `hooks/session-start.ts` still warns about it. What ended
  is its reach into a guard verdict, which is what the record was about.
- `shared/issues/260812-1546_*_the-record-of-the-floors-loss-does-not-say-the-file-it-stopped-defending-arms-the-last-block-source.md`
  — the file arms nothing and is itself retired. Of the three surfaces it named,
  one was deleted with the passage it quotes (`hooks/lib/config.ts:125-133`, gone
  in `fab8a4b` — confirmed with `git log -S`), and two now state the bound correctly
  (`README-hooks.md:311`, `templates/fusion.json` `_gitTracked`).
- `circles/260816-1741-guard-becomes-observation-only/issues/260816-2316_*_step-13s-retired-line-list-is-wrong-…md`
  — closed with a `Resolved:` line naming all five findings and what each produced.

## What was deliberately not done, and why

**`260804-1630_i_what-does-a-project-guard-object-inherit-for-a-key-it-does-not-supply.md`
got no `Retired:` line.** The four sites were read at HEAD before deciding, not
accepted from the defect record: `hooks/lib/config.ts` cites the decision in the
present tense at `:46-49`, `:70-73` and `:363-367`, and the per-leaf walk survives at
`:479-486`, `??` and all, deliberately not collapsed. The plan deleted the record's
*setting*; its *answer* — the per-leaf merge, and the equivalence of a dropped key,
an omitted key and an unwritten file — is live code and three comments say so.

**The step's re-derivation safeguard was not run.** It instructs a grep of the
decision stores for the identifiers this plan deletes. `260804-1630`'s `## Question`
names five of them, so that grep returns it first. The instruction written to catch
a wrong list is the instruction that would have confirmed the one wrong entry.
Candidates were checked against the code instead. This is the finding worth carrying
forward: a safeguard whose signal is "mentions a deleted thing" cannot distinguish a
record *about* a deleted thing from a record whose *answer* outlived it.

**`260803-1419_i_…` and `260802-1912_i_…` got no second `Retired:` line.** Both
already carry `Retired: 60c9cd8`, at `:123` and `:95`.

**`260804-1632_d_should-findrelevantdecisions-fold-case-…` was left untouched.** No
instrument fits a deferred question whose subject was deleted, and the one that
looks closest is exactly what `260815-2056` is open to decide. Left as a named
residual rather than annotated with a stretched instrument.

## Residuals named rather than fixed

- **`260802-1912_i_…` carries a stale citation.** Its `Retired:` line cites
  `hooks/lib/config.ts:127` for the note "THE SELF-PROTECTION FLOOR WENT WITH IT";
  `git log -S` puts that note's deletion in `fab8a4b`, so the citation now resolves
  to unrelated text. Not repaired — the dispatch bars a second annotation there and
  a silent rewrite of an existing one is a different act from the annotation this
  step authorises.
- **`260804-1631_i_…` has `**Status:** open` against an `_i_` marker.** Pre-existing,
  and one of the instances counted by
  `shared/issues/260812-1232_*_thirty-four-of-seventy-four-decision-records-carry-a-status-header-that-contradicts-their-filename-marker.md`.
  `Retired:` changes no state, so this pass had no transition to correct it under,
  and fixing it silently would make that issue's count stale by one.
- **`260815-2056_o_what-marks-an-answered-decision-whose-answer-can-no-longer-be-realised.md`
  now has a third candidate instance in a marker it does not cover.** Its two
  instances are `_a_`; `260804-1632` is `_d_` and fails for the same reason. Not
  added to that record — widening an open question's evidence base is the user's
  gate, not an annotation.

## Verification

`cd hooks && npm test` — exit 1, red set **2 files / 3 cases**, unchanged from the
baseline measured before any edit: `reference-resolution-lint` 1 case (the
whole-surface case, kept red by `CLAUDE.md`'s citations, which step 16 owns) and
`surface-growth-bound` 2 cases (step 10's). Both runs, before and after, were
`2 failed | 33 passed (35)` files and `3 failed | 650 passed (653)` cases.

The renames were checked against the lint's scanned surface before they were made:
`rules/`, `agents/`, `docs/`, `templates/`, `skills/`, the READMEs, `CLAUDE.md`,
`bin/`, `install.sh` and the `hooks/**/*.ts` comment surface carry **no**
exact-marker citation of any of the ten records, so no shipped-text citation could
go stale. Every citation written in this pass uses the `_*_` wildcard form.

Nothing was committed. `git mv` staged the ten renames; no other path was staged.
