# The remaining text defects, the orphaned reference, and the Turn's consolidation

**Agent:** coder
**Circle:** `circles/260819-1645-four-constraints-on-deep-change`
**Task:** Turn 2, F4 — seven defect records, one sentence made false by a sibling task, and the
consolidation of three concurrent tasks into one settled tree
**HEAD at start:** `8e7cae7`, with F1, F2 and F3 landed uncommitted
**Status:** Complete

---

## The sentence F3 made false

`agents/planner.md:160` claimed of the `## Where this Circle stops` section that **nothing reads it
mechanically**, that no gate, lint, helper or agent step parses it, and that none is planned. F3
armed `hooks/lib/__tests__/plan-stopping-section-lint.test.ts` in the same Turn, which parses it.

The paragraph now says a gate reads it for **presence and never for substance** — absent, empty, or
still the shipped angle-bracket placeholder — and that whether a clause is the *right* one is still
the human answering the orchestrator's Phase 4 question, which reads the section back clause by
clause. The third sentence is the one worth keeping: the split between the two is what makes the
gate buildable at all, because whether a heading carries a body is settled by reading the file and
whether a stopping condition is correct is not. That is the same distinction the gate's own header
draws against the two mechanisms this repository deleted for predicting an undecidable question.

**+186 bytes** on `agents/`, the tightest of the four bounded surfaces.

## The seven records

Five carry a `Resolved:` note. Two carry a progress note and stay open on their own terms. **No
marker was transitioned and no plan step was marked** — both are the orchestrator's.

**Neither new blocking gate is named on any shipped surface** (`260820-0805`). Three gates now, not
two. `README-hooks.md` gained `### Three gates that can fail the suite over text nobody compiled`
between `### Running tests` and the growth bounds: a table naming each gate, what reddens it and
what its failure prints, then the paragraph the record asked for about the citation gate's accepted
cost. `### Rebuilding after TS changes` gained the clause turning its stated obligation into a named
gate. `CLAUDE.md` gained the row. Neither file is inside a bounded surface.

**The sibling pin was re-approved "four times"** (`260820-0805`). Recounted here rather than taken
from either report: `grep -c '^// Re-approved'` returns **14**, and the 6 further case-insensitive
matches are prose inside those notes and in the failure message. The comment now states the property
and no number, with a sentence saying why — and that reasoning was load-bearing within the hour,
because this task's own shipped-text edits moved the sibling's pin to a 15th re-approval.

**The plan names a gitignored lockfile** (`260820-0805`). `git ls-files hooks/package-lock.json`
prints nothing; `.gitignore:7` carries the bare pattern. Corrected in the plan by an appended block
rather than a substitution, in the tense the fix direction asked for.

**The plan's `node:` grep does not reproduce** (`260820-0805`). Measured independently:
`git grep -o 'node:' b91c01c -- hooks/dist | wc -l` returns **18**, across **11** of the 36 files,
on 18 lines. Every one is an `import … from "node:fs"`, `"node:path"` or `"node:child_process"` in
an emitted `.js`. So the reconciliation's 18-across-11 reproduces and the review's 17-across-10 does
not. `git grep -c 'import(' b91c01c -- hooks/dist` returns nothing, so the half of the claim that
carries the conclusion holds: no `.d.ts` under `hooks/dist` has an `import(` type. `hooks/dist` is
byte-identical at `8e7cae7`. Both places the record named were corrected — the `## Current State`
paragraph and the `## Risks & Mitigations` row, whose `inference:` clause now claims only what was
established.

**The always-on budget was spent without a figure** (`260820-0805`). The core stands at **92 367
bytes** against a `RULE_BASELINE` floor of 86 573 and a `GROWTH_BUDGET` of 12 000, so the cap is
98 573 and **6 206 bytes remain**. That reproduces the record's figure and reconciles against the
7 193 reported before the +987 spend. The 99 720 the reconciliation reported is a different quantity
and not a competing measurement: `bin/fusion-rules coder | xargs wc -c` adds this project's own
7 353-byte chat voice profile to the five shipped files, and 92 367 + 7 353 = 99 720. The step's
`## Head-room` section now carries both and says which is which. The plan's "writing there costs no
budget" was qualified to the file it was measured against.

**The deletion annotation was not applied to its own worked subject** (`260820-0906`) — **item 1
done, item 2 open**. The bare token on line 14 of
`circles/260801-1244-guard-rules-write/decisions/260805-1548_*_wie-soll-ein-circle-verschwinden-duerfen-den-jemand-absichtlich-loescht.md`
now carries the form from `rules/circle-records.md`, in the literal English opening the rule makes
the recognition test, inside German prose — the form is template text and an exempt surface. Re-
scanned after the edit: that file yields **two** gate violations where it yielded three, and the
line 14 stamp has become an undecidable residual, which is what splitting the stamp from the slug is
for. Item 2 was deliberately not answered: the two remaining tokens name playmaker logs in a
consuming project's tree, the record's own German prose says so and the parser cannot read it, and
fencing them would settle by a silent edit a convention this repository has not chosen. The record
itself calls that item arguably a decision rather than a defect.

**A cross-reference names a record that was never filed** (`260819-2250`) — **repaired in the second
place, and it stays open.** `shared/analyses/260813-0831-the-seam-between-a-measured-answer-and-a-cited-one.md`
carried the same dead path in its `## Sources` list, outside every repair corpus. It now carries the
treatment step 7 gave the decision record: the path dropped, the substance kept. The bullet names
the stamp, states that no file with that slug has ever existed, and gives the measurement — commit
`799fded` added exactly two records at that stamp and neither is this one. **No target was
invented.** The curator stopped at this wall on 14 August and step 7 stopped at it again; what is
lost stays lost and is now recorded in both places. No citation anywhere in this workbench names the
record that was never filed. Neither of the record's two closure conditions has been met.

## Consolidation

`hooks/lib/__tests__/fixtures/surface-growth.golden` was regenerated twice — once after the record
work, once after the re-approval note — and `rules-emission.golden` was checked and is unmoved,
because no file under `rules/` was touched. Those are the only two goldens in the tree.

Every line that moved, and where it came from:

| Entry | Was | Is | Whose |
|---|---|---|---|
| `agents/planner.md` | 19 548 | 19 734 | this task, +186 |
| `committed-dist.test.ts` | 253 | 329 | F1, +76 |
| `helpers/citation-scan.ts` | 857 | 921 | F1, +64 |
| `reference-resolution-lint.test.ts` | 1 238 | 1 315 | F1 +51, this task +26 |
| `plan-stopping-section-lint.test.ts` | — | 284 | F3, new |
| `workbench-citation-lint.test.ts` | 241 | 347 | F2 +102, this task +4 |

**The three siblings' reports reconcile exactly.** F1's +191 is 76 + 64 + 51; F2's +102 and F3's
284 stand as reported. 191 + 102 + 284 = 577, plus this task's 30, is **+607**, and the hook-test
total moved 19 607 → 20 214. `skills/` did not move at all.

**Head-room after everything, measured rather than carried forward.** No bound is over.

| Surface | Left | Unit |
|---|---|---|
| hook tests | **161** | lines |
| `agents/*.md` | 2 728 | bytes |
| `skills/*/SKILL.md` | 9 711 | bytes |
| always-on rule set | 6 206 | bytes |

The dispatch's figure of 191 lines of hook-test head-room reproduces exactly at the state it
described: 20 184 lines with the three siblings present and this task's 30 not yet written. The 161
is what remains after them. **No baseline was edited** — the rule is a cut, and none was needed.

## The re-approval this task owed

`reference-resolution-lint.test.ts` `BASELINE` moved from `{ paths: 1180, anchors: 156, records: 109 }`
to `{ paths: 1194, anchors: 157, records: 111 }`, with the 15th re-approval note above it.

The movement is entirely this task's three shipped-prose edits, and it was **measured rather than
inferred**: the three files were reverted to `8e7cae7`, this gate ran green at the old numbers, and
they were restored. No scanner, exemption or class changed, so the tokens are attributable one by
one — 14 paths (`hooks/dist/` ×3, `committed-dist.test.ts` ×3, `plan-stopping-section-lint.test.ts`
×3, `workbench-citation-lint.test.ts` ×2, `hooks/package.json` ×2, `README-hooks.md` ×1), 1 anchor
(`CLAUDE.md`'s pointer into the new README section), 2 records (the corpus decision, once per
surface). The four test files this Turn edited contribute nothing, because `surface()` never enters
`hooks/lib/__tests__`.

## What was not done

- **No marker transitioned, no plan step marked, nothing committed.**
- **No baseline edited to clear a bound**, and none needed clearing.
- `fusion-workbench/agentstate.yaml`, `orchestrator-live.md` and `orchestrator-events.jsonl` were
  not touched.
- The external-reference question on line 7 of the deletion decision is left open and unfenced. It
  is a convention this repository has not chosen, and choosing it by a silent edit is the failure
  the record it sits in was filed about.

## Verification

`cd hooks && npm test` — **exit 0**. 40 test files, 716 tests, 68 seconds. Output redirected to a
file so the exit code read is the process's own. This is the Turn's first settled-tree run, and it
was run twice at exit 0 — once when the record work settled and once after this log was written, so
the reported code is the code for the tree as it now stands and not for an earlier one.

One earlier full run in this task was **exit 1**, on the `reference-resolution-lint` baseline pin,
and it is recorded rather than dropped: it is the gate doing its job, the numbers it printed are the
numbers written into `BASELINE`, and the A/B revert above is what established they were this task's
and not a sibling's.
