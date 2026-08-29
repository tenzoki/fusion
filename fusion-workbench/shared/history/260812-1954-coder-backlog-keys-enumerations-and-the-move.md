# Coder session — the backlog keys, the five enumerations that learn about them, and the file that made the store real

**Date:** 2026-08-12 19:54
**Agent:** coder
**Status:** Complete
**Plan:** `260812-1720_*_circle-first-placement-and-the-backlog-store.md`, steps 4, 5 and 6
**Predecessor:** `260812-1938-coder-backlog-store-and-resolver-target.md` (steps 1–3, `3c6ec4e`)

## What was done

**Step 4 — `OUT_BACKLOG` and `SCAN_BACKLOG`.** Both resolve to `shared/backlog`
unconditionally, added to `ORDER` beside `OUT_MEMO` and `SCAN_CONSULT` and to `value_for`
as literals rather than through `$OUT_BASE` or `scan_value`. That placement is the whole
implementation: a literal is immune to both the pointer and the `<circle-dir>` argument by
construction, so "unconditionally shared" is a property of the code shape rather than a
condition somebody has to keep true.

The argument is what makes this key set different from its three siblings. `OUT_MEMO`,
`OUT_CONSULT` and `OUT_INVESTIGATION` were written when the only way a Circle could reach a
key was `.active-circle`; step 2 added a second way, and these two keys are the first of
their class to exist alongside it. Five tests, all in `hooks/lib/__tests__/fusion-paths.test.ts`
(78 → 83): both keys emitted for a prompt that names them; both shared with a Circle active,
`SCAN_BACKLOG` asserted to carry exactly one store; both shared under a target Circle, run
twice with and without a different Circle active; both shared when the target *is* the
active Circle; and neither emitted to five shipped prompts that name neither.

The consumer in those tests is a fixture prompt driven through a staged copy of the script,
because no shipped prompt names either key until steps 7 and 8. `runStaged` gained a
`...args` parameter so a staged run can pass a target at all.

**Step 5 — five enumerations, not four.** The plan named four; a fifth exists and is now
included (see *What the plan got wrong*).

1. `skills/setup/SKILL.md` — `shared/backlog` added to the `mkdir -p`, and the sentence
   naming the shared-only kinds went from three to four with the reason attached.
2. `hooks/lib/staging-drift.ts` — `"backlog"` added to `STORES`, so an uncommitted entry is
   an unstaged `record` and enters the verdict. Verified live in this workbench, not only in
   a fixture: `bin/fusion-staging-drift` now prints
   `record RM 260811-0826_*_observations.md UNSTAGED (an authored record under the backlog store)`.
3. `hooks/lib/__tests__/path-literal-lint.test.ts` — `"backlog"` added to `TYPE_FOLDERS`, so
   a prompt naming the literal path fails the gate. The whole tree still passes, and two
   fixtures were added: `260812-1720_*_an-idea.md` must fire, and the
   log-activity legend row `| b | backlog entries |` must not.
4. `skills/archive/SKILL.md` — a Tier 1 row for `$SCAN_BACKLOG` `*_c_*.md`, safety filter 2
   extended to name backlog entries in both its live-marker groups, and a paragraph in Step 1
   saying that `$SCAN_BACKLOG` must **not** be run through `shared_of`, because a shared-only
   kind has no Circle half to strip and the no-op would read as a real derivation.
5. `skills/log-activity/SKILL.md` — legend code `b`.

Plus `hooks/lib/__tests__/reference-resolution-lint.test.ts`, the fifth enumeration: `backlog`
added to its `STORES` alternation, so a citation of a backlog entry in a rule, prompt, skill,
doc or `hooks/lib` comment is resolved against the tree like every other record citation
rather than passing unexamined.

**The `shared/backlogs/` docstring, rewritten in three places rather than one.** The plan
said the module docstring in `hooks/lib/staging-drift.ts` is the only place in code that
names it. It is one of three: `hooks/staging-drift.ts`'s sample output block and
`bin/fusion-staging-drift`'s header carry the same example. All three now name `stilwerk/`,
which is a real, live, permanent unclassified case — the voice profiles `/fusion:setup`
copies in, hand-edited by the project, neither a record nor live state.

The example was rewritten rather than deleted, and the module docstring says what happened
to the old one, because the transition is the class explaining itself: the file did not
change, its home was named, and it moved from `unclassified` to `record`. An unclassified
entry is a file the layout has not yet decided about, and the honest thing to do with one is
print it and claim nothing.

`hooks/lib/__tests__/staging-drift.test.ts` moved with them — its header property 2, one test
title and two fixtures used `shared/backlogs/` and called it "the live example", which after
step 6 it is not. The fixtures pass either way (`backlogs` is not `backlog`, so `STORES` never
claimed them), so this is a truth repair, not a fix. One test was added: an uncommitted
backlog entry is an unstaged `record`.

**Step 6 — the move.** `git mv` from `shared/backlogs/260811-0826_observations.txt` to
`260811-0826_*_observations.md`, the empty `shared/backlogs/` removed, and one
head line prepended:

> `# Raw observations, hand-written by the user: about a dozen distinct ideas in one dump, awaiting consolidation by the playmaker`

Measured: 12 251 → 12 380 bytes, +129, which is the head line and the blank line after it and
nothing else. The dump was not split, not reordered, not edited. Splitting it would be
consolidation, consolidation is the playmaker's job as of step 7, and a job whose first input
is a dump somebody already pre-digested is not the job being tested.

## The deviation, on record

**Step 6 is assigned to `ontocoder` in the plan and was done by `coder`,** on the dispatching
instruction. The plan's routing rule sends workbench records to `ontocoder` and behaviour
files to `coder`, and by that rule the assignment is right. It was overridden because the step
is a `git mv` and a one-line head on a Markdown file — no structured data, no schema, no
manifest — and splitting a three-step dispatch across two agents to move one file costs more
coordination than the rule protects here. Recorded so the deviation is a decision rather than
a discovery.

## The context cost, measured

**Nothing entered the always-on corpus.** `rules/fusion-workbench-conventions.md` is untouched
by these three steps, and `hooks/lib/__tests__/fixtures/rules-emission.golden` is byte-identical
— the emission golden passing is the proof, since it records the size of every file
`bin/fusion-rules` emits to every agent.

The reasoning went to `rules/workbench-path-resolution.md`, which is emitted to no agent, as a
new `### The four unconditionally-shared kinds, and the one that meets the target argument`
subsection plus two key-table rows. Everything else changed is a skill body (loaded only when
that skill runs), a `bin/` script header, a hooks comment, or a test.

For continuity with the predecessor's measurement: steps 1–3 added 3 866 bytes to the
sixteen-agent corpus; steps 4–6 add zero.

## Verification

`cd hooks && npm test` — **exit 0**, 48 files, 1003 tests. Run twice, green both times; the
`Worker exited unexpectedly` parallel-load flake
(`260811-2009_*_is-the-hooks-suite-meant-to-be-run-concurrently-with-itself-and-if-not-who-serialises-it.md`)
did not appear. Baseline at `3c6ec4e` was 995 tests; the eight added are five in
`fusion-paths.test.ts`, two in `path-literal-lint.test.ts` and one in `staging-drift.test.ts`.

Beyond the suite, two live reads against this workbench rather than a fixture:
`./bin/fusion-paths archive` emits `SCAN_BACKLOG=shared/backlog`, and
`./bin/fusion-staging-drift` classifies the moved file as a `record` under the backlog store.

## What the plan got wrong

**One counting error, corrected.** Step 5 says the `shared/backlogs/` worked example lives in
`hooks/lib/staging-drift.ts`'s module docstring and that "the docstring is the one place it is
named in code". It is named in three: that docstring, `hooks/staging-drift.ts`'s sample output
block, and `bin/fusion-staging-drift`'s header comment — plus four places in
`staging-drift.test.ts`. Fixing only the one named would have left two shipped headers showing
a path that no longer exists as their worked example of a class the path no longer belongs to.

**One enumeration missed.** Step 5's premise is that a store nothing enumerates is a directory
somebody has to remember, and it lists four enumerations. A fifth exists:
`hooks/lib/__tests__/reference-resolution-lint.test.ts` carries its own `STORES` alternation,
which is what makes a record citation resolvable against the tree. Left out, a citation of a
backlog entry in any gated file would have gone unchecked — and this plan's own step 11 is
about extending exactly that lint. Added, with the suite green.

**One expectation in the Testing Strategy that the gate does not meet, stated rather than
worked around.** It says "`path-literal-lint` fails on a prompt naming `shared/backlog`
literally". It does not, and should not: `shared/` is deliberately not a prefix root in that
gate, because `shared/memos` appears legitimately in `skills/memo/SKILL.md` documenting the
resolver's own output and is shape-identical to a violation. What fires is the *suffix* form —
`backlog/` followed by a path continuation, which is `shared/backlog/<file>` and every other
real literal. A bare `shared/backlog` with nothing after it does not fire, exactly as a bare
`shared/memos` does not. The gate's coverage is unchanged in kind; the plan's sentence
overstated it by one shape.

**Two smaller notes, both handled.** `skills/archive/SKILL.md` derives a `$SHARED_*` value for
each kind by stripping the active Circle out of the `SCAN_*` value, and its empty-derivation
check halts on a kind that comes back blank. `SCAN_BACKLOG` has no Circle half to strip, so it
is used directly, with the reason written beside it — otherwise the next editor adds it to the
`shared_of` line for symmetry and the check starts guarding a derivation that never happens.
And `skills/log-activity/SKILL.md` scans `*.md` only, so the file was invisible to it as a
`.txt`; the rename in step 6 is what brings it into the activity log at all, and the legend row
is what gives it a code when it arrives.

## Files changed

- `bin/fusion-paths`
- `bin/fusion-staging-drift`
- `rules/workbench-path-resolution.md`
- `skills/setup/SKILL.md`
- `skills/archive/SKILL.md`
- `skills/log-activity/SKILL.md`
- `hooks/lib/staging-drift.ts`
- `hooks/staging-drift.ts`
- `hooks/lib/__tests__/fusion-paths.test.ts`
- `hooks/lib/__tests__/path-literal-lint.test.ts`
- `hooks/lib/__tests__/reference-resolution-lint.test.ts`
- `hooks/lib/__tests__/staging-drift.test.ts`
- `hooks/dist/**` (rebuilt by `npm test`: `staging-drift.js`/`.d.ts` in both locations)
- `fusion-workbench/shared/backlogs/260811-0826_observations.txt` → `260811-0826_*_observations.md` (moved, one head line added)
- `260812-1720_*_circle-first-placement-and-the-backlog-store.md` (steps 4–6 marked `[DONE]`)

Not committed — the orchestrator commits. Step 7 not started, by instruction.
