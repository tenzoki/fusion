# Analysis: why the citation checker's verdict changes from clean to violations on the migrated workbench

**Date:** 2026-10-05 12:20
**Type:** Failure Investigation
**Status:** Complete
**Requested by:** orchestrator

## Question

The installed 12.2.1 checker prints `verdict=clean` on this repository's legacy workbench. The `fj03d` checker at `0906bb36` prints `conflict=411`, `edited-violations=2`, `verdict=violations` on a migrated copy. Which cause produces the difference, per hit group: the migration, the side branch's checker code, the edited window, or figures that were always there? The question comes from the open issue on the checker's verdict filed 2026-10-05 11:07 in this package's issue store.

## Scope

Trees read, all read-only:

| Tree | HEAD | Commit date | Branch | Tracking |
|---|---|---|---|---|
| Live checkout `/Users/kai/Projects/productive/F04-FUSION/fusion` | `49799e09` | 2026-10-05 11:08 +0200 | `fj-json-workbench` | 249 ahead of `origin/fj-json-workbench`; one modified file (`fusion-workbench/orchestrator-events.jsonl`) |
| Side worktree `/Users/kai/Projects/productive/F04-FUSION/fusion-fj03d` | `0906bb36` | not read | `fj03d` | no upstream shown |
| Migrated copy `scratchpad/fix-acc2/reh` (session `2c005d1b-…`) | `8b88419d`, a scratch merge of `29dac3c5` with live `12a3ebe8` | not read | `rehearsal` | scratch only |
| Installed plugin `~/.fusion` | version 12.2.1 (`.claude-plugin/plugin.json`) | n/a | n/a | n/a |

Runs made for this analysis, none of which wrote into a tree:

- `~/.fusion/bin/fusion-citation-check --undecidable` in the live checkout. Neither checker source contains a write call (searched for `writeFile`, `appendFile`, `mkdir`, `rmSync`, `unlink`, `renameSync` and the process spawners in the three sources of both versions: no hit). `git status -sb` was identical before and after.
- A probe script in the scratch directory that imports the installed 12.2.1 compiled grammar, scans the live tree exactly as the 12.2.1 entry does, and applies the side branch's conflict rule to the hits. It prints to stdout only.
- The `fj03d` checker was **not** re-run. Its output on the migrated copy was read from the existing evidence `scratchpad/fix-acc2-check.out` (1 143 lines) and `scratchpad/fj03d-rehearsal/evidence/citation-check.out`. `hooks/lib/record-index.ts:64-66` states that a read may finish a committed intent, so a run could write, and the existing evidence was sufficient.

Not read: the text of section 4.4 of Prior's spec, which the side branch names as the source of the conflict rule. It was not found in this work package or under `docs/`.

## Findings

### 1. The figures, side by side

| Figure | 12.2.1, legacy live tree at `49799e09` | `fj03d` `0906bb36`, migrated copy (base `12a3ebe8`) | What explains the gap |
|---|---|---|---|
| `dangling` | 306 | 306 | No gap. Always there. |
| `store-prefixed` | 405 | 405 | No gap. Always there. |
| `conflict` | line does not exist | 411 | Checker code. 12.2.1 has no such finding; the same hits sit in its `undecidable` figure with status `ambiguous`. |
| `undecidable` | 4 228 | 3 802 | 4 228 − 416 would-be conflicts = 3 812; the remaining 10 is tree drift and the two scope changes (control files and originals leave the index). Not decomposed further. |
| `edited-files` | 264 | 223 | Liveness moved from the file name's marker to the record's status (step 8). |
| `edited-violations` | 0 | 2 | Checker code. Both rows exist before migration, in edited files, as `ambiguous`; 12.2.1 does not count `ambiguous` as a violation. |
| `unedited-violations` | 711 | 1 120 | 711 + 409 not-edited conflicts. |
| `verdict` | `clean` | `violations` | Follows `edited-violations`. |

All figures verified from output. The decomposition of the `undecidable` remainder is inferred.

### 2. The cause is one rule in the reporter, introduced at FJ03b step 3

Verified from the diff of `~/.fusion/hooks/citation-check.ts` against `fusion-fj03d/hooks/citation-check.ts`:

- `fj03d` `hooks/citation-check.ts:401-404` takes every hit with status `ambiguous` and a kind in `GATE_KINDS` out of the undecidable list, relabels it `conflict`, and adds it to the violations that `verdict=` reads.
- 12.2.1 `hooks/citation-check.ts:346` builds the violations from `dangling` and `store-prefixed` only. Ambiguous hits go to `undecidable=` and are printed only under `--undecidable`.

`git log -S'asConflict'` on `fj03d` dates the rule to `bf3aea49` (2026-09-30, FJ03b step 3). It is not step 7, not step 8 and not `0906bb36`. The closed FJ03b plan in this package ordered it at its step 3: "An `ambiguous` hit is a `conflict` violation (section 4.4)", with a test "two files matching one citation are a `conflict`". The rule is therefore an intended change as planned.

Until step 8 the rule applied on a `json-control` workbench only, and this repository's workbench was legacy, so no run on this workbench ever showed it. The rehearsal was the first.

### 3. The same 411 rows exist on the legacy tree today

Verified by the probe. Over the live legacy tree, with the 12.2.1 grammar and the side branch's rule:

```
files=3271 edited-files=264 undecidable=4228 would-be-conflict=416 would-be-conflict-edited=8
```

Compared as a multiset of (file, token, match count) against the 411 conflict rows of `fix-acc2-check.out`:

- All 411 migrated rows are present in the live set. Nothing is in the migrated set only.
- The live set has 5 more. All 5 are in the issue that reports this very observation, filed after the rehearsal's base commit: its lines 10, 11, 12 and 14 quote the example tokens as plain inline code, and each quote is itself an ambiguous citation.

So the migration adds no conflict and removes none. Kinds in the live set: 166 `stamp-name` (165 plus one from the issue) and 250 `bare-record` (237 + 9 plus four from the issue).

### 4. Hit group by hit group

| Group | Count | Cause | Classification |
|---|---|---|---|
| Bare package names that exist under `work-packages/` and in an archive sweep's `circles/` copy | 165 | Checker rule (cause 2) over a duplication that predates the migration (cause 4) | Noise that was already there. All not-edited. 12.2.1 printed them as `ambiguous` under `--undecidable`. |
| Truncated or elided wildcard tokens matching several records of one stamp | 237 | Same | Noise that was already there, except the two below. |
| The same in the marker-less spelling | 9 | Same | Noise that was already there. All not-edited. |
| The two verdict holders | 2 of the 237 | Checker rule alone | Intended change by the FJ03b plan; whether an elided token was meant to be covered is not decidable without section 4.4. |

Causes ruled out, each verified:

- **The migration (cause 1).** The row sets are identical across legacy and migrated. Migration originals are out of the index since `0906bb36`. The match lists of the migrated rows still carry the marker-bearing basenames, so no rename produced a second match.
- **Step 7, step 8, `0906bb36` (rest of cause 2).** Step 8 changed which files count as edited (264 to 223) and removed the legacy branch; it produced none of the conflicts. `0906bb36` removed conflicts (2 392 before it, 411 after, per the rehearsal evidence).
- **The edited window (cause 3).** There is no git-based window. "Edited" is a pure predicate over a path (12.2.1) or over the record index (`fj03d`); neither reads a commit range, so a merge commit in the clone changes nothing. The predicate change moved one conflict row *out* of the edited scope (finding 5) and none in.

### 5. The two verdict-holding rows

Both tokens end in an ellipsis after the wildcard marker, an abbreviation the writer used in place of the slug. The grammar matches such a token as a prefix, so it matches every record of that stamp.

| Row | File edited under 12.2.1? | File edited under `fj03d`? | Status under 12.2.1 | Status under `fj03d` |
|---|---|---|---|---|
| `hooks/review-coverage.ts:54`, 2 matches (a `_d_` decision in `shared/decisions/`, a `_c_` issue in `archive/260829-1110-safe-cleanup-tier-1/shared/issues/`) | Yes: a declared file, always live | Yes: same | `ambiguous`, not a violation | `conflict`, a violation |
| Line 210 of the prior-nomenclature spec in package `260922-1038-prior-mapping` (line 211 on the live tree), 7 matches, all `_a_` decisions of one minute in that package | Yes: an `_o_` plan matches `LIVE_PLAN_RE` | Yes: its record is open | `ambiguous`, not a violation | `conflict`, a violation |

Each is an edited violation after migration and not before for one reason only: the reporter began counting an ambiguous judged citation as a violation. Both files were in the edited scope before and after. The line number differs by one because the migration removes the `**Status:**` head line from the narrative (verified by diffing the first 12 lines of both copies).

One would-be conflict was edited under 12.2.1 and is not under `fj03d`: line 26 of the closed Circle record of `260801-1244-rule-provenance-header`. 12.2.1 admits a Circle record in every state; `fj03d` reads its record as terminal. The migrated output prints it `not-edited`.

### 6. What the window would show as things stand

Inferred from the probe on the live head, not run:

- `conflict` near 416, `dangling=306`, `store-prefixed=405`.
- `edited-violations=7`: the two holders plus the five rows in the open issue that quotes them. The issue's record is open, so its narrative is in the edited scope.
- `verdict=violations`.

Every further open issue, decision or plan that quotes one of these tokens outside a fence or a blockquote adds one edited violation per quote. This report quotes none outside a fence, and analyses carry no record, so it adds nothing to the edited count.

### 7. A discrepancy between the reporter and the blocking gate

Verified at `fusion-fj03d/hooks/lib/citation-scan.ts:1470-1486`: `scanRecordCitations`, the entry the blocking `workbench-citation-lint` reads, still counts an `ambiguous` hit as resolved, and its comment calls "finds exactly one" "a different check, not a fix to this one". The reporter now applies that different check. The two readers share a corpus predicate and no longer share a definition of a violation. That is why `npm test` stays green on the migrated copy while the reporter prints `violations`.

## Implications

- The migration is not the cause and needs no change for this.
- The changed verdict is the planned FJ03b rule meeting this workbench for the first time. It would have appeared on any JSON-controlled copy of this workbench since `bf3aea49`.
- Seven hand-written abbreviations in three live files hold the verdict. The other 409 rows are in text nobody edits and do not move it.
- The issue filed to report the problem enlarges it, because a quoted example is a citation to the grammar unless it is fenced.

## Recommendations

Three options. Only the first is recommended.

| Option | What changes | Cost |
|---|---|---|
| **A. Repair the edited rows (recommended)** | Respell the token at `hooks/review-coverage.ts:54` and at line 211 of the prior-nomenclature spec with a slug that names one record; fence or reword the four example lines of the reporting issue, or close it before the window. | One comment line in a hook source on `fj03d` (code-implementer; a comment, but `hooks/dist/` is committed and the growth bounds apply), one line in an open plan, one issue narrative. The writer must decide which of the two `260810-0710` records the comment means. `conflict=` stays near 409, all not-edited, and the upgrade document should say a migrated project may see such rows. No checker change, no ruling needed. This is what the edited scope was built for: rows a person can repair. |
| B. Narrow the rule | A token that elides or omits its slug stays `undecidable` and is not a `conflict`. | Checker change on `fj03d`, new test cases, step 11 repeated, and a ruling against the FJ03b plan's reading of section 4.4, which needs that section's text. Clears the two holders and most of the 246; leaves the 165 package-name rows. |
| C. Rule the conflicts acceptable | Nothing in code; the upgrade document states that `verdict=violations` is expected. | Step 15's expectation is reworded, and `verdict=` on this workbench carries no information again, the state the scoping decision of 2026-08-30 was made to end. |

Independent of the option chosen, the gap in finding 7 is worth one sentence in `README-hooks.md` when the two rows named in the issue are corrected: the reporter counts a conflict, the blocking lint does not.

## Filed Issues

None, as instructed by the dispatch.

## Sources

- `~/.fusion/hooks/citation-check.ts:285-380`, `~/.fusion/hooks/lib/citation-corpus.ts`, `~/.fusion/hooks/lib/citation-scan.ts:1730-1751`, `~/.fusion/bin/fusion-citation-check` (header)
- `fusion-fj03d/hooks/citation-check.ts:326-333, 352-362, 401-439`, `fusion-fj03d/hooks/lib/citation-corpus.ts`, `fusion-fj03d/hooks/lib/citation-scan.ts:971-977, 1128-1154, 1470-1486, 1740-1750`, `fusion-fj03d/hooks/lib/record-index.ts`, `fusion-fj03d/bin/fusion-citation-check` (header)
- `git log -S'asConflict' -- hooks/citation-check.ts` on `fj03d`: `bf3aea49`
- The closed FJ03b plan in this package's plan store, step 3 (lines 105-112); the FJ03d plan, lines 235-236
- `scratchpad/fix-acc2-check.out`, `scratchpad/fj03d-rehearsal/evidence/citation-check.out`
- Own runs, in `scratchpad/analyst-cc/`: `live-1221.txt` (12.2.1 output with `--undecidable`), `probe.mjs`, `live-probe.tsv` (416 rows with kind, scope, matches)
- `hooks/review-coverage.ts:52-55` and line 211 of the prior-nomenclature spec, live tree

## Open Questions

- [ ] Does section 4.4 of Prior's spec mean a citation that names two artefacts, or also an abbreviation that names none in particular? Missing input: the section's text. It decides whether option B is a correction or a departure.
- [ ] Which of the two records of stamp `260810-0710` does the comment at `hooks/review-coverage.ts:54` mean? The wrapper header `bin/fusion-citation-check` cites the issue of that stamp by its full slug for the same argument, which suggests the issue (a guess).
- [ ] The 10-row remainder in `undecidable` between the two runs was not decomposed.
