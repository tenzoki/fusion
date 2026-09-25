# Pre-tag code review — v11.7.0, `/fusion:curate --edges`

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Reviewed-range:** `04a1ed8d..d1f6b65d`
**Not-opened:** none

**Review domain:** code. **Work item:** `260917-2253-depends-on-edges-proposed-and-confirmed`.

A fourteenth commit, `d1f6b65d`, landed during the pass; it touches only the spec record and `orchestrator-events.jsonl`, and the range above covers it. The 34 workbench records in the range are out of this agent's scope by its own prompt; the seven shipped files were all opened, `README-agents.md` and `hooks/lib/__tests__/fixtures/rules-emission.golden` at their changed regions plus the surrounding rows rather than end to end.

## Summary

The committed range is green and the three regenerated pins are correct. The feature's text carries seven defects, one of which would stop the apply pass from running at all: `## Scope` withholds permission for the write `### Pass 2 — apply` is dispatched to make, because it conditions that permission on a dispatch parameter no apply dispatch carries. Two further defects sit in the classification the night recut three times — the citation cell writes onto a terminal item on a path that is reachable on this workbench today, and residue's stated exhaustive bound is falsified two paragraphs below it. Both arrived in the repair that closed `260918-0823`, which is this night's established pattern.

## Totals

| Severity | Count |
|---|---|
| Critical | 1 |
| High | 3 |
| Medium | 3 |
| Low | 3 (reported here, not filed) |

Plus one release-process item that is not a defect in the range.

## Tag-stopping

### C1 — `## Scope` forbids the edge write on every dispatch that performs it

`agents/curator.md` `## Scope`, edit bullet 4: the two edge fields may be edited "only on an `**Edges:** on` run". No apply dispatch is one — `## The fourth subject` ("The apply dispatch carries no `**Edges:**` line at all"), `## Dispatch parameters` (absent defaults to `off`), `skills/curate/SKILL.md` Step 6 (three parameter lines, none of them `**Edges:**`) and `README-agents.md` ("on the survey dispatch alone") all say so. An agent that treats `## Scope` as the authority refuses every approved edge entry.

The bullet is new in this range; the relocation bullet beside it carries no equivalent `**Placement:** on` precondition, so the pattern is not inherited. The clause also buys nothing: `### Pass 2 — apply`'s three preconditions already gate the write, and the second of them is the liveness check.

Issue: `260918-0842_*_the-scope-table-forbids-the-write-the-apply-dispatch-is-sent-to-make.md`.

## High

### H1 — the citation cell writes onto a terminal item

`### The classification, cut on direction`, row 3: "a `**Cross-references:**` entry on the corpus owner … the corpus owner is the dependent by definition". `corpus owner` has two referents in this section — the live item whose corpus this is, which the ordering cell's completeness argument calls "live by construction", and the item owning the container the file sits in, which `### The corpus` fixes as the near endpoint. The corpus includes "every record **the item record** cites", and those sit in other containers.

Reachable today: the live item's record cites `260909-1020_*_…`, `260911-1747_*_…` and `260911-0715_*_…`, which resolve into `260908-2018-prerequisites-confirmed-once-order-computed` (`done`) and `260909-1700-cut-fusion-to-working-minimum` (`done`). A citation sentence in any of them produces an entry on a terminal item, which `### The corpus` ("a live work item's head and nowhere else"), `### The classification` ("The dependent is live in every outcome that produces an entry") and `## Scope` all forbid. Precondition 2 catches it after the gate, so nothing corrupts — what is spent is the user's judgement on a proposal that can never apply.

Distinct from `260918-0825` (near endpoint as a proxy for aboutness) and `260918-0828` (the ordering cell's dependent). Issue: `260918-0842_*_a-citation-entry-lands-on-a-terminal-item-whenever-the-sentence-came-from-a-cited-record.md`.

### H2 — residue's whole bound is falsified in the same section

"Residue is an ordering whose other end is not a work item, and nothing else" is followed two paragraphs later by "**Dependent the other item** → **residue**", where both ends are work items by the cell's own definition. A run obeying the exhaustive sentence drops exactly the readings `260918-0828` needs reported to be answerable. Both sentences arrived in `8ff67839`.

Issue: `260918-0842_*_the-residues-stated-whole-bound-is-falsified-two-paragraphs-below-it.md`.

### H3 — the post-write compare claims a class it cannot see

`### Pass 2 — apply` lists "a doubled comma, a lost space, a trailing separator and a duplicated field line" as the class the byte-for-byte compare catches. The first three are differences inside the line it re-reads; the fourth is a second line elsewhere in the head block, which a single-line comparison cannot see. `hooks/lib/work-graph.ts` `headField()` returns the first match and drops the rest with no diagnostic, so a duplicated field line makes the user-confirmed edge vanish from `bin/fusion-work-order` silently — the exact failure `260815-1943` filed the compare against. The absent-field write, which is the path that produces a duplicate rather than inheriting one, is the majority path: four of seven records carry no `**Cross-references:**` line and six carry no `**Depends-on:**` line (verified).

Issue: `260918-0842_*_the-post-write-compare-cannot-see-a-duplicated-field-line-and-the-order-helper-swallows-one.md`.

## Medium

### M1 — the legacy-status enumeration is false, and the two halves name different case sets

`### The corpus`: "24 of the 31 containers … reading `closed`, `active`, `bounded` or `anticipated`, all 24 terminal". 31 and 24 verify. The enumeration does not: 13 of the 24 carry no `**Status:**` line at all, and `hooks/lib/work-graph.ts`'s header states that a Circle record has none by design. `260918-0827-adversarial-read-of-the-first-edge-run.md` §4 already counted "1 no status line" in its subset. `### Pass 2 — apply` precondition 2 names four states including the absent line; the survey-side rule names three. `rules/critical-stance.md` §5.

Issue: `260918-0842_*_thirteen-of-the-twenty-four-legacy-containers-carry-no-status-line-and-the-prompt-enumerates-four-values.md`.

### M2 — two clauses disagree on where a prior run file is found

`### The suppression read` (new) reads run files "across `$WORKBENCH`, … **not through `$SCAN_ANALYSES`**" and states the measured reason. `## The run file` item 1 still resolves the previous run "across `$SCAN_ANALYSES`" for the same corpus. Twelve of the fourteen run files in the tracked tree sit outside it.

Issue: `260918-0842_*_two-clauses-disagree-on-where-a-prior-curator-run-file-is-found.md`.

### M3 — the skill over-promises the before-text re-read, and one bullet names a staleness test with no stale outcome

`skills/curate/SKILL.md` Step 6 tells the user every approved entry's before-text is re-read and compared; the edge exception gives that comparison up for the two edge groups by design. And `### Pass 2 — apply`'s first bullet after the preconditions — "Staleness is judged on this entry's own basename" — names a test whose two outcomes the next bullet supplies as `applied` and *write*, neither of them `stale`. Staleness is in fact decided by the three preconditions above it. The bullet is a leftover of the pre-`260918-0821` shape.

Issue: `260918-0842_*_the-skill-promises-a-before-text-re-read-the-edge-exception-gives-up.md`.

## Low — reported, not filed

- `skills/curate/SKILL.md` Step 3 says the survey report carries "three things" and lists three numbered items covering four; `agents/curator.md` `## Tool Discipline` and `## Output Style` both say "four things". Pre-existing, untouched by this range.
- `skills/curate/SKILL.md` Step 3 and Step 4 define the blast-radius verdict over "proposed deletions" alone; `agents/curator.md` `### Blast-radius stop` counts "deletions **and relocations together**". Pre-existing.
- The edge revert path `git checkout -- "$(git ls-files ':(top)*<basename>')"` is correct and runs — verified from a subdirectory of the work tree. It handles zero matches (the untracked-workbench clause) but not more than one: two matches collapse into one newline-bearing argument and the command fails. Item basenames are unique by construction, so the exposure is small.

## What I verified and found sound

Stated so the coverage claim is not read as wider than it is.

- **The committed range is green.** A detached worktree at `d1f6b65d` passes `surface-growth-bound` and `reference-resolution-lint`; the full suite is 56 files / 942 tests.
- **The three regenerated pins are correct for the range.** `rules-emission.golden` moves `fusion-workbench-conventions.md` 65998 → 66109 across every agent, and the file measures 66109. `surface-growth.golden` reads `curator.md 71520` and `curate/SKILL.md 11978`, and both measure that.
- **Every resolver key the prompt names is emitted.** `bin/fusion-paths curator` prints all nine of `$WORKBENCH`, `$OUT_ISSUE`, `$OUT_DECISION`, `$OUT_ANALYSIS`, `$SCAN_ISSUES`, `$SCAN_DECISIONS`, `$SCAN_REVIEWS`, `$SCAN_ANALYSES`, `$SCAN_BACKLOG`.
- **The absent-field positioning rule parses.** Every anchor the fallback chain names (`**Active spec/plan:**`, `**Depends-on:**`, `**Claim:**`, `**Status:**`, `**Filed by:**`) sits inside the head block `hooks/lib/work-graph.ts` `headBlock()` reads, so a created line lands where the helper looks. The chain terminates because precondition 2 guarantees a `**Status:**` line. Applying two creations into one record in either order yields the template order. The `**Domain:**` field five records carry sits above `**Status:**` and is never crossed.
- **The field counts at `### Pass 2 — apply` are right.** Four of seven records carry no `**Cross-references:**` line, six carry no `**Depends-on:**` line.
- **The citation-yield figures verify where they are load-bearing.** Over the live item's container: 11 containers other than its own, 6 falling out under the legacy rule, 5 work items, 2 already in the field — all four reproduce exactly. The 70/27 upstream of them is method-sensitive; my own extraction gives 81/37 on a looser regex, and the four downstream figures are the same either way.
- **"5 further files" reproduces.** The item record cites five records outside its own container.
- **The classification table is formally disjoint and complete** over `{empty, non-empty} × {no, yes}`, and the three-way ordering split is complete *given* that "corpus owner" means the live item. H1 is the failure of that premise, not of the table.
- **The `case where the basename is already present`, the two-entries-into-one-line collision, and the After-block-is-one-short clause** all hold as written; the second entry's computed write text and its compare agree in both the present and the created-this-pass branches.

## Cross-cutting observations

1. **Both H-findings and C1 are consequences of the repair that closed the previous round.** `8ff67839` recut the split and restored the preconditions; it introduced H2 (the residue bound), left H1 unreached, and added C1's qualifier. `260918-0823`'s own fix note claims the split now lands every input exactly once, which H1 and H2 falsify. The night's stated pattern — each repair creates the next defect — held through this one too.
2. **Three of the seven findings are one clause stating a property the mechanism beside it does not have** (C1's precondition, H3's fourth class, M3's staleness test). Each was written as an assurance. The cheap check is to read every "this catches X" sentence against the procedure directly under it before the commit.
3. **Two findings are the same word carrying two referents** (H1's `corpus owner`, M2's run-file corpus). Both survived four passes because each referent is correct in its own paragraph.

## Recommended sequencing

1. **Before the tag:** C1. It is one clause, and without it the feature's apply half may refuse to run.
2. **Before the tag, same commit:** H2, and M3's second half. Both are single sentences in paragraphs C1 already opens, and leaving a self-falsifying definition in the section that was just recut for that reason is worse than the cut.
3. **H1 and H3 are release-blocking only if `--edges` is meant to be used at v11.7.0.** Neither corrupts a record — precondition 2 stops H1, and H3 needs a write bug to fire. If the tag is a checkpoint rather than a usable release of this feature, they can follow.
4. **M1, M2, M3's first half:** cleanup.

## One release-process item, not a defect in the range

The working tree carries uncommitted release-prep edits — `.claude-plugin/plugin.json`, `README.md`, `install.sh`, `skills/help/SKILL.md` — and with them the suite is **red on two tests**:

- `surface-growth-bound`: `help/SKILL.md` measures 16452, the golden says 16456.
- `reference-resolution-lint`: BASELINE `paths: 1660`, the tree resolves 1659.

Both are the ordinary consequence of a release-prep edit and both are re-approved as part of the release commit. Named here only because a tag cut before that re-approval would be a red tag: `d1f6b65d` itself is green, verified in a clean worktree.
