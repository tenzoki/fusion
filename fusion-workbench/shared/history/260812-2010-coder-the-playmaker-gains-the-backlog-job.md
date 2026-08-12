# Coder session — the playmaker gains the backlog job

**Date:** 2026-08-12 20:10
**Agent:** coder
**Status:** Complete
**Plan:** `shared/planning/260812-1720_*_circle-first-placement-and-the-backlog-store.md`, step 7
**Predecessors:** `shared/history/260812-1938-coder-backlog-store-and-resolver-target.md` (steps 1–3, `3c6ec4e`),
`shared/history/260812-1954-coder-backlog-keys-enumerations-and-the-move.md` (steps 4–6, `dec40bb`)
**Decision realised (not marked; step 13 owns the marker):**
`shared/decisions/260812-0254_*_does-fusion-need-a-backlog-store-and-a-maintainer-that-anticipates-circles.md`

## What was done

`agents/playmaker.md` gains the backlog store as a read target, a consolidation step between
its Steps 2 and 3, a `## Backlog — ranked` portfolio section, one write prohibition, backlog
counts in the history log, and a sentence on the taskplanner boundary. `rules/circle-records.md`
gains the section in the portfolio template — see *What the plan got wrong*, item 1.

**The read key, and the write key it does not get.** `$SCAN_BACKLOG` entered the prompt;
`$OUT_BACKLOG` deliberately did not. Key derivation greps the prompt, so the playmaker's
"never files an entry" bound is now mechanical rather than only stated: a run that tried to
write one has no resolved path to write it to. A test asserts the asymmetry
(`fusion-paths.test.ts`, "gives playmaker the read key and withholds the write key"), replacing
`playmaker` in the previous session's "emits neither to a shipped prompt that names neither"
list, which this step falsified.

**Step 2b, not a renumbering.** The new step sits between Steps 2 and 3 as `Step 2b`. Renumbering
3→4, 4→5, 5→6 would have touched six cross-references (`Domain Parameter`, two ranking
references, the `## Warnings` source list, the activation-proposal section), each an
opportunity for a stale one. The portfolio's *section* list did renumber, because it is a
self-contained list of six items and nothing outside it cites a section by number.

**The consolidation step is four readings, in order:** split what is not one idea, name
duplicates without merging them, separate what is a defect or a decision rather than an idea,
rank what remains. Each is a naming. The one thing that could have become a write — merging two
entries — is refused in the text of reading 2, and the closing paragraph refuses the two others
the design invites: a `_p_` rename, and an appended `## Activation proposal`-shaped block. An
entry is not a Circle record.

## The test of the design: a run against the real dump

`shared/backlog/260811-0826_*_observations.md` is the 12 KB dump step 6 moved in unsplit. I read
the instructions against it rather than assuming they work. Roughly eleven distinct ideas are in
there: setup latency; agent verbosity across nearly all agents; overall operation latency; rules
and goals decaying mid-session; ETA not computed; the monitor's localhost no longer answering;
absolute paths via a per-terminal project-root variable so an editor can open a cited file;
orchestrator instructions to sub-agents being imprecise; fusion spending its time on itself; the
churn spike on `domain-cascade`; and the closing question of radical simplification.

A run would produce a split proposal naming those with slugs, three duplicate groups (verbosity
plus the five worked examples, with example 5 the fullest; rules-decay plus the orchestrator
hypothesis plus the user's own `>>>` remedy, with the remedy the fullest; the two latency lines,
with the broader one the fullest), and two items pushed to `## Warnings` as defect-shaped — ETA
and localhost are things that are broken, not ideas.

**That dry run found the one real flaw, and it was mine, not the plan's.** The step as I first
wrote it ended `Recommended to shape: <entry path>` with `/fusion:direct <entry path>` under it.
Against this entry that is not a shrug — it is destructive. The promotion path takes an entry
whole, so running it would make one Circle of a dozen unrelated observations and retire the lot
in a single rename. The section now has two first-line forms, and a multi-idea entry gets
`Recommended to split first: <entry path> — <n> ideas, top one is <slug>` with **no**
`/fusion:direct` line. Ranked first once split: the rules-decay cluster, because it cites records
already on disk (the churn ranking and the five examples in the same entry) and because the user
already stated its remedy.

## The context cost, measured

| file | before | after | delta | paid by |
|---|---|---|---|---|
| `agents/playmaker.md` | 23 370 | 27 597 | **+4 227** (+18.1 %) | playmaker dispatches only |
| `rules/circle-records.md` | 10 894 | 11 203 | **+309** | orchestrator, playmaker, shaper |

Nothing entered the sixteen-agent corpus: `rules/fusion-workbench-conventions.md` is untouched,
and the emission golden moved on exactly one line, `circle-records.md 10894 → 11203`, with three
agent totals up by 309 each and no other file.

+4 227 is more than the "one paragraph in an existing agent" the decision record's recommendation
imagined, and the honest reason is that the recommendation had not met the input. Naming a
duplicate, refusing a merge, telling a defect from an idea and refusing to promote a dump whole
are four distinct refusals, and each one that is left implicit is one a run will get wrong. The
text was written, then cut once by 413 bytes (the two prohibition paragraphs folded, the portfolio
section compressed, the boundary note tightened) — that cut is in the number above. What remains
that could still have been a citation is small: the `_p_`-outranks-`_o_` tiebreak, about 130
bytes, kept because it is the only line that gives `_p_` a consequence for this agent.

## Verification

`cd hooks && npm test` — **exit 0**, 48 files, 1004 tests. Baseline at `dec40bb` was 1003; the one
added is the playmaker key-asymmetry test. Run four times in total, green at exit 0 on the last
three; the first run failed on exactly the two gates this change was expected to move (the
`playmaker`-names-neither assertion, and the emission golden), both then updated deliberately.
The `Worker exited unexpectedly` parallel-load flake
(`shared/decisions/260811-2009_*_is-the-hooks-suite-meant-to-be-run-concurrently-with-itself-and-if-not-who-serialises-it.md`)
did not appear.

The golden was regenerated with
`UPDATE_RULES_GOLDEN=1 npx vitest run lib/__tests__/rules-emission-golden.test.ts` and the diff
reviewed line by line before the full re-run.

Two live reads beyond the suite: `./bin/fusion-paths playmaker` now emits
`SCAN_BACKLOG=shared/backlog` and no `OUT_BACKLOG`, and the three gates that read this prompt
specifically — `portfolio-citation-form-lint` (no stamped literal marker), `path-literal-lint`
(no `backlog/` literal), `reference-resolution-lint` (every citation resolves) — pass.

## What the plan got wrong

**1. Step 7's file list is one file short.** It names `agents/playmaker.md` only. But the prompt's
Setup step 4 sends the agent to `rules/circle-records.md` for the portfolio template and says
"do not duplicate that content in your output; cite it as the canonical source" — and that
template enumerates five sections. Adding a sixth to the prompt alone would have shipped a prompt
contradicting the file it names as canonical, in the one place a run is told to trust the other.
The template now carries the `## Backlog — ranked` block (+309 bytes, three agents). Step 14
already touches `circle-records.md` for a different edit and could have carried this one; it does
not mention it.

**2. `_p_` has no writer.** The plan's state table reads `_p_` as "the playmaker has recommended
it for promotion and the user has not yet acted", and step 7 forbids the playmaker to rename an
entry's marker. Step 8 has the shaper rename `_o_` **or** `_p_` to `_c_`. So nothing in the design
writes `_p_` — only the user's own hand can. That may well be intended, but it is not stated
anywhere, and a reader of the table will conclude the playmaker writes it. The prompt now says
plainly that recommending moves nothing; whether `_p_` should have a writer is a question for the
user, not something to decide inside a prompt edit.

**3. The plan does not say what to recommend for a multi-idea entry**, which is the shape of the
only entry that exists. See the dry-run section above: taken literally, step 7's
`Recommended to shape:` line plus a `/fusion:direct` invocation is a destructive instruction
against the store's first and only occupant. Handled, not worked around.

One smaller note. Step 7 asks for the marker position to be wildcarded "in every entry path it
cites in the portfolio". The prompt's existing citation-form paragraph already says that for
every path; it gained one sentence extending it to backlog entries by name rather than a second
rule, since `portfolio-citation-form-lint` enforces the single form across the whole prompt and a
second statement would be a place for the two to drift apart.

## Files changed

- `agents/playmaker.md`
- `rules/circle-records.md`
- `hooks/lib/__tests__/fusion-paths.test.ts`
- `hooks/lib/__tests__/fixtures/rules-emission.golden`
- `fusion-workbench/shared/planning/260812-1720_o_circle-first-placement-and-the-backlog-store.md` (step 7 marked `[DONE]`)

Not committed — the orchestrator commits. Step 8 not started, by instruction.
