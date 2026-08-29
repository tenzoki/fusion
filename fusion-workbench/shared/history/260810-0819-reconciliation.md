# Reconciliation — session `260810-0241-orchestrator-session.md`, Phase 3

**Agent:** reconciler
**Domain:** `code`
**Range:** `8960e1a..dd50efd` — 22 commits, 3 Turns
**Active Circle:** none (`.active-circle` absent) — everything resolved to `shared/`
**Suite at HEAD:** re-run, 38 files / 1001 tests / 0 failures (164s). Matches the dispatch's claim exactly.

---

## Headline

**Every closure this session is honest. The arithmetic around them is not.**

All 20 records marked `_c_` were verified against the working tree and all 20 are genuinely
resolved — no PARTIAL, no NOT RESOLVED, and every commit hash cited in a resolution note exists.
That is the strongest thing in this reconciliation and it should not be lost in what follows.

But the session's own count of what it did is wrong in four independent places, and the shared
store's open count did not go from 34 to "roughly 41". It went from **34 to 46**.

---

## 1. The arithmetic, measured

Computed by diffing the marker of every record between `8960e1a` and the working tree.

| Quantity | Dispatch said | Measured |
|---|---|---|
| Records in `shared/issues/` at start | 98 total, 34 open | 98 total, **34 open** ✓ |
| Records in `shared/issues/` now (disk) | — | 130 total, **46 open** |
| Records in `shared/issues/` now (HEAD) | — | 136 total, **52 open** — see §3 |
| Closed this session | 20 | **20** ✓ |
| …of which were among the original 34 | (implied 20) | **11** |
| …of which were filed *and* closed this session | — | **9** |
| Filed this session | 23 | **32** (23 left open, 9 closed same-session) |
| Still open from the original 34 | — | **23** |
| Commits in range | 23 | **22** |

**The error in the dispatch's framing is one substitution: nine of the twenty closures were of
records that did not exist at session start, so they cannot reduce the starting 34.**

The Directive was to close 34. It closed **11 of 34 — 32%.** The remaining 23 originals are
untouched by any commit in the range.

Net open, the honest way to say it:

```
34  open at 8960e1a
-11 originals closed
+23 new findings left open
= 46 open on disk now
```

Three of the 23 still-open originals are records the queue itself judged need **no work at all**
(`## Close without work`: `260717-0031_*_p8-lint-gate-scope-open-questions-from-conversions.md`, `260717-0115_*_live-workbench-split-across-two-layouts-during-conversion.md`, `260809-2255_*_the-branch-policy-verification-left-an-active-halt-and-24-consecutive-blocks-in-the-live-guard-state.md`). That proposal was written
at 02:49 and never executed — nobody renamed them. I have deliberately not renamed them either:
the queue *proposed* closure, the user never accepted it, and closing three records on a queue's
say-so is not a reconciler's call. But they are inflating the open count by 3, and `260809-2255_*_the-branch-policy-verification-left-an-active-halt-and-24-consecutive-blocks-in-the-live-guard-state.md`'s
first acceptance criterion is now demonstrably met (`.guard-state/escalation.json` reads
`haltActive: false`, `consecutiveBlocks: 0`) while its second is moot (the branch policy it names
was deleted in `7598073`).

---

## 2. The 20 closures — all confirmed

Verified individually against the working tree, not against the resolution notes. Four citation
defects found, none of which affects a verdict:

| Record | Citation defect |
|---|---|
| `260805-0629_c_` executor verification | `agents/orchestrator.md:361` says `bugfixer` reports "the exact command run and the exit code"; `agents/bugfixer.md:101` still says only "Verification result (pass/fail)". The prompt over-states its own reach. |
| `260807-1951_*_die-tiefenschranke-der-codezaehlung-sieht-keinen-cargo-workspace.md` depth bound | Cites the decision as `260809-1731_*_…`; the file is now `_i_`. Dead as a literal path — the instance `260808-0030_o_` predicts. |
| `260810-0457_*_rebuild-map-drops-a-colliding-plane-uuid-silently-unlike-the-migration-beside-it.md` rebuild collision | Cites the corrected header at `bin/fusion-plane:99-104`; it now sits at `:113-122`. |
| `260810-0745_*_the-golden-approval-names-the-wrong-cohorts-and-absorbs-1749-bytes-on-the-largest-agent.md` golden cohorts | The correction table is right on every row; the prose sentence below it swaps shaper's and playmaker's totals (shaper is 101 624, playmaker 95 951). A correction that mis-states the thing it corrects. |

---

## 3. Six records exist twice at HEAD — filed as `260810-0819_o_`

`git ls-tree HEAD` returns **52** open records; disk holds **46**. The six-record gap is three
add-only marker renames in `c923935`, `3df0c17` and `dd50efd`: the `_c_` name was staged, the `_o_`
name was not. The six deletions sit unstaged in the working tree right now.

This is the exact defect `260807-1941_c_` closed three days ago for three records. That record was
honest — it said it was closing the instance and that the class fix ("whether a marker rename should
go through `git mv` as a convention") was "a decision, not a fix". **No decision record was ever
filed for it.** The class was left with neither a fix nor an open question, and recurred at twice
the volume.

Filed: `260810-0819_*_head-carries-six-records-twice-and-the-class-fix-was-deferred-to-a-decision-never-filed.md`

---

## 4. The queue is stale, and staler than "partially maintained" suggests

`tasklist.md`, built 02:49 at `8960e1a` for 34 records.

- **3 of 31 tasks carry `[x] done`** (tasks 3, 5, 7). **Eight more are done in fact and still read
  `[ ] open`** — tasks 1, 2, 4, 8, 9, 10, 11, 15, each of which maps to a record now `_c_`.
- **It was never committed.** `git log -- fusion-workbench/tasklist.md` tops out at `c353196`
  (2026-08-09 20:31) — the *previous* session's queue. This session's queue exists only as an
  unstaged 1412-insertion working-tree diff. So does its taskplanner history file
  (`260810-0249-tasklist-update.md`, untracked).
- Its scope header still says "34 open defect records"; there are 46.
- Its snapshot counts are stale in the same direction as everything else: 4 open decisions (now 5
  in `shared/`, 6 counting the one inside a Circle).
- The 3 `## Close without work` proposals were never executed.

**How stale, in one line: 8 of 11 completed tasks still read open, and git has never seen the file
at all.** The executors who declined to edit it were right to — it had concurrent writers and no
locking — but the consequence is that the queue is now a worse record of the session than
`git log` is.

One thing the queue got right and should be credited: its header **does** carry
`**Git HEAD at build time:** 8960e1a`, which is the ground `ff70d3a` added. It is missing only the
`**Active Circle:**` line — which is exactly the residual `260810-0431_o_` was split out to carry.

---

## 5. The three deliberately-unmet closures — all honest

Checked claim by claim: what each note says was done, was done; what each says is missing, is
missing.

### `260801-2038_o_` session bookkeeping — **HONEST**, one residual understated

Stayed `_o_`. `9bad4d6` added detection only (prompt section + 228-line lint), and the note's
"Candidate 1 (prevention) is not built" is exact. The three "missing" claims (`skills/setup/SKILL.md`,
`bin/monitor`, `agents/reconciler.md` compute nothing) are all true — zero hits for drift/`rev-list`
in any of the three.

**The defect recurred during the session that fixed it, at four surfaces:** `agentstate.yaml`
(frozen at Turn 1 / 9 tasks / 12 commits, updated 04:15), `orchestrator-live.md` (frozen at Turn 2 /
17 tasks / 21 commits, coderev still shown `[RUNNING]`), the session history file (its
`## Per-Turn Log` reads `(Turn 1 starting)` and **the file is untracked in git**), and `tasklist.md`
(§4). `grep -c state_drift orchestrator-events.jsonl` → **0**.

**The reason it never fired is not the one the record gives.** The note attributes non-firing to
prompt text being overridable under pressure. But `9bad4d6` landed 04:15 and the `turn_end` /
`turn_start` call points were reached at 06:55 — 2h40m later — and neither fired. **A prompt is
loaded at session start, so a fix written into `agents/orchestrator.md` cannot reach the session that
writes it.** A prompt-only fix has zero effect on its own session, by construction. That is a
distinct failure mode, it is not overridable, and it is what produced this instance. Appended to the
record.

### `260731-2246_c_` cadence empty key — **HONEST on its own criteria, OPTIMISTIC on the class**

Both commits are real and the docs half is acceptance-bearing, not padding: `e99f0ef` adds exactly
the 670 bytes the note claims, and it is item 2 of the record's own "Recommended fix", so the record
is not closable without it. `6a69717`'s assertion was executed with all three keys unset and exits 1
with all three named.

Where it is optimistic: the note writes that without the convention "the seven sibling skills
inherited nothing", implying that with it they inherit something. **Mechanically they inherit
nothing.** All seven cited siblings carry zero emptiness assertions today, and the rule was violated
**one hour after it was written** — `ff70d3a` (04:39) added a new unguarded `mv "$Q"
"$WORKBENCH/$P/…"`, filed as `260810-0500_*_the-queue-retirement-writes-through-unchecked-resolver-values-and-can-move-the-queue-to-the-workbench-root.md` and fixed at four sites by `3df0c17`, whose own message
concedes "This is the fix for one site, not for the pattern." No open record tracks the seven
sites.

### `260807-1515_c_` / `260810-0431_o_` queue outliving its Circle — **HONEST**

The split is clean. Every claim in the Abschlussnotiz checks out: the single `### The queue's ground`
definition keyed on `.active-circle`, the retirement riding the pointer clear, `mv` never `rm`, the
`[ -n "$G" ] && [ "$G" = "$(basename "$DIR")" ]` guard, the four-row verdict table, the two skill
citations, and option 1 explicitly not built. The `_o_` record states the producer gap in the same
terms and neither claims what the other denies. The `_o_` record's framing is actually sharper than
the `_c_` note's — but the harder wording is in `agents/orchestrator.md` itself, which the note
points at, so nothing is concealed.

The one thing the `_c_` note does not carry: **four defects the commit itself introduced**, filed
later by coderev and never cross-referenced back — `260810-0500_*_the-queue-retirement-writes-through-unchecked-resolver-values-and-can-move-the-queue-to-the-workbench-root.md`, `260810-0501_*_two-skills-cite-a-prompt-section-they-have-no-documented-route-to-read.md`,
`260810-0506_*_the-activation-pointer-write-in-next-6-3-exits-non-zero-when-no-queue-exists.md`, `260810-0511_*_the-queue-head-parser-is-written-twice-in-one-file-that-calls-itself-the-canonical-implementation.md`. Of these `260810-0501_*_two-skills-cite-a-prompt-section-they-have-no-documented-route-to-read.md` is the consequential one: both skills
cite `agents/orchestrator.md` by bare relative path, which does not exist at a consuming project's
root, so the "one canonical implementation both skills cite" design — the note's load-bearing first
claim — is unreachable outside this repo.

---

## 6. The lint cohort — all three findings still accurate, and the cohort is worse than "two decorative"

**The dispatch's premise that two of the lints were touched afterwards does not hold.** None of the
four test files has been touched since its introducing commit:

| File | Only commit touching it |
|---|---|
| `state-drift-detection-lint.test.ts` | `9bad4d6` |
| `domain-cascade-order-lint.test.ts` | `31d8bb3` |
| `queue-ground-lint.test.ts` | `ff70d3a` |
| `executor-verification-report-lint.test.ts` | `1f2faaf` |

Every line number cited in the three records still lands on the text it describes. Nothing is stale.

Verified by loading the real helper functions out of the test files and running them against mutated
text in memory (no file mutated on disk):

- **`260810-0502_*_the-state-drift-lint-anchors-on-the-phrase-it-checks-and-one-negative-control-is-a-duplicate.md` — still accurate, and understated.** The record grants two of four call points as
  genuine. **All four are defeatable.** The follow-up assertion is `toMatch(/drift check/i)` against
  the anchored line, so a line that mentions the check *while forbidding it* passes. Inverting all
  four call points leaves `assertRidesAnEmission` green, and the other five tests read only sections
  the mutations sit outside. The suite stays green with the drift check disabled everywhere it
  exists.
- **`260810-0503_*_the-domain-cascade-lint-is-defeated-by-a-decoy-branch-and-one-helper-has-no-negative-control.md` — still accurate, with a fourth defeat.** The decoy, the inversion and the dead
  threshold all pass both helpers. So does a token appearing only in a **trailing comment** —
  `branchesFrom` keeps the whole line. `260807-1942_*_die-domaenenerkennung-entscheidet-vor-der-codezaehlung-und-erreicht-code-nie.md` can be reinstated in full with the suite green.
  `assertAbsentCountFirst` still has no negative control (`:143-145` is a second positive assertion).
- **`260810-0510_*_two-of-the-queue-ground-lints-negative-controls-re-implement-the-logic-instead-of-calling-it.md` — still accurate.** Emptying the body of `assertRidesTheAct` (`:130-140`) fails
  nothing in the file. There is a structural reason the control could not call it: it is declared with
  no parameter and closes over the real files, so a fixture cannot be handed to it — the factoring the
  fix direction asks for is a precondition, not a tidy-up. The executor-lint fixture diverges from
  `1f2faaf^:agents/coder.md` three ways, not two.

**The correct cohort statement is: of four new prompt-parsing lints, three can be defeated at every
point they claim to enforce.** The one that holds is `queue-ground-lint`'s *positive* half, which runs
against the live files. The reviewer's "two were decorative" understated its own sharpest finding.

Evidence appended to all three records. **Decision `260810-0710_o_` is not answered here — it is the
user's**, and this section is deliberately written as input to it rather than as an argument for
either side.

---

## 7. Open-decision surface

Five `_o_` in `shared/decisions/`, plus one inside a Circle that no shared scan reaches.

| Priority | Decision | Blocking |
|---|---|---|
| **HIGH** | `260810-0710_*_should-a-rule-be-allowed-to-land-without-the-check-that-enforces-it` (new tonight, `8d66265`) | Nothing mechanically — it governs how every future rule lands. Its own instance already cost a real defect in the same Turn that wrote the rule: `e99f0ef` wrote the convention, `ff70d3a` broke it three commits later. Should be answered with §6's cohort in view. |
| **MEDIUM** | `260809-1224_*_is-the-decision-governed-escalation-check-3-a-live-feature` (20h) | The only open decision a written plan names as its blocker. `260809-1229_*_…:366,412` records C5 as "still inert … blocked on" it; ~60 lines in `hooks/lib/config.ts` can be neither removed nor tested until it resolves. Unblocking action is one file read. |
| **MEDIUM** | `260807-2131_*_which-language-governs-a-customer-deliverable` (3 days) | `agents/editor.md:16,62` ships a default the three-way boundary in `rules/fusion-workbench-conventions.md` `## Project language` does not cover. No rule text names the deliverable case, so every editor dispatch without an explicit language resolves by silence. |
| **LOW** | `260810-0718_*_should-rebuild-map-merge-with-the-existing-map-or-replace-it` (new tonight) | Nothing shipped — the immediate defect (`260810-0457_*_rebuild-map-drops-a-colliding-plane-uuid-silently-unlike-the-migration-beside-it.md`) is closed and replace-with-loud-report is implemented. Hangs over three open siblings on the same flag (`260810-0746_*_push-plan-rebuild-map-fixture-writes-the-map-in-a-dry-run-that-four-documents-say-writes-nothing.md/0747/0748`). The record itself says to answer after the first real recovery. |
| **LOW** | `260806-1152_*_stash-manifest-dirname-and-pointer-content-duplicate` (4 days) | Nothing. The issue that carried the question is closed. Current state is coherent whichever way it goes; churn is the only cost. |
| *(out of shared scan)* | `260807-0945_*_integritaet-des-eskalationsspeichers` | Sits inside a `_c_` Circle. No shared-store scan reaches it, and the 16 out-of-scope open defects in five closed Circles have the same property. |

### Grounding drift found while surveying

`260809-2310_*_should-the-branch-policy-fall-the-way-the-write-classifier-fell` is still `_a_` and
carries an unfilled `Implemented: <set when status moves to _i_>` placeholder — but the answer
**shipped** in `7598073`, which landed after the 260809-2252 reconciliation and before this session
started. The transition is owed. Not applied here (the dispatch said report, not fix); the mechanical
form is `git mv` to `…_i_…` plus an `Implemented: 7598073` line.

---

## 8. The `260809-1731_*_how-should-the-domain-heuristic-count-a-projects-source-files.md` `_a_` → `_i_` transition — sound today, premature when made

- **`2910cf6` implements the chosen answer.** One mechanism, `git ls-files`, no `find` fallback, no
  `CLAUDE.md` declaration, `data_files` fixed in the same pass — all four narrowings honoured.
- **The fifth was not.** The `Answered:` block forbids a silent zero. At `2910cf6:134-135`
  `listing="$(git … | sort -u)"` reports `sort`'s status, and `sort` succeeds on the empty input a
  failed `git` leaves — so a git failure produced `code_files=0 data_files=0
  counted_by=git-ls-files`, exit 0. Filed as `260810-0459_*_fusion-count-sources-reports-a-measured-zero-when-git-fails-which-its-own-header-forbids.md` and fixed only in **`ea492e6`** (07:07),
  three and a half hours *after* the record was marked `_i_`.
- **`31d8bb3` preserves the answer.** It touches no counting code; it reorders the consuming cascade.
  Every evidence row in the decision still holds under the reorder.
- **Current tree matches the decision.** `bin/fusion-count-sources:180-195`, status read separately
  from `sort`, all failures routing to `report_unavailable` with exit 2. Live run here:
  `code_files=94 data_files=21 counted_by=git-ls-files`.
- **The record never existed as `_a_` on disk** — `31d8bb3` wrote the `Answered:` and `Implemented:`
  blocks and did the `_o_` → `_i_` rename in one commit.

**Verdict: keep `_i_`, but the `Implemented:` line under-cites.** It should name three commits —
`2910cf6` (the mechanism), `31d8bb3` (the cascade position that makes "keeps that missing number out
of the cascade" true), and `ea492e6` (the failed-count path, without which the absent-count contract
is half-described). Two factual corrections inside the block: it says `git ls-files --others
--exclude-standard`, the code is `--cached --others --exclude-standard` (`:188`); and it says this
repository counts 88, it counts 94.

**One caveat on "shipped":** `260810-0352_*_setup-step-5-now-calls-a-helper-the-installed-copy-does-not-have`
is still open. `$FUSION_PLUGIN_ROOT` points at `/Users/k1/.fusion`; `bin/fusion-count-sources` exists
only in this work tree. **An orchestrator session starting now gets exit 127 at Setup Step 5.** The
decision's mechanism is implemented and unreachable by a real session until `fusion --update` runs.

---

## 9. Counting discipline — the pattern nobody filed

Five independent count defects, four of them in artifacts this session wrote:

| Artifact | Says | Is |
|---|---|---|
| Turn 1 review totals table (`:169-176`) | 14 findings (3/6/5) | **17** (3 High / 7 Medium / 7 Low) |
| Turn 2 review range line (`:4`) | 6 commits | **5** (`ff70d3a..c923935`) |
| `260810-0508_*_fifteen-commits-landed-with-no-plugin-version-bump.md` title and body | fifteen commits with no version bump | **22** |
| `agentstate.yaml` / `orchestrator-live.md` / `tasklist.md` | 32 tasks / 32 / 34 records | three different denominators for one queue |
| Dispatch brief (inherited from the above) | 23 commits, filed 23, open ~41 | **22**, filed 32, open **46** |

`260810-0751_*_the-record-about-counting-instances-of-a-shape-gives-three-different-counts.md` — "the record about counting instances of a shape gives three different counts" —
is the Turn 2 reviewer filing this class against a Turn 1 record. The reviewer's own file then did
it twice. Filed as `260810-0820_*_the-turn-1-review-totals-table-says-fourteen-findings-and-the-body-carries-seventeen.md`.

---

## Version and release state

`plugin.json` reads **7.0.0**; tag `v7.0.0` points at **`8960e1a`**, the session's base. All 22
commits carry the version of the release they followed. `install.sh`'s documented
`FUSION_REF=tags/v7.0.0` pin therefore resolves to none of tonight's work, and `/plugin install`
cannot see it. `260810-0508_*_fifteen-commits-landed-with-no-plugin-version-bump.md` covers this and understates it by 7 commits.

---

## Files written by this pass

- `260810-0819_*_head-carries-six-records-twice-and-the-class-fix-was-deferred-to-a-decision-never-filed.md` (new)
- `260810-0820_*_the-turn-1-review-totals-table-says-fourteen-findings-and-the-body-carries-seventeen.md` (new)
- Reconciliation evidence appended to `260801-2038_o_`, `260810-0502_*_the-state-drift-lint-anchors-on-the-phrase-it-checks-and-one-negative-control-is-a-duplicate.md`, `260810-0503_*_the-domain-cascade-lint-is-defeated-by-a-decoy-branch-and-one-helper-has-no-negative-control.md`, `260810-0510_*_two-of-the-queue-ground-lints-negative-controls-re-implement-the-logic-instead-of-calling-it.md`
- `## Coherence` appended to `260810-0241-orchestrator-session.md`
- This file

**No marker was renamed.** Nothing was found closed-but-marked-open, and the three closure
*proposals* that exist (`## Close without work`) are the user's to accept, not mine to execute. No
code, data, prompt or rule file was touched.
