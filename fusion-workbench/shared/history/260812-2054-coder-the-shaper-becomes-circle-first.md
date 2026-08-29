# Coder session — the shaper becomes Circle-first, and one rename it does not always make

**Date:** 2026-08-12 20:54
**Agent:** coder
**Status:** Complete
**Plan:** `260812-1720_*_circle-first-placement-and-the-backlog-store.md`, step 8
**Predecessors:** `260812-1938-coder-backlog-store-and-resolver-target.md` (steps 1–3, `3c6ec4e`),
`260812-1954-coder-backlog-keys-enumerations-and-the-move.md` (steps 4–6, `dec40bb`),
`260812-2010-coder-the-playmaker-gains-the-backlog-job.md` (step 7, `6e261c4`)
**Decision realised (not marked; step 13 owns the marker):**
`260812-1720_*_when-exactly-does-the-anticipated-circle-come-into-existence.md`

## What was done

`agents/shaper.md` gains one placement rule for all four modes, the Circle-first ordering and its
second resolution in mode 4, the backlog entry as a valid draft, one new write permission, and
mode 3's spec moving inside the Circle it activates. `hooks/lib/__tests__/fusion-paths.test.ts`
gains the read-key/write-key asymmetry test for the shaper and drops `shaper` from the list of
prompts that name neither backlog key.

**Mode 4, the ordering.** One rule: *the Circle is this mode's first write, and every later write
of the run lands inside it.* The two cases the decision names fall out of it rather than standing
beside it — clarification writes nothing, so the ordinary run creates the Circle once round 1 is
answered, and a round 1 that leaves a deferred decision creates the Circle before that record is
filed. The immutable name is the reason the moment matters, and the sentence that carries the rule
says so: the Directive the name is drawn from has survived one round of questions. A run that
concludes there is no Circle has written nothing, so no empty directory is ever left behind.

**Mode 4, the second resolution.** `fusion-paths shaper <new-dir>` immediately after creating the
directory, values held for the rest of the run. Cited, not restated:
`rules/fusion-workbench-conventions.md` `## Path Resolution` → *Where the call belongs* is the
authoring home step 3 wrote it into, and it already names this mode as the case. The prompt says
what to run and why the writes then land inside; it does not re-argue the exception.

**Mode 3 does not use that exception, and does not need one.** The plan says mode 3 resolves with
the Circle as target but not when. Setup is when: the Circle already exists and the dispatch names
it (`**Circle file:**`, whose parent is the directory), so Setup step 2 passes it as the second
argument and the run has exactly one resolution. The documented exception covers a consumer that
*creates* a Circle, which mode 3 does not — reading it as licence here would have widened a rule
written to be conditional on a fact. The shape reused is the planner's `**Circle:**` parameter
from step 9: a dispatch parameter read before the Setup call.

**Mode 3's deleted paragraph, and the three places that repeat it.** The sentence explaining that
the spec correctly lands in the shared store is gone, replaced by one clause saying it lands
inside the Circle. The positive rule that replaces the exception is one sentence in the mode
intro: all four modes write where `fusion-paths` points, the Circle in scope or `shared/`, and no
mode writes across stores. Three other files carry the same claim; see *What the plan got wrong*,
item 3.

**The one new write permission, and the key set that bounds it.** `## Scope` gains clause (c):
close the backlog entry a draft came from — one marker rename to `_c_`, one appended `Promoted:`
line, nothing else. Only `$SCAN_BACKLOG` entered the prompt. `$OUT_BACKLOG` did not, though the
plan asks for both, because key derivation greps the prompt: the shaper reads an entry and closes
one, and neither act needs a write target under the store, so a run that tried to file an entry
has no resolved path to file it to. That is step 7's pattern for the playmaker, and the same test
shape asserts it. Verified live: `./bin/fusion-paths shaper` emits `SCAN_BACKLOG=shared/backlog`
and no `OUT_BACKLOG`.

## The two walks, run before finishing

**Walk 1 — an ordinary `/fusion:direct`, on paper.** Draft "make the monitor show the backlog",
one clarification round, then: slug from the answered Directive, `circles/<stamp>-<slug>/` with
`_a_circle.md` and six subdirectories created under `$OUT_CIRCLE` (unconditional `circles`, so the
pre-resolution value is correct), re-resolve, history file lands at
`circles/<stamp>-<slug>/history/…`. Checked against the resolver rather than assumed:
`./bin/fusion-paths shaper 260718-1924-v5x-overhaul` moves `OUT_PLAN`, `OUT_HISTORY`, `OUT_ISSUE`
and `OUT_DECISION` inside, leaves `SCAN_BACKLOG` shared, and emits no `CIRCLE`.

The walk found one thing worth recording. `/fusion:direct` is documented safe during an active
orchestrator session, and before this change the shaper's Setup resolved `OUT_HISTORY` into the
**active** Circle — so a Circle captured mid-session wrote its shaper history into an unrelated
Circle's store. The first-write rule closes that window without naming it: nothing is written
before the new Circle exists, and everything after it is resolved against the new Circle.

**Walk 2 — the real backlog entry, and it refuses the plan's instruction.**
`260811-0826_*_observations.md` is the store's only occupant: 12 380 bytes, about a
dozen unrelated observations (setup latency, agent verbosity, operation latency, rules decaying
mid-session, ETA not computed, the monitor's localhost, absolute paths for editor opening,
imprecise sub-agent instructions, fusion spending its time on itself, the churn spike, radical
simplification). Step 8b as written says: after creating the Circle, rename the entry `_o_` → `_c_`
and append a `Promoted:` line. Run against this file that instruction closes eleven ideas nobody
read, in the only entry the store has, in one rename — and the promotion path cannot do otherwise,
because it takes an entry whole.

So the instruction shipped is bounded by the fact the design already rests on: **an entry is
promoted whole or not at all.** The rename says this entry *became* this Circle. That is true of a
one-idea entry, which is the shape `## Backlog entries` fixes as the minimum, and false of a
multi-idea one. Where a multi-idea entry reaches the shaper anyway, round 1 asks which idea the
Circle is, the entry is left untouched, and the report names what is still in it. That is one rule
with the cases falling out of it, not a condition bolted on: the write fires exactly when the
statement it makes is true.

This is the same refusal step 7 wrote into the playmaker from the same file — a multi-idea entry
is recommended for splitting first, never for shaping. The two agents now agree, and the prompt
cites the playmaker's step rather than restating the reason.

**The residual, stated rather than hidden.** After a partial promotion the entry still contains an
idea that has become a Circle, and nothing on the entry says so. Appending a `Promoted:` line
without the rename would record it, and it was rejected: it splits one permitted write into two
that fire independently and puts an entry in a state (`_o_` carrying `Promoted:`) no vocabulary
defines. The user's remedy is the one already recommended, which is to file the pieces. Whether
that is good enough is the user's call, not a prompt edit's.

## The context cost, measured

| file | before | after | delta | paid by |
|---|---|---|---|---|
| `agents/shaper.md` | 20 449 | 23 789 | **+3 340** (+16.3 %) | shaper dispatches only |

**Nothing entered the sixteen-agent corpus.** No file under `rules/` was touched, and
`hooks/lib/__tests__/fixtures/rules-emission.golden` is byte-identical — the golden passing is the
proof, since it records the size of every file `bin/fusion-rules` emits to every agent. The two
files changed are one agent prompt and one test.

The text was written and then cut once by 183 bytes (the re-resolution paragraph, the ordering
rule and the promoted-whole paragraph each tightened); that cut is in the number above. What
remains that could have been a citation is small: the "no empty directory" sentence, about 90
bytes, restates a consequence the decision record already argues. It was kept because it is the
one line that tells a run what to do when clarification ends in nothing, and a run does not read
the decision record.

## Verification

`cd hooks && npm test` — **exit 0**, 48 files, 1005 tests. Baseline at `6e261c4` was 1004; the one
added is the shaper key-asymmetry test. Run three times, green at exit 0 each time, the third
against the final file state after the trimming pass. The `Worker exited unexpectedly`
parallel-load flake
(`260811-2009_*_is-the-hooks-suite-meant-to-be-run-concurrently-with-itself-and-if-not-who-serialises-it.md`)
did not appear.

Two live reads beyond the suite, against this workbench rather than a fixture:
`./bin/fusion-paths shaper` (read key present, write key absent) and
`./bin/fusion-paths shaper 260718-1924-v5x-overhaul` (every `OUT_*` inside the target, both stores
in each Circle-bound `SCAN_*`, `SCAN_BACKLOG` shared, no `CIRCLE`). The three gates that read this
prompt — `path-literal-lint`, `reference-resolution-lint`, `fusion-paths` key derivation — pass.

## What the plan got wrong

**1. Step 8b's rename is destructive against the only entry in the store.** See walk 2. Shipped
bounded rather than unconditional. This is the third time this plan has met the same fact from a
different side: the plan's own step 6 refused to split the dump, step 7 refused to recommend it
for shaping, and step 8 now refuses to close it on promotion.

**2. `$OUT_BACKLOG` should not enter the shaper's prompt.** Step 8b asks for both keys. Adding the
write key would have given a "files no entry" bound a resolved path to disobey with. Omitted, as
step 7 did for the playmaker.

**3. Mode 3's paragraph has three surviving twins, two of them owned by later steps and one owned
by nobody.** `skills/direct/SKILL.md:88` (step 10) and `rules/circle-records.md:103` (step 14) are
scheduled. `agents/orchestrator.md:266` is not in any step's file list: it justifies the
workbench-relative path field with "because a spec written before the Circle existed legitimately
lives in another store". That clause is *not* false after this plan — mode 1 still writes a spec
to `shared/` with no Circle anywhere, and a Circle may later cite it — so it is left standing,
deliberately, and named here so step 14 can decide rather than discover. Between this commit and
step 10 the direct skill contradicts the shaper prompt it dispatches; that window is the plan's
ordering, not a defect introduced here.

**4. The Testing Strategy's end-to-end acceptance names an artifact mode 4 does not write.** It
expects `/fusion:direct <entry>` to produce "an anticipated Circle whose `planning/` receives the
spec". Mode 4 writes no spec — the Circle record is the artifact, which the prompt has said since
it was added and which this step did not change. The Circle's `planning/` stays empty until a
planner runs with the `**Circle:**` parameter from step 9. The round trip is still testable; the
assertion has to name the record and the closed entry, not a spec.

**5. Step 8c does not say when mode 3 resolves**, and the two available answers are not
equivalent: at Setup it is one resolution, mid-run it is a second exception to a rule written for
exactly one. Setup, per the reasoning above.

## Files changed

- `agents/shaper.md`
- `hooks/lib/__tests__/fusion-paths.test.ts`
- `260812-1720_*_circle-first-placement-and-the-backlog-store.md` (step 8 marked `[DONE]`)

Not committed — the orchestrator commits. Step 9 not started, by instruction.
