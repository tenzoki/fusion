# Pre-tag review — the weight helper, the curator's relocation, and the retired gate (11.5.0)

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Reviewed-range:** `8ffe3b23..d3ff530c`
**Not-opened:** none
**Review domain:** code

## Summary

Ten commits, five of them substantive: a sharpened placement criterion, relocation as a curator
change type, a new measuring helper, an eleventh `/fusion:check` selector, a retired gate, and the
test that landed under a ruled head-room raise. The suite is green — 56 files, 936 tests — and the
head-room raise is clean: no baseline moved, every figure in its log entry re-derives, and the raise
is the named event rather than a re-baselining wearing its clothes.

Two of the five land incomplete. **The eleventh check is invisible to the mechanism that makes a
check periodic** — `skills/setup/SKILL.md` still computes its due list from a ten-name array — so
`claude-md` runs only when a user types the command. And **relocation is authorised nowhere**: the
curator's `## Remit` still says two reasons and no third, and the apply pass has no procedure for the
case the work exists for. Eleven findings, none critical, three high.

**The range is taggable once `claude-md` is added to `SEL`** — a one-token change that turns a
half-wired feature into the one the release describes. The rest can follow the tag.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 3 |
| Medium | 5 |
| Low | 3 |

All eleven filed, `260916-1310` through `260916-1320`.

## Findings by theme

### A feature ships with one of its two halves wired

**`260916-1310` (High) — the eleventh check is absent from Setup's due list.**
`skills/setup/SKILL.md:86` carries `const SEL = [...]` with ten names; `claude-md` is not among them,
and `due = SEL.filter(...)` is the whole of what `checks_due=` names. So the selector is never due,
never reported, never run by the periodic path and never stamped by Setup. `skills/check/SKILL.md:8`
and `README-agents.md:220` both state the 30-day cadence as if it applied. Nothing gates the pair:
`derivable-enumerations-lint.test.ts` pins the skill roster and the agent counts and does not touch
the selector table, so the two enumerations parted in one commit with a green suite.

This is the release-blocking one, and it is one string.

### Relocation is a change type the prompt forbids, cannot trigger, and cannot apply

Three findings, one subject. Taken together a reader with only `agents/curator.md` cannot produce a
relocation entry, cannot tell when a run should produce one, and cannot apply one and have it
recorded `applied`.

**`260916-1311` (High) — `## Remit` admits two reasons and no third.** Lines 28-33 are the section
that decides what may be proposed at all, and they exclude in as many words the class relocation
belongs to: *"that it reads long, that it duplicates a neighbour"*. The new text agrees it is that
class — line 92, *"Judging that a passage is bound to a topic is a reading of the current text"*, and
line 319, *"a relocation makes no claim about truth … what is being judged is where it belongs."* An
explicit prohibition and an implicit permission, with nothing deciding between them. The same finding
carries the trigger gap: `### Pass 1 — survey` (175) assigns a tier per candidate and a relocation has
none, `## Dispatch parameters` (258) selects nothing, and the run file's fourth section (287) is
*"written only on a run that proposes a relocation"* — presupposing an answer the prompt never gives.

**`260916-1312` (High) — an in-remit relocation is `stale` by its own rule.** Line 92 states, with no
scope on it, that a relocation *"is `stale` unless that other file already carries it"*. `### Pass 2
— apply` (210-216) contemplates one write per entry and never writes a destination. So a relocation
from `CLAUDE.md` into a project rule file — both surfaces the curator edits, `## Scope` 335-341, and
the motivating case for the whole change — is stale permanently. The only ordering rule sits inside
the bullet for destinations **outside** the three surfaces (238), whose closing clause *"since there
is no destination write of yours to read afterwards"* presupposes a case no section authorises.

**`260916-1313` (Medium) — Pass 2's post-write comparison marks every relocation `failed`.** Line 212:
compare the written region byte for byte against the ledger's After block. Line 317: for a relocation
the After block is the **destination's** text and the **pointer** is what lands at the source. The
correction exists — the last sentence of the out-of-remit bullet at 238 — and lives in a section about
work the curator may not do, which a reader executing an in-remit apply has no reason to open.

The already-filed `260916-1157_*_nothing-tells-the-curator-where-the-placement-criterion-is-authored.md`
is the fourth member of this set and is not re-filed.

### One question, three answers: how a file is divided by heading

**`260916-1316` (Medium).** The unit everything here is judged on is stated three times and two of the
three answer differently.

- `rules/context-lean-claude-md.md:148` — *"Use `## ` where that is the file's top heading level,
  `### ` where the file's headings start one level deeper"*. Two branches, and no branch for a `# `
  document title — which is what fusion's own `CLAUDE.md` opens with, the file both worked examples
  in that same section are taken from.
- `bin/fusion-claude-md-weight:81-87` — *"the shallowest level with at least two headings, falling
  back to the shallowest present"*, and its header claims at 88-91 that this produces the unit Step 1
  fixes. On a file with one `##` and three `###` headings the two part: the rule says `##`, the helper
  prints `heading-level=3` (verified against a scratch file).
- `agents/curator.md:287` — *"One line per top-level heading of the surface a passage is leaving"*, a
  third spelling with no pointer to either.

The section that carries the first states its own purpose as *"two people applying it to the same file
reach the same answer"*. That is the standard it is measured against here.

### A gate retired on an argument that covers half of what it removed

**`260916-1315` (Medium).** `da1c62ed` deleted `claudeMdDrift()` and both its cases. The open
direction is genuinely redundant — `CLAUDE.md` is in the `surfaces` array of the phantom-skill check
(`derivable-enumerations-lint.test.ts:91`). The closed direction is not: the surviving check asserts
set equality against **`README-agents.md`** (line 85), and nothing anywhere asserts that `CLAUDE.md`
names every skill directory. The property holds at HEAD — all thirteen are named — and nothing holds
it there.

It does not stay quiet, because `CLAUDE.md:21` still says the lint *"asserts the match in the other
direction too, which is why every body under `skills/` is named here."* `CLAUDE.md` is untouched in
this range, so the tag ships a surface describing a gate that was removed four commits earlier. The
retirement comment names step 8 of the implementation plan as where that passage goes; the tag falls
between the gate and the passage.

### A new mechanism whose test pins its banner and not its measurement

**`260916-1314` (Medium).** `claude-md-weight.test.ts`'s nine cases assert exit status on seven
invocations, three banner regexes, `writes=none`, two line counts and the last two lines of the
weighed shape. No case reads a figure the helper computed. Three documented clauses were checked by
mutating a copy of the helper in a scratch directory; all nine cases hold for each mutant:

- rows printed smallest-first instead of largest-first (`sort -k1,1n`);
- only the over-threshold rows printed, against *"every section is printed"*;
- `heading-level=` deleted from the report.

The only assertion touching a row is line 129, `…filter(/^ {2}(over|under) /).join("\n")` matched
against `/topic/i`, which the empty string satisfies — so it holds when no row is printed at all. And
one clause is pinned only by an assertion true under its own inversion:
`expect(run("--threshold","not-a-number").status).toBe(0)` holds whether or not the digit check
exists, and without it the helper reports `claude-md=clean … threshold=not-a-number` for a file it
never weighed.

The measurement itself is correct at HEAD. A fence, a `#`-only file, a file with no trailing newline
and an empty file were each run by hand and each answered correctly, and the row bytes sum to `wc -c`
in every case. What is missing is anything that keeps it so.

### Three statements that do not survive being checked

**`260916-1317` (Medium)** — `config.test.ts:705` and `:885` say this repository's `fusion.json`
declares `orchestrator.maxTurns`. It declares `citations` and nothing else, and has since `e6a0dc67`
(2026-09-10, first tagged v11.0.0). So the `orchestrator` member of `PROJECT_SET_KEYS` cuts nothing,
and `CLAUDE.md`'s `fusion.json` row states the opposite in as many words. Reached through the
carry-forward, not through the range.

**`260916-1318` (Low)** — `README-hooks.md:556`: *"stripped of every comment and every blank line the
file is still 84 lines … still leaves it 51 over."* 131 lines minus 23 blank, 24 `//` and 3
single-line `/** … */` is **81**, so 48. The 3-line gap is exactly the JSDoc lines. The argument
survives; the figure does not, and the same section was corrected for the same class four hours
earlier (`260916-0734`).

**`260916-1319` (Low)** — `hooks/lib/citation-corpus.ts:141-145` describes `portfolio.md` as a live
artifact kind. Nothing has written one since v11. Its sibling at `staging-drift.ts:216` carries
*"until v11 removed both"*; this one does not.

**`260916-1320` (Low)** — `README-hooks.md:473` promises the per-dispatch-path bound *"its own section
below"* and the file has none; the bound is named three more times as documented elsewhere. It is
authored in `rules-emission-golden.test.ts:1030`. Pre-existing (`a5bb2a63`), and it matters because
`CLAUDE.md` routes readers to this very section for what every surface is bounded at — and the bound
it omits is the zero-head-room one a `CLAUDE.md` edit meets first.

## What checked out, stated because it was checked

**The head-room raise is the event the rule describes, not a re-baselining in its clothes.** The diff
to `surface-growth-bound.test.ts` is four lines: the constant and its doc comment. No baseline moved.
Every figure in `README-hooks.md` `#### The head-room raises, and the reduction read on 2026-10-10`
re-derives:

| Claim | Verified |
|---|---|
| `TEST_LINE_HEAD_ROOM` 2 595 → 2 693, +98 | the diff |
| floor 19 228 | summed over `TEST_LINE_BASELINE`, 50 entries |
| budget 21 921, surface 21 921, zero margin | the `.ts` line count under `hooks/lib/__tests__/` at `d3ff530c` |
| 131 lines against 33 of margin | surface 21 790 at `da1c62ed`; 21 823 − 21 790 = 33; 131 − 33 = 98 |
| the retired gate freed 24, not the 31 estimated | `git show --numstat da1c62ed`: +6/−30 |
| 9 lines of margin at `92cd2491` | surface 21 814; 21 823 − 21 814 = 9 |
| derived 2 500, +193 still standing, restore target 21 728 | arithmetic |

**The reference-resolution pin's three entries in this range are internally consistent and their
stated method is the one that was used.** paths 1 542 → 1 556 → 1 560 → 1 565. The fourteen of the
first entry decompose as the helper's nine and the roster row's five, and the measured swap deltas are
4 and 9 rather than 5 and 9 — the entry names the single interaction that accounts for the missing one
(the roster row cites the helper, so with the helper gone that token dangles). The helper's nine were
counted independently: `CLAUDE.md` five times on comment lines (2, 7, 19, 56, 95),
`rules/context-lean-claude-md.md` twice, `bin/fusion-plan-size` and `bin/fusion-review-coverage` once
each. The gate passes at HEAD, 38 tests.

**The helper's own arithmetic.** Byte totals equal `wc -c` with and without a trailing newline; the
fence skip works; `heading-level=` falls back as documented on a file whose headings are all unique;
an empty file reports a clean zero. `LC_ALL=C` is exported before `awk`, so `length()` counts bytes.
The `sort -k3` tie-break does compare the heading text under default field splitting.

**Packaging.** `bin/fusion-claude-md-weight` is tracked, mode 100755, and `git check-ignore` does not
match it — the `.gitignore` negation landed. `committed-dist.test.ts` passes, so the six `hooks/dist/`
files carried forward from the previous pass are the compilation of their committed sources.

## Cross-cutting observations

**Two of the three bounded surfaces are at or next to zero, and the third is not close.** Measured off
`fixtures/surface-growth.golden` at `d3ff530c` against the baselines in the same file:

| Surface | Now | Budget | Margin |
|---|---|---|---|
| hook tests | 21 921 lines | 21 921 | **0** |
| `skills/*/SKILL.md` | 213 678 bytes | 213 679 | **1** |
| `agents/*.md` | 273 999 bytes | 328 567 | 54 568 |

The range spent 1 081 of the skills surface's 1 082 bytes of margin on `skills/check/SKILL.md`. Every
finding above that asks for shipped text lands on one of the two surfaces with nothing left, which is
the condition the open issue
`260916-1126_*_the-specs-stop-clause-measures-the-skills-surface-while-the-binding-one-is-the-hook-tests.md`
already names. Sequencing the fixes without a fresh raise means finding the bytes first.

**Three of the eleven findings are one enumeration drifting from another with no gate between them**:
`SEL` against the selector table (1310), the retired closed-direction assertion against `CLAUDE.md`'s
description of it (1315), and `PROJECT_SET_KEYS`'s exemption against the file it exempts (1317). The
project has a lint whose whole subject is derivable enumerations, and this range both removed an
assertion from it and created a pair it does not cover.

**Four findings are a statement that was true when written and is checked by nothing**: 1315, 1317,
1318, 1319. Each sits in a file the citation gate reads for citations and nothing else. That is the
standing gap, not a new one.

## Recommended sequencing

1. **Before the tag:** `260916-1310`. One string in `skills/setup/SKILL.md:86`, no surface cost.
2. **Before the tag, or named in the release commit as shipping:** `260916-1315`. `CLAUDE.md` ships a
   sentence describing a gate that no longer exists; the cheap half is the `CLAUDE.md` sentence, which
   step 8 of the plan reaches anyway.
3. **Next session:** `260916-1311`, `260916-1312`, `260916-1313` together — relocation is unusable
   until all three are answered, and they are one edit to `agents/curator.md`. `260916-1316` belongs
   with them: the criterion the curator will cite has to say what a passage is.
4. **When the hook-test surface has room:** `260916-1314`.
5. **Cleanup:** `260916-1317`, `260916-1318`, `260916-1319`, `260916-1320`.
