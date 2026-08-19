# Code review — session 260818-2301, Turn 2

**Reviewed-range:** `b54ace5..83488e9`
**Not-opened:** none

The dispatch named the range as `5ec26b2..HEAD` and the three commits `5ec26b2`, `06ab15b`,
`83488e9`. The field is written `b54ace5..83488e9` because `bin/fusion-review-coverage` reads it with
git's exclusive left endpoint, so `5ec26b2..` would have left `5ec26b2` — a commit this pass did open
in full — reported as covered by nobody. The three commits are the dispatch's three.

Every file in them was opened, including the four the Turn-1 review declared not-opened and
`bin/fusion-review-coverage` carried forward.
**Date:** 2026-08-19
**Reviewer:** coderev
**Test state:** `cd hooks && npx vitest run` green at `83488e9` — 36 files, 672 tests, run before and
after this pass filed its records.

## Summary

Ten closures and one deliberate non-closure, and the substance of every one of them is real: the
archive skill now performs the read it claimed, the Phase-4 case split tiles, the fixed event strings
make the reserved measurement a grep, and the `{1156, 149, 102}` re-approval reproduces per file
exactly. Eight findings, none Critical, none High. The dominant pattern is narrower than Turn 1's: a
`Resolved:` note stating a guarantee one degree wider than the edit delivers. Three of the eight are
that; the two that matter most are a closure whose own fix direction said "three files" and reached
one, and a new shell call site that departs from the shape four siblings share.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 0 |
| Medium | 3 |
| Low | 5 |

All eight are filed under `shared/issues/` as `260819-0821` … `260819-0828`.

## What was verified and holds

Stated first, because most of this range checks out and a findings list read alone misrepresents it.

**The two `dist/` files are a faithful build and carry nothing else.** `npm run build` from a clean
`hooks/dist` copy reproduces the committed tree byte-identically (`diff -r` → no output). The range's
`dist` diff mirrors the `.ts` diff hunk for hunk; the `.d.ts` correctly carries only the hunk above
the first declaration.

**Both goldens moved only where something in the range explains it.** `surface-growth.golden`:
`orchestrator.md` +587, `planner.md` +179, `archive/SKILL.md` +750,
`reference-resolution-lint.test.ts` +26 lines — every one of the four reproduced against disk with
`wc -c` / `wc -l`, and the three totals are the exact sums. `rules-emission.golden`: one file moved,
`fusion-workbench-conventions.md` −63, and all fifteen per-agent totals fall by exactly that. No
figure moved that nothing explains.

**The `reference-resolution-lint` re-approval reproduces, per file and in total.** Measured
independently in a detached worktree at `5ec26b2`, copying each changed file in from HEAD one at a
time:

| File | measured | claimed |
|---|---|---|
| `skills/archive/SKILL.md` | paths 1155 (+3) | +3 |
| `CLAUDE.md`, `README-agents.md`, `.gitignore` | 1152 (0) | 0 |
| `agents/planner.md`, `agents/orchestrator.md`, `hooks/lib/staging-drift.ts` | 1152 (0) | 0 |
| `rules/fusion-workbench-conventions.md` | 1153 (+1) | +1 |
| `rules/workbench-tracking.md` | 1152 (0) | 0 |

Eight figures summing to +4, `1152 + 4 = 1156`, and `anchors`/`records` unmoved. The attribution for
U1's +2→+3 was verified rather than accepted: renaming `FUSION_SRC` back to `SRC` in the HEAD file
reproduces paths 1154 **and** turns the dangling-reference case red, which is exactly the note's
account.

**The always-on floor claim reproduces.** `./bin/fusion-rules coder | xargs wc -c` gives 98 733 at
HEAD, matching the session's `98 796 → 98 733`. The `260816-1707` `Implemented:` correction is
honest: 101 393 → 97 977 is the floor as `CLAUDE.md` defines it, the offset it names (7 353 − 4 834 =
2 519) is arithmetically right, and it leaves the commit message alone as history.

**Head-room figures are right.** `agents/` +766 against 4 069 remaining, leaving 3 303 of 18 000;
`skills/` +750 leaving 10 220 of 20 000; the `skills/` split (729 + 21 for the rename) is exactly
3 × 7 characters. The `12 000-byte head-room` quoted in `260819-0040`'s closure matches
`GROWTH_BUDGET` in `rules-emission-golden.test.ts:251`.

**The `README-agents.md` enumeration matches the partition table row for row.** Five topics, five
files named, and "three of them … means no agent at all" names exactly the three rows whose Emitted-to
cell reads "no agent".

**The `.gitignore` sentence is now accurate on both consequences.** `rules/workbench-tracking.md:18`
says the second consequence lost its skill consumer and is kept because it governs any command that
sweeps the tree; `.gitignore:65-66` now says exactly that, and repoints to the authoring home.

**The High finding's fix is real, and its failure path exists.** `skills/archive/SKILL.md:33-45` runs
`cat "$FUSION_SRC/rules/workbench-tracking.md"` inside Step 1's block, the sentence under it
instructs a full read before Step 2, `## Process` step 1 says "Step 1 above — **both halves**", and
the lede at `:11` was tightened to name the step. A run following the Process list performs the read.
Behaviour still does not *depend* on the file — the failure path itself says "the tier tables below
still apply" — but that is what fix direction 1 accepted, not a shortfall against it. The shape of
the shell block is a separate finding below.

**The Phase-4 case split is disjoint and complete.** Two branches, a three-way disjunctive antecedent
reaching one action, `Otherwise` for the rest. Nothing falls through and no input reaches two
outcomes.

## Findings by theme

### Closures that state more than the edit delivers

**M1 — the `Status:` qualifier closure names one remaining site; a shipped agent prompt carries a
second.** `260819-0041_c_…-transitioning…`'s own fix direction was "Drop the qualifier in **all three
places** … One clause, three files". `rules/fusion-workbench-conventions.md:525-527` was fixed;
`agents/orchestrator.md:302-303` still reads "hand-correcting it on a record you are not
transitioning destroys the evidence the removal was decided on", which is the clause the record
identified as the *origin* of the phrasing. The follow-up record filed in `83488e9`
(`260819-0756_o_…`) names `docs/upgrading-to-v10-2.md` only. So one of the two shipped surfaces that
carried the qualifier is now recorded nowhere. `260819-0821_o_…`

**M2 — the fifth `fusion-source-root` call site drops the diagnostic its four siblings carry.**
`skills/archive/SKILL.md:39` is a one-liner where `skills/{next,setup,cleanup,help}/SKILL.md` all use
the same five-line `if`/`else`. It omits `${FUSION_PLUGIN_ROOT:-}`, so an unset root yields
`FUSION_SRC=""` and a `cat "/rules/workbench-tracking.md"`; and it prints nothing, so the two causes
that reach the same branch are indistinguishable again. Both properties are what
`260810-2110_c_fusion-src-resolves-to-the-empty-string-with-no-report-…` was filed about and what its
`Resolved:` note settled. The prose under the block also says "if neither root yields the file" for a
block that tries one. `260819-0822_o_…`

**L1 — "a stub is never read aloud as a clause" holds only for a section that is nothing but the
stub.** The added clause is a whole-section test ("empty or still holds **only** its angle-bracket
placeholder"). A section with one real clause plus the leftover placeholder falls to *Otherwise*, and
the placeholder is put to the user. The split is fine; the closure sentence is a universal the test
does not support. `260819-0824_o_…`

**L2 — the fold note credits the header table with carrying "verbatim" what the rule file's own lede
carries.** The removed paragraph's exact words, reason clause included, are at
`rules/workbench-tracking.md:7`; the header table row at
`rules/fusion-workbench-conventions.md:16` is a compressed cell that omits the reason. And the
paragraph was merged into the sentence above it rather than folded out, so the conventions file still
states the audience. Nothing normative was lost — the attribution is wrong, not the fold.
`260819-0827_o_…`

### What the fold cost

**L3 — the exclusion list became a phrase the cited tree does not use for half of it.**
`rules/workbench-tracking.md:9` now says "the layout tree names the artifact stores". The tree labels
`circles/` and `shared/` in terms a reader can map to that; it labels `archive/` "target of cleanup's
archive step" and `stilwerk/` "stylometric profiles", neither of which is an artifact store by the
tree's own words. Mitigated, and stated as such in the record: the split's two groups tile the tree's
root entries exactly, so the excluded four are recoverable as the residual — what was lost is reading
the scope forward instead of inferring it backward. `260819-0826_o_…`

### Measurement surfaces

**L4 — the fixed `gate_hit` reason is absent from the Observability row.**
`agents/orchestrator.md:866` fixes `Circle stop conditions` "that exact string, no other phrasing";
the `gate_hit` row at `:1235` still reads "Gate reason" and names no reserved value, while the
`gate_response` row was updated. The measurement `260817-1613` reserves is a rate, and its numerator
is recoverable only from the reason string. The closure is honest about this — it claims only the
second row — so it is an omission, and the exposure is drift: one surface can be reworded with
nothing to contradict it. `260819-0825_o_…`

**M3 — the recorded reason for leaving `260819-0041` open is contradicted by `install.sh`'s default
ref.** The tag half checks out: `v10.2.0` is `e14b6ca`, an ancestor, and `b54ace5` is after it, so no
*tagged* release carries the removal. But `install.sh:34` is `REF="${FUSION_REF:-heads/main}"`,
`README.md:14` gives the command with no override, and `CLAUDE.md` calls that path the recommended
one — so an install or `fusion --update` today carries the removal while `plugin.json` still reads
`10.2.0`. "A v10.2 note tells an installed base it carries a change it does not" is false for that
population, and `docs/upgrading-to-v10-2.md` is the document they would consult. Leaving the record
open is still right — its own fix direction already argues the release-time case — but on a different
reason than the one recorded. `260819-0823_o_…`

### The mandate that outran its reader

**L5 — the stopping section is made mandatory for plans whose only stated reader never runs.**
`agents/planner.md:160` extends the section to the no-Circle case in the same parenthesis that says
"Its whole enforcement is a human answering the orchestrator's question at Phase 4". Phase 4 runs
only when a Circle is being closed (`agents/orchestrator.md:856`). The wording half of the Turn-1
rider was answered; the enforcement half was not, and the paragraph now contradicts itself for the
population it just added. Not an argument for building a reader — an argument for one clause saying
there is none. `260819-0828_o_…`

## Cross-cutting observations

**The Turn-1 pattern moved one layer inward.** Turn 1's dominant finding was a change realised inside
its declared surface with an outside surface left stale. Turn 2 fixed four instances of that and
produced a successor: a `Resolved:` note whose guarantee is one degree wider than the edit. M1, L1 and
L2 are all that, and in each case the *edit* is right and the *sentence about it* is not. The
difference matters for whoever reads these records next: a stale outside surface is found by grepping
for the fact; an overstated closure is found only by re-doing the check, which is what a review is
for and what nothing else in the loop does.

**Concurrency discipline improved and left one residue.** The Turn's own change — no executor runs the
suite, no executor writes a shared pinned constant, one consolidation pass measures the settled tree —
worked: the eight per-file figures reproduce exactly, the two goldens were regenerated once after
everything landed, and the introduced `SRC` defect was caught inside the Turn by the agent that did
not cause it. The residue is M2: the same three-way split that kept the tasks apart also meant nobody
compared the new shell block against the four that already existed.

**Two measurement artifacts are now honest and one reference surface is not.** The `260816-1707`
footer correction, the U4 note's eight-figure attribution and both re-approval blocks all state their
method, their interaction terms and their negative contributions. Against that, the `gate_hit` row
(L4) is the one place a person building the reserved measurement would look and the one place the
fixed string is not written.

## Recommended sequencing

**Next Turn, cheap and self-contained** — M1 (one clause, one file, and it shrinks the paragraph).
L4 (one table cell). L1 and L2 (correct two `Resolved:` sentences; no code).

**Wants a shape decision, not a wording fix** — M2. Either the one-liner adopts the four-line shape,
or somebody decides the guarded one-liner is the new convention and the other four follow; leaving
five sites in two shapes is the condition `260816-0133_o_…` already stands open on.

**Before the next release** — M3, and with it the version bump. Twelve commits now sit on `main` past
`v10.2.0` with `plugin.json` unmoved, which is what makes two populations share a version string.

**Weigh, do not rush** — L3 (four tokens back, or one word in the tree's comment column) and L5 (one
clause, but it touches what `260817-1613` deliberately did not build).

**Not a release blocker.** Nothing in this range breaks a flow, loses data, or changes what any hook
decides. The suite is green, `dist/` is a faithful build, and the ten closures do what their records
approved.

## Two working-tree observations, filed nowhere

Neither is in the range and neither is a defect in it, recorded here because a reader of this range
will see them.

- An untracked zero-byte `Test.txt` sits at the repository root, `mtime` 2026-08-19 07:58 — one
  minute after `06ab15b`. Nothing references it.
- `git worktree list` still registers a detached worktree at `3a0408a` under another session's
  scratchpad. U4's own note named it and correctly left it; this pass removed only the one it created
  itself.

---

**Reconciliation 260819-0840** (reconciler, domain `code`, HEAD `83488e9`). Every claim in `## What was verified and holds` was re-checked independently and reproduces: `cd hooks && npx vitest run` is green at 36 files / 672 tests; `npm run build` leaves `git status -- hooks/dist` empty, so the committed `dist/` is the compilation of the committed source; the always-on floor is 98 733 bytes at HEAD and 98 796 at `5ec26b2`. All eight findings stand as filed and open.

Two items this pass adds to the ones above. **A fourth overstated closure**, on the same pattern as M1, L1 and L2 and outside this review's range: `260811-2146_c_*` states two defects and was closed on the first, leaving its own `## The second half` — the unfilled footer stub the decision-record template still prescribes — untouched. Filed as `shared/issues/260819-0836_o_*`, with a `Revised by:` line on the closed record. **The stray `Test.txt`** recorded under `## Two working-tree observations, filed nowhere` now has a filing home, `shared/issues/260819-0837_o_*`: `git check-ignore` returns nothing for it, so any pass reaching for `git add -A` at the repository root commits it. The second observation, the detached worktree under another session's scratchpad, is correctly left where it is.
