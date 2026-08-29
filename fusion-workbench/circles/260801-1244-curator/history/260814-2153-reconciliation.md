# Reconciliation — Circle `260801-1244-curator`, second Phase-3 pass

**Date:** 2026-08-14 21:53
**Agent:** reconciler
**Domain:** `code`
**Verified against:** the working tree at HEAD `d90b794`
**Session:** `260813-2345-orchestrator-session.md`, range `d7786eb..d90b794`, 29 commits, 6 Turns, 13 tasks
**Predecessor:** `260814-2017-reconciliation.md` (HEAD `41c224c`, verdict `review-needed`)
**Status:** Complete

---

## What this pass was

The first Phase-3 pass returned `review-needed` with the Artifact↔Grounding edge flagged, on two
open High findings and a red working tree. The user took the Rebalance gate and chose to revise the
Artifact, which opened Turn 6. Four commits landed. This pass is narrower than its predecessor by
design: it re-derives the two High findings from the tree rather than from their markers, covers
what the four commits changed, and re-issues the aggregate Coherence verdict.

**Nothing was taken on report, and that includes the closed markers.** Both records the first
verdict rested on now carry `_c_`; a marker is a claim, so each was checked against the tree
instead.

---

## Counts

| | Reviewed | Updated | Filed |
|---|---|---|---|
| Plans and specs | 2 in the Circle, both re-checked in full | 2 | — |
| Defect records | 41 in the Circle inventoried, 6 opened and checked individually; 96 open in `shared/` inventoried | 2 annotated | 1 |
| Decision records | 20 active across `$SCAN_DECISIONS` (2 in the Circle, 18 in `shared/`); 3 read in full | 1 annotated | — |
| Reviews | 7 in the Circle; the Turn-5 and Turn-6 files annotated per finding | 2 | — |

No marker was moved by this pass. Every record whose work landed had already been renamed by the
commit that landed it.

---

## The two High findings are closed, and here is how each was checked

### High 1 — the guard config pinned byte-identical to the template

Record: `260814-2022_*_this-repository-cannot-set-its-own-turn-budget-because-a-test-pins-fusion-guard-json-to-the-template.md`.
Closed by `f0d9d60`, which took option 1 of the three the record named.

Four checks, all run rather than read:

- `hooks/lib/__tests__/config.test.ts:1266` declares `const PROJECT_SET_KEYS = ["orchestrator"] as const;`
  and `withoutProjectSetKeys` at `:1369-1373` loops over that constant and nothing else, cutting each
  entry out of the **source text** of both sides. The comment at `:1363-1367` states why the cut is a
  text scan rather than a parse-and-reserialise: the round trip would normalise away the indentation,
  the blank lines and the key order, which are the things the comparison exists to hold still.
- `fusion-guard.json` at the project root carries `"orchestrator": { "maxTurns": 12 }` on line 2 and
  `git status --short fusion-guard.json` prints nothing, so the line is committed rather than in
  flight. That was the whole of the previous pass's finding.
- `diff fusion-guard.json templates/fusion-guard.json` differs on that one line and nothing else,
  which is what the new assertion permits and no more.
- `cd hooks && npm test`: **49 files passed, 1 030 tests passed**, 71.3 s. The tree is green, and so
  is HEAD, so the two now agree. The first pass's finding was precisely that they did not.

**What one green run does not establish.**
`260814-2118_*_the-hooks-suite-fails-differently-on-repeated-full-runs-and-does-so-on-clean-head.md`
records three agents meeting three different failure shapes under full-suite load, on clean HEAD,
one of them a file that never executed. That record is open, predates this Circle's work and is
caused by none of it. This pass ran the suite once and it was green; nothing about every run is
claimed from that.

### High 2 — the ten citations `bf9553f` staled

Record: `260814-2022_*_ten-citations-that-bf9553f-staled-still-stand-and-six-of-them-are-in-the-table-the-fix-corrected.md`.
Closed by `b90ea28`.

Every one of the ten target lines was read at HEAD by this pass, not sampled:

| Cited | What it holds at HEAD |
|---|---|
| `agents/orchestrator.md:434` | the planner dispatch that prefixes `**Executors:**` |
| `:449` | the taskplanner dispatch that passes the domain |
| `:495` | the `**Deliverable language:**` halt paragraph |
| `:706` | the reconciler dispatch that passes the domain |
| `:907` | the playmaker dispatch at Phase 4 |
| `:1454` | the `editor` row of the dispatch-routing table |
| `agents/shaper.md:89` | the marker-rename sentence |
| `:90` | the `Promoted: circles/<dir>` append |

Ten for ten. The three citations at `agents/orchestrator.md:337-339`, which `README-agents.md:66-68`
cite and which did not move, were read as well and are correct.

A repo-wide sweep for `agents/orchestrator\.md:[0-9]` and `agents/shaper\.md:[0-9]` outside the
workbench returns 16 citing lines across `README-agents.md`, `agents/playmaker.md` and
`rules/fusion-workbench-conventions.md`. Every one resolves at HEAD.

---

## What else the four commits changed, and what it left standing

**The growth bound was re-run a third time.**
`npx vitest run lib/__tests__/rules-emission-golden.test.ts`: 15 of 15 passing, no `RULE-TEXT BUDGET`
report for any role. `b90ea28` moved `rules/fusion-workbench-conventions.md` by +160 bytes and
regenerated `hooks/lib/__tests__/fixtures/rules-emission.golden` in the same commit, which is the
behaviour C10 was armed to produce. The head-room figure of 10 903 is the Turn-6 review's
arithmetic; this pass did not re-derive it.

**`CLAUDE.md:30` was checked against the two things it now claims.** The corrected row says the root
copy equals the template outside the top-level keys a project sets for itself, and that
`config.test.ts` pins exactly that by cutting `PROJECT_SET_KEYS` from both sides. Both halves hold:
the constant is `["orchestrator"]`, and the `diff` differs on that key alone.

**The Turn log is half repaired, and the masking recurred at a new pair of numbers.** `d270666`
added the Turn-5 bullet to the Circle record, so `## Turn log` now runs Turn 1, 2, 3, 3-continued, 4,
5 — six bullets. Turn 6 has no bullet, and the session history's `## Per-Turn Log` still carries only
`### Turn 1`, `### Turn 2` and `### Turn 3, continued`. `bin/fusion-state-drift` reports
`Circle Turn log surface=6 entries record=6 turns run`, `drift=0`, `verdict=clean` — six bullets
equalling six `turn_start` events by coincidence for the second time, because the continuation bullet
is counted as a Turn. That is exactly the second half of
`260814-2017_*_three-of-the-five-turns-…`, now confirmed by an independent second occurrence rather
than by its first. Both surfaces are the orchestrator's Phase-4 write; the reconciler may write
neither.

**`bin/fusion-review-coverage` reads `uncovered=1`.** `commits=29`, `reviews=7`, `unusable=1`,
`uncovered=1`, and the uncovered commit is `d90b794` — the commit that closed the Turn-6 review's own
High finding, and therefore necessarily later than the review that asked for it. Filed as a new
record; see below. The `unusable=1` is the conceptrev plan evaluation, tracked in
`shared/issues/260811-1145_o_*` and unchanged.

---

## One new defect record

`260814-2153_*_the-commit-that-closes-the-last-reviews-own-high-finding-is-the-one-commit-no-review-opens.md`

Every Turn's fix commits were opened by the *next* Turn's review. Turn 6 is the last Turn, so its fix
commit reaches closure unopened, and the coverage helper says so. The record separates this from
`260814-2033_*_a-resume-that-re-enters-at-phase-3-never-asks-whether-the-turn-it-skips-past-was-reviewed.md`, which names a path where a review never ran: here the review ran, on the correct
range, reported `not-opened=none`, and the uncovered commit exists *because* it had findings and they
were fixed. Three candidate answers are named and none is chosen, because the third of them changes
what a `**Reviewed-range:**` field asserts and would be a decision rather than a repair.

Filed in the Circle's own store per the Origin Rule: the cadence it describes is this Circle's.

**Severity Low, and the reason is stated in the record rather than assumed.** The uncovered commit
changes one clause of `CLAUDE.md` and adds records. This pass read that clause at HEAD and checked it
against `config.test.ts:1266` and against the `diff`. What is missing is a reviewer's independent
pass, not a verified claim.

---

## Files this pass wrote

| File | What changed |
|---|---|
| `260814-0845_*_plan-curator.md` | third reconciliation entry at HEAD `d90b794`; the previous entry's one open condition, the red working tree, discharged |
| `260814-0738_*_spec-curator.md` | third reconciliation entry at HEAD `d90b794` |
| `260814-2022-coderev-curator-turn-5.md` | per-finding annotation: F1, F2, F3 resolved with evidence; F4 standing |
| `260814-2128-coderev-curator-turn-6.md` | per-finding annotation: F1, F3 resolved with evidence; F2 standing |
| `260814-2017_*_three-of-the-five-turns-…` | re-measurement appended: half repaired, Turn 6 now missing from both surfaces, masking recurred |
| `circles/260801-1244-curator/issues/260814-2017_o_the-newest-decision-record-carries-no-…-footer-block-…` | re-checked at HEAD, stands unchanged |
| `260810-1635_*_where-does-the-obligation-sit-…` | a sixth instance of its class recorded, the Turn-6 F1; marker unchanged at `_a_` |
| `260813-2345-orchestrator-session.md` | third `## Coherence` entry appended (append-only; this pass's only cross-agent write) |

Plus the one defect record named above.

## What this pass did not touch, and why

`260801-1244-curator`, `fusion-workbench/agentstate.yaml` and the session
history's non-Coherence sections are outside the reconciler's write set. Four findings land on them
and stay as records for the orchestrator's Phase-4 write: the Circle record's title and
`## Dependencies` (`260814-0813_*_the-circle-records-title-and-dependencies-still-describe-the-conventions-file-as-the-validation-case.md`), its `## Grounding snapshot` lag on the answered growth-bound
decision (`260814-0828_*_the-grounding-and-the-spec-still-call-the-growth-bound-decision-open-after-it-was-answered.md`), the missing Turn entries (`260814-2017_o`), and the empty transition
block on the newest decision record (`260814-2017_o`).

**No marker was moved to `_c_` for a record whose remedy is a choice.** The one candidate in the
Circle, `260814-1850_*_the-halt-that-guards-the-audit-trail-…`, is correctly filed as a defect and
cites its closing decision `260814-1915_*_should-mode-3-require-the-audit-line-on-every-run-instead-of-testing-whether-it-was-dispatched.md`, which is still open and still carries no footer block.

---

## Coherence verdict

Computed at session end and written to `260813-2345-orchestrator-session.md`
`## Coherence` as a **third** entry. The two earlier entries are left exactly as written: the first
is the Turn-3 gate verdict, the second is the one the Rebalance decision was taken against, and
overwriting either would remove the record that decision rests on.

**Verdict: `coherent`.** All three edges are clean. Both conditions the previous verdict flagged are
discharged and were re-derived from the tree rather than from their markers.

**What is carried forward rather than flagged, stated so it is not read as having been missed.** One
open Low finding (the cut helper's untested branch, no live defect — the reviewer ran both branches
and both are correct); one uncovered commit whose content this pass verified independently; 21 open
defect records in the Circle and 96 in `shared/`; and the Turn-log entries the orchestrator writes at
Phase 4, which is downstream of this verdict. None of the four is the Directive going unmet, and none
is the Artifact contradicting its Grounding. Flagging the edge on the last of them would send the
user to a Rebalance gate over a bullet the closure itself is about to write.
