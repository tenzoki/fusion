# Code review — Turn 1: the documentation corrections and the `bin/` roster gate

**Sender:** coderev
**Date:** 260813-1929
**Reviewed-range:** `6590cd5..79ec7bb`
**Not-opened:** none
**Circle:** `260813-0910-documentation-matches-shipped-plugin`
**Plan:** `260813-1820_*_documentation-matches-shipped-plugin.md`, steps 1-3

## Summary

Turn 1's three commits do what the plan's steps 1-3 say, and the four numeric claims they turn on were re-measured here rather than taken from the step notes. The historical byte measurement at `CLAUDE.md:64` reproduces to the byte against the removal commit, the five new `bin/` rows each cite an authoring home that genuinely documents that helper, and the new lint block survives four mutation probes. Seven findings, none of them a release blocker: one Medium (a claim about what the test suite catches that the test suite does not catch, verified by mutation) and six Low.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 0 |
| Medium | 1 |
| Low | 6 |

All seven are filed as separate issues in this Circle's issue store, listed under `## Filed` below.

## What was verified and holds

Recorded because the plan makes "read both sides" an acceptance condition, so a clean result is a result.

**The historical byte measurement at `CLAUDE.md:64` is exact.** Every figure was re-derived from git rather than from the step note. The removal commit is `fa2f00b`, dated 2026-08-12, which is the "measured on 260812, the day it went" the sentence claims.

| Claim | Measured | Source |
|---|---|---|
| the rule was 10 541 bytes | 10 541 | `git show fa2f00b^:rules/protected-path-discipline.md \| wc -c` |
| 91 090 of shipped rule text before | 91 090 | sum of the six always-on files at `fa2f00b^` |
| 98 443 floor before | 98 443 | 91 090 + 7 353 |
| the 7 353-byte chat voice profile | 7 353 | `fusion-workbench/stilwerk/chat-voice-de.yaml` at `fa2f00b` and at HEAD |
| the step took 10 420 off, not 10 541 | 10 420 | 10 541 − 121 |
| +121 bytes correcting `critical-stance.md` | 9 837 → 9 958 | that file at `fa2f00b^` and `fa2f00b` |
| the two removed numbers had each drifted 5 796 low | 5 796 | 86 466 − 80 670, and (86 466 + 7 353) − 88 023 |

**No current floor is claimed.** The sentence states plainly that today's figure is deliberately not given and why. That is what the plan's step 2(d) asked for, and the historical half survives intact. One imprecision in the *reproduction instruction* is filed as a Low (finding 4).

**The five new `bin/` rows each cite a location that documents that helper.** Each citation was opened:

| Row | Cited home | Verified |
|---|---|---|
| `fusion-commit-lock` | `rules/workbench-stash-and-lock.md` | `:122` noclobber holder write, `:124` two stale-lock paths at 60 s, `:130-135` four subcommands with `with` canonical, `:137-143` who acquires, `:150-153` failure modes. Orchestrator-only emission confirmed at `bin/fusion-rules:453-455` |
| `fusion-count-sources` | its own header | `bin/fusion-count-sources:1-60` — output keys, exit codes, "Why git ls-files" (no fallback), "The absent count" (`unavailable`, never `0`). Decisions `260809-1731_*_how-should-the-domain-heuristic-count-a-projects-source-files.md` and `260810-0921_*_how-should-a-prompt-call-a-bin-helper-that-the-installed-copy-may-not-have.md` both resolve on disk |
| `fusion-state-drift` | `hooks/lib/state-drift.ts` + `README-hooks.md:177` | both exist; wrapper target `hooks/dist/state-drift.js` at `bin/fusion-state-drift:57` |
| `fusion-staging-drift` | `hooks/lib/staging-drift.ts` + `README-hooks.md:178` | both exist; the four classes and the `verdict=` scoping match the script header `:18-25` |
| `fusion-review-coverage` | `hooks/lib/review-coverage.ts` + `README-hooks.md:179` | both exist; `--since` default confirmed at `bin/fusion-review-coverage:8` |

The roster itself closes: `ls bin/` returns 15 files, `CLAUDE.md`'s Layout table returns 15 rows, and the two sets are equal.

**The playmaker parenthetical matches the prompt clause for clause.** `agents/playmaker.md:60` and `rules/fusion-workbench-conventions.md` `## Backlog entries` both give the same shape the row now states: the `_o_`↔`_p_` rename autonomous, four confirm-gated operations, filing reserved to the user.

**The two `README-agents.md` dead references were genuinely dead, and their replacements exist.** `git show 6590cd5:CLAUDE.md` contains neither "folder structure" nor any "key-documentation" surface; `CLAUDE.md:12` `## What this is`, `CLAUDE.md:16` (the agent listing bullet), `CLAUDE.md:23` `## Layout` and `CLAUDE.md:28` (the `agents/*.md` row) all exist as the replacement names them.

**The full suite is green at HEAD**: `cd hooks && npx vitest run` → 49 files, 1022 tests, exit 0. That matches the step-3 history note (1019 before, +3).

**The plan's `[DONE]` markers match what landed** for the substance of all three steps. Step 1 carries one addition beyond its stated changes (the test-coverage sentence), which is finding 1. The marker hygiene on the plan file itself is finding 6.

## Findings by theme

### Theme A — a claim about the safety net that the safety net does not make

**1. `README-agents.md:268` — "a forgotten registration fails the test suite" overstates the gate.** Medium. Scope: `README-agents.md`, shipped doc.

The sentence added in `90037eb` says the two `CLAUDE.md` counts are checked "so a forgotten registration fails the test suite". `derivable-enumerations-lint.test.ts:146-152` is five digit-count regexes. No test enumerates the agent *names* in the listing bullet, and no test enumerates the rows of README-agents' own agent table — the third item of the very list the sentence sits under. The skill roster gets both treatments one section up (`:112-122`); the agent roster gets neither.

Verified by mutation rather than inferred. In a scratch copy: added `agents/scratchagent.md`, bumped the four digit claims, registered the name nowhere. `npx vitest run lib/__tests__/derivable-enumerations-lint.test.ts` → 21 passed, 0 failed. Bumping a digit and adding a name to a comma list are different edits, which is how the two come apart in practice.

The fix is a choice: narrow the sentence to what the gate does, or widen the gate with a per-name check and a one-row-per-agent check modelled on the skill roster's.

### Theme B — rows that restate what they say they do not restate

Both are the same shape, and both are in the five rows added by `0b20859`. The three rows that avoid it use the form "**X is authored in Y** … and this row deliberately does not restate them", which is worth keeping as the pattern.

**2. `CLAUDE.md:43` — the `fusion-count-sources` row says no markdown describes the helper, and is that markdown.** Low. `grep -rn 'fusion-count-sources' --include='*.md'` over the shipped surfaces returns exactly one line: `CLAUDE.md:43` itself. The claim was true when the plan was written and was falsified by the edit that carried it.

**3. `CLAUDE.md:41` — the `fusion-commit-lock` row restates two of four acquirers while declaring it restates none.** Low. `rules/workbench-stash-and-lock.md:137-143` has four entries; the row's opening clause covers the first two and omits `/fusion:commit` and `/fusion:cleanup`, the two skills that commit — the entry a reader is least likely to guess, since skills are not served by `bin/fusion-rules`.

### Theme C — the reproduction instruction that replaced the deleted numbers

**4. `CLAUDE.md:64` — "the `emit_if_exists` list in `bin/fusion-rules`" is eight lines, not five.** Low. Three of the eight are conditional emissions indented inside `if` blocks (`circle-records.md`, `design-diagrams.md`, `workbench-stash-and-lock.md`), together 30 588 bytes. A reader following the instruction literally measures up to 117 054 instead of 93 819, about 33 % high. The word "unindented" is what makes the set parseable and the lint says so at `derivable-enumerations-lint.test.ts:176-178`; the plan carried it and the step-2 history carried it, and it was lost only in the shipped sentence. This matters more than a wording nit because reproducibility is the whole of what the edit substituted for a stated figure.

### Theme D — enumeration gates: one half covered, one half not

**5. `hooks/staging-drift.ts` has no row in `README-hooks.md`'s Files table, and section 5 of the lint covers only `lib/`.** Low. Eight of the nine top-level `hooks/*.ts` entry points have rows; `staging-drift.ts` does not, while its two siblings `state-drift.ts` and `review-coverage.ts` do. Section 5's regex requires the `lib/` prefix and `libFiles()` reads `hooks/lib` only, so nothing reaches the top-level half. This is the same gap for `hooks/` that step 3 has just closed for `bin/`, and the new block is the working template for closing it. Found while verifying finding-table row 4 above; that citation itself is correct.

**6. The `bin/` roster parser is not anchored to the Layout table.** Low. `documentedRows()` scans the whole of `CLAUDE.md`; the test name and every assertion message say "Layout table". Verified by mutation: deleting the `bin/fusion-plane` row and appending a same-shaped line at the end of the file, past the troubleshooting table, leaves all 21 tests green.

**On the question the dispatch asked — does the non-vacuity assertion plus the mutation check make a silent pass impossible?** For every realistic drift, yes, and this was established by mutation rather than by reading. Four probes against a scratch copy:

| Mutation | Result |
|---|---|
| table row shape reworded (`` | `bin/x` | `` → `` |`bin/x`| ``) | fails, with the non-vacuity message naming the reshape |
| a `bin/` file deleted, row left standing | fails: "…has a row for bin/fusion-turn-budget but that file does not exist" |
| a row duplicated | fails: "…has 2 rows for bin/fusion-plane" |
| a same-shaped row placed outside the Layout table | **passes** — finding 6 |

One observation on the mutation fixture itself, which is not a defect: under *total* parser loss the fixture keeps passing, because `drift([...helpers, "fusion-scratch-helper"], [])` still produces the message it asserts. The floor is carried entirely by the corpus test's `rows.length > 0`, and that is enough — but the fixture is not a second line of defence, and a future edit that weakened the corpus assertion would not be caught by it.

### Theme E — workbench hygiene

**7. The plan file carries `_o_` and `**Status:** Draft` while three of ten steps are `[DONE]`.** Low. `rules/fusion-workbench-conventions.md` `## State Markers — issues and planning` requires `_o_` → `_p_` when an agent begins work. A `grep '_o_'` scan over `$SCAN_PLANS`, which several agents run at Setup, reads this plan as not started while seven steps are genuinely outstanding.

## Cross-cutting observations

**The five new rows split two-to-three on one question, and the three are right.** Three of them name an authoring home and stop; two summarise the thing they say they will not summarise (findings 2 and 3). The difference is not stylistic — a partial restatement is the failure mode this Circle exists to end, arriving one layer down. The three-row form is the pattern to hold to for the rows step 6 will touch.

**Every number in the range that could be checked, checks — and two words could not be.** Seven numeric claims re-derived from git, all exact. The two defects in this range are both *qualitative* claims about coverage: "no markdown file describes it" (finding 2) and "a forgotten registration fails the test suite" (finding 1). Both are absolutes about the absence of something, which is the class of claim a `grep -c` cannot settle and this Circle's method constraint was written against. Worth carrying into steps 4-10: the numbers are being handled well; the universal quantifiers are where the misses are.

**The gate landed early and paid off immediately**, which is the plan's own sequencing bet (`## Approach`, "The gate lands early, not last"). It also revealed its own blind spot by analogy: writing a roster check for `bin/` is what made the missing `hooks/*.ts` half visible (finding 5). One enumeration closed tends to name the next.

## Recommended sequencing

None of the seven blocks a release, and none blocks Turn 2.

**Fix in Turn 2, alongside step 4** (all four are single-sentence edits to files step 4 already opens):

1. Finding 1 — `README-agents.md:268`, the coverage claim. Highest value of the set: it is the one finding where a reader could act on the sentence and ship a defect.
2. Findings 2, 3 and 4 — the two `CLAUDE.md` rows and the measurement instruction. Step 4 does not open `CLAUDE.md`, but the three edits together are under ten lines.
3. Finding 7 — the plan marker. One `mv` and one header line; do it before the next reconciliation pass reads the store.

**Defer to a later Turn or a follow-up Circle:**

4. Finding 5 — the `README-hooks.md` row plus the top-level `hooks/*.ts` half of the lint. It is a real gap but sits outside this Circle's bounded finding list, and the risk noted in the plan's `## Risks & Mitigations` about scope creep applies to it directly.
5. Finding 6 — the parser's section scope. Cheapest correct fix is to slice `CLAUDE.md` to the `## Layout` section and assert the slice is non-empty; the cheapest honest fix is to drop the word "Layout" from the test's messages.

**Not recommended:** widening the lint (finding 1's second option) inside this Circle. It is the right end state, but it is a test-design change with its own decidability question about what "registered" means, and the plan has four Turns of documentation work still ahead of it.

## Filed

Seven issues in `circles/260813-0910-documentation-matches-shipped-plugin/issues/`, all `260813-1929_o_*`:

| Finding | File |
|---|---|
| 1 | `…_o_readme-agents-claims-the-lint-catches-a-forgotten-registration-when-it-only-checks-counts.md` |
| 2 | `…_o_the-count-sources-layout-row-says-no-markdown-describes-it-while-being-that-markdown.md` |
| 3 | `…_o_the-commit-lock-row-restates-two-of-four-acquirers-while-saying-it-restates-none.md` |
| 4 | `…_o_the-measure-it-yourself-instruction-names-the-emit-if-exists-list-which-includes-three-conditional-rules.md` |
| 5 | `…_o_hooks-staging-drift-ts-has-no-row-in-the-readme-hooks-files-table-and-no-gate-covers-that-half.md` |
| 6 | `…_o_the-bin-roster-parser-accepts-a-row-shaped-line-anywhere-in-claude-md-not-only-in-the-layout-table.md` |
| 7 | `…_o_the-plan-file-carries-the-open-marker-and-status-draft-while-three-of-ten-steps-are-done.md` |

## Method note

Every finding and every entry in `## What was verified and holds` rests on opening both sides. Three claims were settled by mutation against a scratch copy of the tree rather than by reading (findings 1 and 6, and the four-probe table), because "the test would catch this" is not decidable by reading a test. No finding in this review rests on a match count.

---

**Reconciled 260813-2258-reconciliation.md.** Seven findings filed, five closed and two still open. Each of the five closures was re-checked against the artifact at HEAD `c0e4219`, not against its closure note: `README-agents.md:300` (the narrowed lint claim), `CLAUDE.md:42` (the commit-lock row's partial acquirer list dropped), `CLAUDE.md:43` ("authoritative documentation" replacing the self-falsifying absolute), `CLAUDE.md:65` (the **unindented** `emit_if_exists` qualifier), and the plan's `_o_`→`_p_` rename with `**Status:** In progress`. All five hold. The two open findings — the missing `hooks/staging-drift.ts` row and the unanchored `bin/` roster parser — were re-verified as still present.
