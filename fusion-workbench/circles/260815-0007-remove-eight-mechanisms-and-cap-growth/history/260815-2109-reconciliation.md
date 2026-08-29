# Reconciliation — the Coherence verdict re-run after the Grounding revision

**Date:** 2026-08-15 21:09
**Agent:** reconciler, domain `code`
**HEAD:** `d2b45e1`
**Range:** `9a7da8e..d2b45e1`, 35 commits
**Scope:** re-compute the three-edge verdict. One tracking-file repair, one decision filed, one issue annotated. No code, no data, no commit.
**Dispatch:** follow-up to the Rebalance gate of Circle `260815-0007-remove-eight-mechanisms-and-cap-growth`, asking only whether the verdict changes.

---

## 0. The commit count, corrected for the second time

The dispatch named **38** commits. `git rev-list --count 9a7da8e..HEAD` returns **35**. Every
figure in this pass and in the appended verdict is taken against 35. This is the second such
correction in the same session — the first verdict was dispatched with 34 against an actual 32 —
which makes it a pattern rather than a slip, and worth naming: the dispatching count and the git
count have disagreed on both occasions, in the same direction, by two to three.

---

## 1. Verdict

**`coherent`.** Changed from `review-needed`. Recommendation: **none**.

The `Grounding↔Directive` flag is discharged on evidence. The `Artifact↔Grounding` flag is
**re-characterised rather than discharged** — see §4, which is the substance of this pass and the
question the dispatch actually put.

---

## 2. What was verified at HEAD, by measurement

Nothing below was read off a marker or a footer.

| Claim | Verified | Result |
|---|---|---|
| Suite green | `cd hooks && npm test` | **40 files / 751 tests**, 57.26 s — unchanged from the first verdict |
| Conventions growth cost | `git show bd07ee7:rules/…` vs `wc -c` | 53 399 → 54 160 = **761 bytes**, exact |
| Cap head-room | always-on set vs `RULE_BASELINE` (86 573) | 88 679, delta 2 106, **9 894 left** of 12 000, exact |
| `Retired:` defined at three places | `grep -n "Retired" rules/fusion-workbench-conventions.md` | `:328` marker row, `:432` annotation form, `:520` template footer |
| 25 records annotated | `grep -rl "^Retired:" --include="*_i_*.md"` | **25**, exact |
| No stray annotation | the 26th grep hit | the new `260815-2056_*_` decision's own empty template footer — correct, not a false positive |
| `260814-1332` transitioned | filename + header + body | `_i_`, `**Status:** implemented`, `Answered:` cites the gate, `Implemented:` cites `c8eac96` |
| `_i_` population | `find … -name "*_i_*.md" -path "*decisions*"` | **64** = the 63 enumerated + this record |
| Turn-4 entry carries its range | `_t_circle.md:218` | `commits 9955e8f..9306f0a` |
| Active-plan pointer | `_t_circle.md:7` | names the `_c_` path |
| Last step landed | `agentstate.yaml` `work_queue` | P-15 `done` at `9306f0a` |
| Plan closed | `260815-0029_*_…` | `**Status:** Complete`, 20 `[DONE]` markers |
| `docs/` + `README*.md` reduction | byte sum at `9a7da8e` vs HEAD | 153 101 → 137 699 = **15 402**, confirming the recorded 23 534 is stale |

Both figures the dispatch asserted — 761 bytes of cost and 9 894 of head-room — reproduce to the
byte. The three orchestrator bookkeeping items it reported fixed are fixed.

---

## 3. The review gap, measured rather than restated

`./bin/fusion-review-coverage --since 9a7da8e` returns `commits=35 reviews=9 unusable=1
**uncovered=9**`. It was 6. It grew.

The number is padded, and saying so is not a defence of it — it is the difference between a figure
that can carry a rule and one that cannot. **Four of the nine touch no shipped file at all:**

| Commit | Shipped files | What it is |
|---|---|---|
| `c1e207d` | **0** | the Turn-4 review file itself |
| `9cde86c` | **0** | the after-measurement record |
| `bd07ee7` | **0** | the first reconciliation's tracking writes |
| `d2b45e1` | **0** | the decision's `_a_`→`_i_` transition |

**Five touch shipped files**, and these are the real gap:

| Commit | Shipped files | Weight |
|---|---|---|
| `5f2171e` | 3 — `.gitignore`, `agents/orchestrator.md`, `skills/setup/SKILL.md` | prompt-text fix |
| `e8052e7` | 5 — `CLAUDE.md`, `README-agents.md`, `rules/fusion-workbench-conventions.md`, golden, one lint test | **passed the G1 user gate** with an evidence-tiered ledger |
| `0609945` | 6 — 2 new test files, 1 new helper, `CLAUDE.md`, `README-hooks.md`, golden | **new mechanism in a removal Circle** |
| `9306f0a` | 7 — `plugin.json`, `CLAUDE.md`, `README.md`, `docs/upgrading-to-v9.md`, `install.sh`, `skills/help/SKILL.md`, golden | release prep; `install.sh` is the pin-example comment only, verified |
| `c8eac96` | 2 — `rules/fusion-workbench-conventions.md`, golden | the 761-byte `Retired:` definition |

---

## 4. The question the dispatch asked, answered plainly

**Does an unreviewed cap-arming commit prevent this Circle from closing coherent?**

**No. It is a residual a closure note can carry.** The reasoning, and the part of it that runs
against my own two prior verdicts:

**`0609945` is unreviewed. It is not unexamined.** Four defect records stand against it, filed by
reconciliation, each with reproduction steps produced by running the mechanism rather than reading
it:

- `260815-1935_*_the-hook-test-growth-bound-reads-two-directories-and-a-test-file-in-a-third-runs-unbounded.md` — **High.** `surface-growth-bound.test.ts` reads `__tests__/*.ts` and
  `__tests__/helpers/*.ts` only, while Vitest's include is recursive. A test file in a third
  subdirectory runs and is uncounted. Demonstrated with 3 002 lines, 120 % of that surface's entire
  head-room, all twelve assertions green.
- `260815-1942_*_nothing-detects-a-raised-growth-baseline-and-the-only-bound-on-one-is-a-comment.md` — the three baseline maps are asserted on by nothing; the doctrine forbidding a
  silent raise lives in a comment. Filed with the honest note that the golden/baseline separation
  itself was verified by execution and **works**.
- `260815-1939_*_the-caps-rate-and-percentile-inputs-do-not-reproduce-from-git-while-every-point-figure-does.md` — the head-rooms' worst-day inputs reproduce from git exactly; the sustained-rate
  and percentile inputs do not, off by 1.5× and 8×.
- `260815-1941_*_the-after-measurements-rules-before-row-was-taken-two-days-after-the-anchor-its-two-neighbours-use.md` — the motivating table's `rules/` before-row was taken at an anchor two days off
  its two neighbours: −7.5 %, not −10 %.

That is more scrutiny than a coderev pass usually delivers. A rule that blocked closure for want of
a review *file* would have blocked it over the one commit in this session that received the most.

**The High finding is latent, not active, and both halves must be said.** Verified here:
`hooks/lib/__tests__/` holds exactly two subdirectories, `fixtures/` and `helpers/`, and all 44
`.ts` files sit in the two directories the bound reads — 40 at the top, 4 in `helpers/`. Nothing is
uncounted at HEAD. The hole is a future escape. A closure note that says only "High, cap bypassable"
leaves a reader believing the cap does not work; one that says only "latent" leaves nobody fixing it.

**The cap was demonstrated working on two of three new surfaces, by execution.** `skills/` at
`9306f0a` — an 897-byte edit turned the suite red and the fixture was regenerated with the baseline
unmoved. `agents/` in `260815-1942_*_nothing-detects-a-raised-growth-baseline-and-the-only-bound-on-one-is-a-comment.md`'s reproduction — two restored agent prompts failed the bound
at 18 000 bytes of head-room. That is behavioural evidence at HEAD on precisely the property a
reviewer would have been trying to establish.

**What I am not claiming.** The gap did not shrink; it grew from 6 to 9, and I am not calling it
closed. The user's choice to stop the review dispatch is information, not absolution, and it does
not appear anywhere in the reasoning above as a reason. What changed between the first verdict and
this one is not the user's decision — it is that I can now say what is inside the gap, commit by
commit and shipped-file by shipped-file, which the first verdict could not.

**Where I could be wrong**, flagged rather than buried: I have not measured whether reconciliation
reliably substitutes for review. One Circle is not evidence that it does. If the next two Circles
close over uncovered ranges and reconciliation finds nothing in them, that is evidence against this
verdict's central move.

---

## 5. Files written

**One tracking-file repair.** `agentstate.yaml:26` — `current_task.source_file` named
`260815-0029_*_plan-…`, a path that no longer exists; its sibling `plan_context.plan_file`
already named the `_c_` path. Repointed. This is a live field a resume reads, which is why it was
fixed on sight while the other 40 dangling citations were not (§6).

**One decision filed.**
`260815-2109_*_may-a-circle-close-over-an-uncovered-review-range-and-who-decides.md`.
Three Coherence verdicts in this one session decided this ad hoc — two flagging the edge, one not —
on reasoning defensible each time and inconsistent across the three. `bin/fusion-review-coverage`'s
own header names the decision as unfiled and declines to pre-empt it; no decision record anywhere in
the workbench owns it. Filed to `shared/` rather than this Circle's store per the Origin Rule: its
instances (`260814-2017`, `260814-2033_*_a-resume-that-re-enters-at-phase-3-never-asks-whether-the-turn-it-skips-past-was-reviewed.md`, `260814-2153`) predate this Circle. Four options,
recommendation options 3 and 1 together, at moderate confidence, with the conflict of interest stated
in the record — I raised this edge twice and am recommending the option that stops it blocking.

**One issue annotated.**
`260815-1913_*_closing-the-plan-dangles-thirty-four-workbench-citations…` — re-measured at 57
occurrences, or 41 excluding the two append-only event streams. Stays open; the title was
deliberately not corrected, since renaming it would create the very class it describes in the four
places that cite it.

**One history file appended.** `260814-2306-orchestrator-session.md`, a third
`## Coherence` section. The two earlier ones were left byte-for-byte intact.

**And this file.**

---

## 6. Considered and not done

- **The 40 remaining `_o_`-plan citations.** History files, closed issue records and review files
  that name the plan under the marker it carried when they were written. Correct as written; a
  rewrite would falsify the record.
- **No marker renamed on any decision or issue.** Nothing this pass verified moved a record's state.
- **The release hand-off is real and is already recorded**, so it was re-measured and not re-filed:
  `git tag --list` still stops at `v8.2.0`, and the marketplace clone still reads `8.2.0` against
  this repo's `9.0.0`. Both are steps 3–5 of the documented release process in another repository,
  named in the plan's own reconciliation log at `:514` as a scope judgement rather than an error.
- **The stale `docs/` + `README*.md` row was re-measured (15 402) and not repaired.** The closure
  note does not exist yet; it is Phase 4's write, and its issue is open and carries the figure.
