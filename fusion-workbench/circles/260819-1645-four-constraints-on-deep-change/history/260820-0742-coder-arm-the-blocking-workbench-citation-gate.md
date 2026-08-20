# Arm the blocking workbench citation gate

**Status:** Complete
**Agent:** coder
**Circle:** `circles/260819-1645-four-constraints-on-deep-change`
**Step:** 9 of `circles/260819-1645-four-constraints-on-deep-change/planning/260819-2016_*_four-constraints-on-deep-change.md`, plus the convention line from the recurrence answer at the foot of `circles/260819-1645-four-constraints-on-deep-change/issues/260820-0530_*_twenty-six-citations-in-the-corpus-are-statements-rather-than-pointers-and-no-exemption-expresses-that.md`
**HEAD at start:** `0d4e0f2`

---

## What was built

`hooks/lib/__tests__/workbench-citation-lint.test.ts`, 241 lines, the second caller of
`scanRecordCitations`. It asserts zero violations over the live workbench corpus, recomputed
from the tree on every run, with no baseline and no approvable number — decision
`circles/260819-1645-four-constraints-on-deep-change/decisions/260819-1645_*_what-defines-the-citation-gates-corpus-and-what-happens-when-a-marker-move-changes-it.md`
option 1, as answered. Eight cases: the zero-violation assertion, the `WORKBENCH_PRESENT`
degradation, a vacuity guard, and five that pin the corpus predicate itself.

## The corpus, written as a marker predicate

Four regular expressions in the test file, not the word "open":

| kind | predicate |
|---|---|
| Circle record | `circles/<dir>/_[atcbsd]_circle.md` — **every** state |
| issue | `issues/YYMMDD-HHMM_o_*.md`, in a Circle store or `shared/` |
| decision | `decisions/YYMMDD-HHMM_[oa]_*.md` |
| portfolio | `portfolio.md` at the workbench root |

`archive/` is excluded.

**It takes the wide reading of "the open decisions" — `_o_` or `_a_`.** The reason is written
into the file at length and is this project's own, not a preference: `## State Markers —
decisions` of `rules/fusion-workbench-conventions.md` states that `_o_` and `_a_` together are
Grounding-Stand and that a pass listing active Grounding filters on exactly those two. An
answered decision awaiting realisation is a document people still open. Two further reasons,
in descending weight: the wide reading is a superset, so it can only judge more, and it is the
reading plan steps 5 through 9b repaired against, deliberately, so that the arming would
satisfy either answer.

**Measured against step 9b's figures rather than assumed.** The predicate reproduces them
exactly at HEAD `0d4e0f2`: wide 192 files / 921 gate-judged tokens, narrow 172 / 822, zero
violations in both. After the `stamp-name` widening the same predicate gives wide 192 / 1 017,
narrow 172 / 912, still zero.

## The failure message

Written as the mechanism the recurrence answer says it is, in the shape `BASELINE_MESSAGE`
uses: name what is expected, then name what is not. It carries all three legs — correct a
pointer; for a statement *about* a citation, name file and line or fence the verbatim form;
and adding a file to `RECORD_EXAMPLE_FILES` is not the answer, with the reason (it exempts the
file's later citations too, and the records likeliest to trip this gate are the records about
stale citations).

## `GATE_KINDS` widened, and what it cost

`stamp-name` joins the list in `hooks/lib/__tests__/helpers/citation-scan.ts`, per decision
`circles/260819-1645-four-constraints-on-deep-change/decisions/260819-2016_*_does-the-citation-gate-judge-the-stamp-name-class-which-scanrecordcitations-does-not-read.md`
option 2. `stamp-bare` is now the only kind outside the gate, and it is outside by argument
rather than by accident.

**The sibling lint's pinned counts moved, so `BASELINE` was re-approved with the note its own
convention requires**, naming this step and the class. `paths` 1179 → 1180, `anchors` 155 →
156, `records` 104 → 109. Two disjoint causes, attributed separately in the note:

- **the widening**, records +3 — three `stamp-name` tokens that already resolved in the
  measuring view and were filtered out of the gate's count on their way past:
  `docs/upgrading-to-v10.md:41`, `docs/upgrading-to-v9.md:31`, `skills/cadence/SKILL.md:136`.
  Eight further `stamp-name` tokens on the shipped surface are `exempt` (seven announced
  illustrations, one fenced) and contribute nothing.
- **the convention line**, paths +1 / anchors +1 / records +2 — one path
  (`rules/circle-records.md`), one anchor into it, and its two record citations.

The two sum exactly, because the widening changes no file's text and the convention line adds
no `stamp-name` token. Stated in the note as not a general rule.

**What did not move, measured rather than assumed:** the new gate file itself contributes zero
to the sibling's counts. `surface()` walks `hooks/` and `hooks/lib/` file by file and never
enters `__tests__/`, so the dozen record citations in the new file's header are read by no
class there.

## A departure from the dispatched file set, and why

The widening reddened the sibling lint on **two shipped-text files the dispatch did not name**,
which is precisely the "second, unmeasured repair arriving inside a step" the answered
decision's own recommendation feared. It came to two tokens, both dangling, both illustrations
that a real stamp made look like pointers:

- `rules/context-manifest.md:110` named a Circle `260718-1924-ontology-refactor` that has never
  existed, spelled with the real stamp of `260718-1924-v5x-overhaul`. It now reads
  `YYMMDD-HHMM-ontology-refactor`, the form the same paragraph already uses two lines above,
  which produces no token at all. This is a correctness fix as much as a gate fix: the old
  spelling made a false claim to a human reader too.
- `skills/log-activity/SKILL.md:86` illustrates stamp parsing with `260408-1523-topic.md`,
  where the digits **are** the illustration and cannot be replaced. It gained the `e.g.` that
  the existing `announced-illustration` exemption reads. +5 bytes on the `skills` surface.

No exemption was added and no file was allowlisted. Both edits are text, not scanner.

Two unit cases in the sibling lint encoded the old contract in words — one asserted that a
stamp carrying a name "still never reaches the gate" — and were rewritten rather than deleted,
with the boundary's move and its date stated at the describe block. A third case was added: a
`stamp-name` naming nothing is now a violation. The token-for-token case carried a local
restatement of `GATE_KINDS` that was **already stale** before this step — it listed three kinds
and had never learned `circle-record` from step 8b, passing only because the shipped surface
carries no such token. It now lists five, with a note saying the literal is deliberate.

## The convention line

One paragraph at the end of `## Marker globs` in `rules/fusion-workbench-conventions.md`: a
record that states something *about* a citation names file and line, or fences the verbatim
form. It points at `rules/circle-records.md` `### Citation form in the portfolio` for the
star-a-pointer test rather than restating it, and gives one worked address as the example.

**Byte delta: 55 213 → 56 200, +987 bytes**, on an always-on rule emitted to every agent on
every dispatch. `rules/` is outside the three bounded growth surfaces, but the always-on rule
set has its own bound in `rules-emission-golden.test.ts`, and it is green — the golden was
regenerated, which does not move `RULE_BASELINE`.

## Demonstrated failing

In a detached git worktree at HEAD with this step's files copied in, never in the live tree.
Green there first, then three separate breaks, each reverted before the next:

**1. A stale marker in `portfolio.md`** — one live citation's `_*_` changed to `_o_` against a
record now carrying `_a_`. The zero-violation case reddened, and nothing else:

```
  portfolio.md:52  'circles/260819-1645-four-constraints-on-deep-change/decisions/260819-1645_o_what-defines-the-citation-gates-corpus-and-what-happens-when-a-marker-move-changes-it.md'
    stale marker '_o_': the record now exists as circles/260819-1645-four-constraints-on-deep-change/decisions/260819-1645_a_what-defines-the-citation-gates-corpus-and-what-happens-when-a-marker-move-changes-it.md
    -> cite the marker position as '_*_' (decision 260806-0015, wildcard form)
```

The message printed above it named all three remedies in full.

**2. A `stamp-name` naming nothing**, inserted at `portfolio.md:6` — this is the widening,
demonstrated connected rather than asserted:

```
  portfolio.md:6  '990101-0101-no-such-circle'
    no artifact and no Circle directory carries this name
    -> cite the record's full path, or drop the token
```

**3. `.fusion-setup` moved aside.** Two cases reddened and five were skipped:
`degrades loudly, not silently, when the workbench is absent` — *"fusion-workbench/.fusion-setup
not found — the workbench citation gate scanned nothing. Run /fusion:setup, or check out the
tracked fusion-workbench/ directory."* — and the vacuity guard, *"no citation in the corpus
resolved — the parser is not running"*. The zero-violation case passed, which is exactly the
silent pass the second case exists to prevent: with no workbench every token is
`unresolved-no-workbench` and no violation is produced.

## Head-room

Hook-test surface: **768 lines left.** It stood at 1 099 at HEAD `0d4e0f2`, which reproduces
the figure the dispatch carried. This step spent 331, all of it accounted for: the new file's
241, `helpers/citation-scan.ts` 832 → 857 (+25, the widened `GATE_KINDS` and the reasoning
above it), and `reference-resolution-lint.test.ts` 1 173 → 1 238 (+65, the re-approval note and
the three boundary cases). `agents/` and `skills/` were not touched beyond the +5 bytes above.

**Added 260820** (`coder`, Circle Turn 2). This section reported "green" for the always-on rule
set and stopped there, while every step that touched the hook-test surface reported a number.
The missing figure, on the more expensive of the two surfaces, is the defect
`circles/260819-1645-four-constraints-on-deep-change/issues/260820-0805_*_the-step-that-spent-the-always-on-rule-budget-reported-green-without-the-figure-its-siblings-report.md`.

Always-on rule set: **6 206 bytes left**, and the spend above was 987 of them. Measured today,
and the five files are untouched since this step, so the figure is this step's own outcome. The
core stands at 92 367 bytes — `agent-setup.md` 3 499, `fusion-workbench-conventions.md` 56 200,
`decision-record-examples.md` 4 522, `user-facing-output.md` 18 205, `critical-stance.md` 9 941
— against a `RULE_BASELINE` floor of 86 573 and a `GROWTH_BUDGET` of 12 000, so the cap is
98 573. Before the spend the surface stood at 7 193, which reconciles exactly against the +987.

*One figure that circulated is a different quantity, not a disagreement.* The reconciliation
pass of 260820-0830 reported 99 720 bytes by `bin/fusion-rules coder | xargs wc -c`. That
command is the whole floor a dispatch pays in this repository, and it includes this project's
own chat voice profile at 7 353 bytes: 92 367 + 7 353 = 99 720. The bound measures the five
shipped core files alone, because a project-side profile is not the plugin's text to bound.
Read the first number against `RULE_BASELINE` and the second as what a dispatch costs.

## What was not done

- **No count pin of any kind**, in any form. The vacuity guard is `> 0` and `> 0` deliberately,
  not a floor that could drift into something re-approvable.
- **No file allowlist**, no new exemption, no change to what a citation means.
- **No plan step marked, no marker transitioned, nothing committed.**
- The two measuring scripts lived in the session scratchpad, never under `hooks/`, so neither
  reaches the growth bound.

## Verification

`cd hooks && npm test` — **exit 0**, 39 test files and 701 tests passed. Output redirected to a
file, so the exit code read is the process's own.

**Three full runs, and the middle one was red — recorded rather than quietly dropped.** It
failed on `monitor-warnings-panel.test.ts`, `Error: connect ECONNREFUSED ::1:49152`, a port
bind on the IPv6 loopback. It touches nothing this step changed, it passed in the run before
and the run after, and it passed alone on re-run. It is reported as a flake on that evidence
and not as a pass: the claim here is "green twice with one unrelated port-bind failure in
between", not "green".

**A stale git worktree from another session sits at
`/private/tmp/claude-502/-Users-k1-Projects-productive-fusion/dc1791e8-.../scratchpad/wt`,
detached at `3a0408a`.** It is not this step's — this step's worktree was removed and pruned —
and it was left alone. It is named here because a second checkout binding the same monitor
port is one candidate explanation for the flake above, and because `git worktree list` will
keep showing it until somebody prunes it.
