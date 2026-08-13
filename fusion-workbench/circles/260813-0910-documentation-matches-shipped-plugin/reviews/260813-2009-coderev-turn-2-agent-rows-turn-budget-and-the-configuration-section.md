# Code review — Turn 2: the agent rows, the Turn budget, and README's configuration section

**Date:** 2026-08-13
**Sender:** coderev
**Reviewed-range:** `28f3029..5d51abd`
**Not-opened:** none
**Circle:** `circles/260813-0910-documentation-matches-shipped-plugin`
**Files as dispatched:** `README-agents.md`, `README.md`, `CLAUDE.md`

## Summary

Both commits do what they claim, and the five Turn-1 findings closed alongside them are genuinely
closed — each was re-verified against the artifact its record cited, not against its `Resolved:`
line. Five new minor findings, all documentation-side, none blocking: two in `README.md`'s new
configuration text, two in the rewritten `shaper` row, one in `CLAUDE.md`'s byte-budget line.
The full hooks suite is green (49 files, 1022 tests), and the enumeration lint still holds the
agent counts to the tree, verified by mutation rather than assumed.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 0 |
| Medium | 0 |
| Low | 5 |

## Verification of the five closures

Each closed record was checked against the artifact it names, in both directions. All five hold.

| Record | Verified against | Verdict |
|---|---|---|
| `…_c_readme-agents-claims-the-lint-catches-a-forgotten-registration…` | `hooks/lib/__tests__/derivable-enumerations-lint.test.ts:146-176`, every `agentNames()` call site (`:145`, `:169`, `:263`) | holds |
| `…_c_the-commit-lock-row-restates-two-of-four-acquirers…` | `CLAUDE.md:41` as it now stands; `rules/workbench-stash-and-lock.md` `### Who acquires` | holds |
| `…_c_the-count-sources-layout-row-says-no-markdown-describes-it…` | `bin/fusion-count-sources:1-60` (usage block, exit codes, "The absent count") | holds |
| `…_c_the-measure-it-yourself-instruction-names-the-emit-if-exists-list…` | `bin/fusion-rules` `emit_if_exists` lines; `wc -c` on all three sets | holds — see below |
| `…_c_the-plan-file-carries-the-open-marker-and-status-draft…` | the renamed plan file and its `**Status:**` header | holds |

**Detail on the count claims**, all re-measured here rather than carried over from the record:

- Unindented `emit_if_exists` lines: five, at `bin/fusion-rules:391-395`. Indented: three, at
  `:421`, `:439`, `:454`.
- `wc -c` over those three conditional rule files: **30 588** bytes — the record's figure.
- `bin/fusion-rules coder | xargs wc -c` → **93 819** total over six paths (the five always-on
  rules plus `fusion-workbench/stilwerk/chat-voice-de.yaml`). `coder` draws no conditional rule,
  so the one-command shortcut the line offers is exact in this repository today, as claimed.

**Mutation check on the narrowed lint sentence.** A scratch copy of the tree with a seventeenth
agent added and no count bumped: `npx vitest run lib/__tests__/derivable-enumerations-lint.test.ts`
→ **6 failed, 15 passed**. So "an agent added without bumping them fails the test suite" is true,
and the sentence's second half ("it checks no names") matches what the `CLAIMS` array and the
three `agentNames()` call sites actually do.

## Findings by theme

### Configuration documentation (`README.md`) — 2 Low

**1. `README.md:112` — "no hook reads it" is false for `orchestrator.maxTurns`.**
`hooks/guard.ts:204` calls `loadConfig()` on every guarded tool call; `hooks/lib/config.ts:490-495`
validates that leaf like any other; `hooks/guard.ts:238-241` turns each resulting diagnostic into a
`guard_advisory`. Run against a scratch project declaring `{"orchestrator":{"maxTurns":0}}`, the
loader returns `maxTurns=5` plus the diagnostic naming the key — which is the advisory the same
table cell goes on to describe. The intended claim (no hook *acts on* the value) is true and worth
keeping; as written the cell sends a reader away from the surface they will actually meet.
Record: `issues/260813-2009_o_the-turn-budget-row-says-no-hook-reads-the-key-while-describing-the-advisory-a-hook-emits.md`

**2. `README.md:105` — the rewritten preamble instructs a declaration the first row refuses.**
"Declare the ones you want in your project's `fusion-guard.json`" precedes the `guard.enabled` row,
and `hooks/lib/config.ts:707` reads that leaf from the plugin layer only, with `:601-606` turning a
project declaration into a diagnostic. The row corrects the preamble one line later, so the reader
recovers immediately — but the sentence was rewritten in this Turn precisely to be true.
Record: `issues/260813-2009_o_the-tuning-table-preamble-tells-the-reader-to-declare-a-key-the-project-layer-refuses.md`

### Agent-row accuracy (`README-agents.md`) — 2 Low

**3. The `shaper` Writes cell enumerates two of three in-place record edits.**
`agents/shaper.md:53` mandates a third write in portfolio-activation mode, the record's
`**Active spec/plan:**` field, and `skills/next/SKILL.md:250` depends on it having happened, with
no fallback when it has not. The omission is easy to make: the field is not a `##` section, and the
cell inherited the section-shaped framing of the prompt's own Scope sentence at `agents/shaper.md:24`.
Record: `issues/260813-2009_o_the-shaper-writes-cell-enumerates-two-of-three-in-place-record-edits.md`

**4. The `shaper` Writes cell states the backlog promotion unconditionally.**
`agents/shaper.md` "An entry is promoted whole or not at all" gives a second branch in which the
entry is left untouched: no rename, no `Promoted:` line. Locations written are the same on either
branch, so scope is not misrepresented; what is lost is the guarantee that a closed backlog entry
means the entry became the Circle rather than one of its ideas did.
Record: `issues/260813-2009_o_the-shaper-writes-cell-states-the-backlog-promotion-unconditionally-while-the-prompt-conditions-it.md`

### Self-consistency of a line about staleness (`CLAUDE.md`) — 1 Low

**5. `CLAUDE.md:64` bans a stated number, then states one.**
"any number written into this line is stale before it is committed" is followed two sentences later
by 30 588 bytes, a `wc -c` over three rule files that any rule edit moves — the same decay the
sentence cites for the two figures it deleted, which had each drifted 5 796 bytes. The proportion
that follows it ("about a third") carries the meaning and survives a rule edit.
Record: `issues/260813-2009_o_the-byte-budget-line-bans-a-number-and-then-states-one-two-sentences-later.md`

## What was checked and holds

Stated so the next pass does not re-tread it. Each was read on both sides.

- **The `planner` row**, in full. "Every plan step names exactly one executor" against
  `agents/planner.md` plan output format; the three named read stores against `$SCAN_PLANS`,
  `$SCAN_ANALYSES`, `$SCAN_DECISIONS` in `bin/fusion-paths planner`; `OUT_DECISION` against the
  "You also file them" section; the mandatory `**Decidability:**` head line and the four per-step
  fields against the template. No defect.
- **The `shaper` row's other claims.** Four invocation modes against `## Four invocation modes`;
  the backlog read against `SCAN_BACKLOG`; the new Circle directory and `_a_circle.md` against the
  anticipated-circle bullet; "the six artifact subdirectories" against `rules/circle-records.md:63`,
  which names all six.
- **The diagram edit.** The `Turn loop` box measures 45 characters like every other box line in the
  drawing (108-131); the annotation sits outside the right border, as the four existing annotations
  do. Alignment is intact.
- **The Turn-budget paragraph** (`README-agents.md:134`), clause by clause, against
  `agents/orchestrator.md:113-134`, `:1049`, `:1204` and `hooks/lib/config.ts:277`. The resolution
  chain, "no count is written into the orchestrator prompt", the omitted `progress.max_turns`, the
  `<current>/--` dashboard field, the non-evaluable circuit breaker and the per-Turn-boundary
  check-in all match.
- **`README.md`'s configuration paragraph.** Three layers and their order against
  `hooks/lib/config.ts:683-721`; the empty `categoryPaths` / `categorySensitivity` / `decisions`
  against `hooks/config.json`; the template seeding against `skills/setup/SKILL.md:195`; the
  characterisation of `hooks/config.example.json` against that file, which carries filled-in
  mappings and decisions and neither an `orchestrator` key nor `protectedPaths`; both
  `README-hooks.md` anchors against its `### Per-project configuration: \`fusion-guard.json\``
  heading at `:258`.
- **The suite.** `npx vitest run` in `hooks/`: 49 files, 1022 tests, all passing.

## Cross-cutting observations

**The recurring shape is a sentence that is exact about its subject and loose in one adjacent
clause.** Four of the five findings are that: the tuning row is right about the budget and wrong
about hooks, the preamble is right about the spectrum and wrong about where one row is declared, the
shaper cell is right about the modes and short by one write, the byte-budget line is right about
staleness and then states a decaying number. None is a wrong fact about the thing being described;
each is a wrong fact about its neighbour. That is the same shape as three of the seven Turn-1
findings, and it suggests the residual risk in the remaining steps is in the connective prose rather
than in the claims the steps set out to correct.

**The scope-creep question, judged.** The two neighbouring lines corrected in step 5 were forced by
the additions, not creep. The old preamble said the rows were "assembled from the fields already in
`hooks/config.json`", which `orchestrator.maxTurns` falsifies (that file carries no `orchestrator`
key, deliberately) and `guard.protectedPaths` falsifies from the other side (retired from it). And
the bare `guard.enabled: false` cell, once the preamble pointed at `fusion-guard.json`, would have
told a project to declare a key the loader refuses. Both edits were necessary; finding 2 is that one
of them overshot.

**Coverage residual, recorded rather than left implicit.** This range starts at `28f3029`, so that
commit is covered by no review file: Turn 1 declared `6590cd5..79ec7bb` and this pass was dispatched
from `28f3029`. `28f3029` changes workbench files only (the Turn-1 review, five issue markers, the
Turn log), so nothing shipped goes unreviewed — but `bin/fusion-review-coverage` will keep naming it,
along with `6590cd5`, until a range tiles them. Worth a sentence at the Circle's close rather than a
finding.

## Recommended sequencing

None of the five blocks the release. Findings 1 and 5 are the two worth fixing before the Circle
closes: both sit in lines this Circle wrote in order to be exact, and both are checkable by a reader
in one step, which is how a documentation defect earns its cost back. Findings 2, 3 and 4 are
one-clause edits that can ride along with whichever later step next touches those files — step 6's
dispatch-parameter table is the natural home for 3 and 4.
