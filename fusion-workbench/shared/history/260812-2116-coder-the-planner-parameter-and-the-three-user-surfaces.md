# Coder session — the planner's Circle parameter, and the three surfaces the backlog reaches the user through

**Date:** 2026-08-12 21:16
**Agent:** coder
**Status:** Complete
**Plan:** `shared/planning/260812-1720_*_circle-first-placement-and-the-backlog-store.md`, steps 9 and 10
**Predecessors:** `shared/history/260812-1938-coder-backlog-store-and-resolver-target.md` (steps 1–3, `3c6ec4e`),
`shared/history/260812-1954-coder-backlog-keys-enumerations-and-the-move.md` (steps 4–6, `dec40bb`),
`shared/history/260812-2010-coder-the-playmaker-gains-the-backlog-job.md` (step 7, `6e261c4`),
`shared/history/260812-2054-coder-the-shaper-becomes-circle-first.md` (step 8, `406ec0d`)

## What was done

**Step 9 — `agents/planner.md` accepts `**Circle:** <directory-name>`.** The parameter joins the
block `**Executors:**` already lives in, and that block changed shape once: `### Parameter
parsing` was promoted to `## Parameter parsing`. It sat under `## Executor Agents`, which is the
right parent for one parameter and the wrong one for two — a reader looking for a Circle
parameter would not look under a heading about executors. One heading level moved; nothing else
in the section's identity did, and no file cites it.

The `**Executors:**` contract also had to give up one word. It read "the dispatch prompt's *first*
non-empty content line", and with two parameters only one of them can be first. The block is now
defined as the leading run of `**<Keyword>:**` lines with order not significant, which is
compatible with every dispatch shipped today (a single first line still parses) and defined for a
dispatch carrying both. Absent both, behaviour is byte-for-byte today's.

Setup step 2 gained the sentence that makes the parameter do anything, in the shape
`agents/shaper.md` mode 3 already uses: read the parameter before the call, pass it as the second
argument, and it is still one resolution at Setup.

**The bad-target branch is stated because the fallback is worse than the halt.** A `**Circle:**`
naming no directory exits 1 from the resolver. The prompt says halt and report, and says
explicitly not to re-run without the target — that second run *succeeds*, and it writes the plan
wherever `.active-circle` happens to point, which is the one placement the dispatcher ruled out by
naming another. A silent fallback here is a plan in the wrong Circle, found later by a reader.

**Step 10a — `/fusion:direct` takes an entry path.** The argument hint, the no-argument halt text
and Step 4 now say a backlog entry's path is a valid draft, passed through **verbatim**: not
opened, not normalised, not summarised. The paragraph explaining that a spec correctly lands in
the shared store is deleted, as the plan asks — its twin in the shaper went with step 8, and the
window between the two commits where the skill contradicted the prompt it dispatches is closed.

Step 4's old line "Do **not** pass shaper a path" became "do not pass shaper a **write target**",
because the first is now false in the letter and true in the intent.

**Step 10b — `/fusion:next` renders the section.** New render item 2, immediately after the top
Circle recommendation, which is where the portfolio's own section order puts it. `allowed-tools`
is unchanged, no agent is dispatched that was not dispatched before, and the skill reads the
section out of `portfolio.md`, which playmaker wrote at Step 3 — so the briefing path still
writes nothing.

**Step 10c — `/fusion:memo` gains the third target**, and it is the one the plan asked to have
thought about. Three kinds now: memo, task, idea. The write semantics are stated in the intro
rather than left to be inferred from the two siblings — the memo and task files are **append
logs**, an entry is **a new file each time** — and the `### Backlog entry` subsection carries the
filename pattern, the `_o_`-at-creation rule, the title-plus-paragraph floor, and the
collision rule.

`$OUT_BACKLOG` entered the prompt; no read key did. That asymmetry is the mirror image of the two
before it, and it is the first one that runs this way round: playmaker and shaper read the store
and cannot write it, `/fusion:memo` writes it and cannot read it. Consolidating entries is the
playmaker's job, and a run here that set out to do it has no resolved path to read from. A test
asserts it. Verified live: `./bin/fusion-paths memo` emits `OUT_BACKLOG=shared/backlog` and no
`SCAN_BACKLOG`.

**The inverse, checked for the other two.** `/fusion:direct` names no backlog key: it copies a
path into a dispatch prompt and never opens the file. `/fusion:next` names none either: it renders
what playmaker already wrote into the portfolio. Both are now asserted rather than merely true —
they joined the "emits neither to a shipped prompt that names neither" list, which `memo` left.
That is step 7's and step 8's discipline applied to a skill: the bound is mechanical by omission,
and the test is what keeps the omission from being an oversight next time.

**The bound on who files.** `/fusion:memo` becomes the one surface where the backlog is written,
and the store's rule says no *agent* files an entry. Two guardrails keep the new wording from
reading as a way around it: this skill never edits, renames, closes or defers an existing entry,
and it never files one on an agent's behalf — a finding an agent carried into the conversation
does not become the user's idea by being routed through here, and is still an issue or a decision
record.

## The two walks, run before finishing

**Walk 1 — `/fusion:memo idea: der monitor sollte den backlog zeigen`.** Step 0 resolves
`OUT_MEMO=shared/memos` and `OUT_BACKLOG=shared/backlog` (live, not assumed). The `idea:` keyword
routes to the backlog and is stripped. Stamp from `date +%y%m%d-%H%M`; slug kebab-cased from the
title; the path lands under the store step 5 created and step 6 filled, which exists on disk. The
file is **created** — `allowed-tools` already carries `Write`, so nothing new is needed — with the
title, `**Filed by:**` and one paragraph. The report says it is a new entry at `_o_` and that
`/fusion:next` shows it after playmaker's next run, which is true because that skill dispatches
playmaker before reading the portfolio.

The walk turned up one thing, and it is not this step's to fix. The entry's body is captured
**verbatim** — the skill's oldest guardrail — so a German idea filed in this project produces a
German entry, while the artifact language is `en` and the portfolio that cites it is written in
`en`. That tension is exactly as old as the memo log and is not created here; translating a user's
idea at filing time would be the "never rewrite the user's content" failure, so nothing was
changed. Named for the user rather than decided in a prompt edit.

**Walk 2 — `/fusion:next` against the store as it actually is.** The store holds one entry, the
12 380-byte dump, about eleven distinct ideas. Playmaker's Step 2b reads it, proposes a split,
names three duplicate groups and pushes two defect-shaped items (ETA not computed, the monitor's
localhost) to `## Warnings`. Its `## Backlog — ranked` first line is therefore the **split** form —
`Recommended to split first: <entry> — 11 ideas, top one is <slug>` — and it carries **no**
`/fusion:direct` line, by the refusal step 7 wrote in.

That is what the walk was for. **Step 10 as written says `/fusion:next` prints "the
`/fusion:direct <entry>` line the user can run", unconditionally.** Against the only entry that
exists, a render obeying that literally would synthesise an invocation playmaker deliberately
withheld, and running it would make one Circle of eleven observations and retire the lot in one
rename. The skill now says: print the invocation **only when the portfolio carries one**, never
construct one, and copy the line that is there or copy no line. The plan's sentence is corrected
downstream rather than reproduced.

The rendered briefing for today's store is one line — *"Aus dem Backlog: `<Eintrag>` — 11 Ideen in
einer Datei, zuerst aufteilen."* — with no count after it, because there are no further entries,
and no invocation. Nothing absurd in it. What it does mean is that the plan's end-to-end
acceptance is exercisable only with a **freshly filed one-idea entry**: against the store's
existing occupant, `/fusion:direct` is correctly not on offer at all.

A second observation from the same walk. The live `portfolio.md` was generated 260807-1646 and
carries no `## Backlog — ranked` section, so the "section absent" branch is not hypothetical —
though `/fusion:next` itself will rarely reach it, since Step 3 regenerates the portfolio before
Step 4 reads it. The branch is for an install whose playmaker predates the section.

## The context cost, measured

| file | before | after | delta | paid by |
|---|---|---|---|---|
| `agents/planner.md` | 16 554 | 18 013 | **+1 459** (+8.8 %) | planner dispatches only |
| `skills/direct/SKILL.md` | 7 409 | 8 769 | **+1 360** | `/fusion:direct` invocations only |
| `skills/next/SKILL.md` | 22 306 | 23 569 | **+1 263** | `/fusion:next` invocations only |
| `skills/memo/SKILL.md` | 7 288 | 12 382 | **+5 094** | `/fusion:memo` invocations only |

**Nothing entered the sixteen-agent corpus.** No file under `rules/` was touched and
`hooks/lib/__tests__/fixtures/rules-emission.golden` is byte-identical — the golden passing is the
proof, since it records the size of every file `bin/fusion-rules` emits to every agent. Steps 1–3
added 3 866 bytes to that corpus; steps 4 through 10 have added zero.

`+5 094` on the memo skill is the outlier and the honest reason is that a third target is not a
third bullet: it needs a routing rule against two existing kinds, an entry format, a filename
convention, its own place in the eleven-step process, and two guardrails. The text was written and
then cut once by 457 bytes — the intro's tail, the key paragraph, the routing default, the 12 KB
anecdote (the rule it cites already carries it) and the one-idea paragraph each tightened; that
cut is in the number above. What remains that could still have been a citation is roughly 200
bytes: the one-idea-per-entry paragraph restates a consequence steps 7 and 8 already wrote into
two prompts. It was kept because this is the surface that *produces* the shape, and an entry filed
wrong here is a problem two agents downstream inherit.

## Verification

`cd hooks && npm test` — **exit 0**, 48 files, 1006 tests. Baseline at `406ec0d` was 1005; the one
added is the memo key-asymmetry test. Run three times, exit 0 each time, the third against the
final file state after the trimming pass. The `Worker exited unexpectedly` parallel-load flake
(`shared/decisions/260811-2009_*_is-the-hooks-suite-meant-to-be-run-concurrently-with-itself-and-if-not-who-serialises-it.md`)
did not appear.

Four live reads beyond the suite, against this workbench rather than a fixture:
`./bin/fusion-paths memo` (write key present, read key absent), `./bin/fusion-paths direct` and
`./bin/fusion-paths next` (neither key), and `./bin/fusion-paths planner 260718-1924-v5x-overhaul`
(every `OUT_*` inside the target, both stores in each Circle-bound `SCAN_*`, no `CIRCLE`), plus
`./bin/fusion-paths planner no-such-circle` → exit 1 with the argument named. The gates that read
these four files — `path-literal-lint`, `reference-resolution-lint`, `queue-ground-lint`,
`fusion-paths` key derivation — pass.

**One test file was edited outside the plan's file lists, and it had to be.**
`queue-ground-lint.test.ts` anchored its `/fusion:next` call point on `^4\. \*\*The work queue's
ground\*\*`. The backlog render joined the briefing ahead of it, so the item became 5 and the gate
failed on an ordinary insertion — the opposite of what that anchor exists to catch. The anchor now
reads `^\d+\.` and still matches exactly one line, which `uniqueLine` asserts, so nothing is
loosened beyond the digit. The reason is written beside it.

## What the plan got wrong

**1. Step 10's `/fusion:next` instruction is destructive against the store's only entry.** See
walk 2. "Printing the `/fusion:direct <entry>` line the user can run" is unconditional in the plan
and must not be, because playmaker withholds that line for a multi-idea entry on purpose. Shipped
conditional. This is the fourth time this plan has met the same fact from a new side: step 6
refused to split the dump, step 7 refused to recommend it for shaping, step 8 refused to close it
on promotion, and step 10 now refuses to offer the command that would do all three at once.

**2. Step 9's file list is right, and its reach is one word wider than it looks.** Adding a second
parameter falsifies the first one's "first non-empty content line". Left alone, a dispatch
carrying both would have had an undefined contract for whichever came second. Corrected in the
same section rather than left for a reader to resolve.

**3. Step 10 asks for `$OUT_BACKLOG` in the memo prompt and says nothing about the other two
skills.** The user's dispatch asked for the inverse check and it was worth asking: neither
`/fusion:direct` nor `/fusion:next` needs a key, and both are now asserted to hold none. Had
either been given one "for symmetry", a skill that must not touch the store would have had a
resolved path to touch it with.

**4. The plan's `## Testing Strategy` end-to-end round trip still names an artifact nobody
writes**, as step 8's executor already recorded (mode 4 writes no spec). Step 10 does not change
that, and the round trip is otherwise now reachable: `/fusion:memo` files, `/fusion:next` renders,
`/fusion:direct` promotes — for a **one-idea** entry. Against the entry currently in the store the
third leg is deliberately unavailable, which is the design working, not a gap.

## Files changed

- `agents/planner.md`
- `skills/direct/SKILL.md`
- `skills/next/SKILL.md`
- `skills/memo/SKILL.md`
- `hooks/lib/__tests__/fusion-paths.test.ts`
- `hooks/lib/__tests__/queue-ground-lint.test.ts`
- `fusion-workbench/shared/planning/260812-1720_o_circle-first-placement-and-the-backlog-store.md` (steps 9 and 10 marked `[DONE]`)

Not committed — the orchestrator commits. Step 11 not started, by instruction; it ends at a human
gate the user is running separately.
