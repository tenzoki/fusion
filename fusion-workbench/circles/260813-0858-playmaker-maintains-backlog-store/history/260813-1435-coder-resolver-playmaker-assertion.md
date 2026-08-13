# Coder — step 6: the resolver's playmaker assertion, inverted

**Status:** Complete
**Circle:** `circles/260813-0858-playmaker-maintains-backlog-store`
**Plan:** `planning/260813-1306_p_the-playmaker-maintains-the-backlog-store.md`, step 6
**Executor:** `fusion:coder`

## What changed

One file, `hooks/lib/__tests__/fusion-paths.test.ts`, three edits inside the `the backlog
keys` block. No case was added or removed: the file runs 86 tests before and after.

### The case itself

Before: `gives playmaker the read key and withholds the write key`, asserting
`SCAN_BACKLOG === "shared/backlog"` and `OUT_BACKLOG === undefined`.

After: `gives playmaker both keys, and says nothing about how the write is bounded`, asserting
`SCAN_BACKLOG === "shared/backlog"` and `OUT_BACKLOG === "shared/backlog"`.

The assertion is the easy half. The old case carried an argument in its comment — the missing
key made the write prohibition *mechanical rather than merely stated* — and that argument is
exactly what this Circle removes. Replacing it with silence would have left the file's most
load-bearing comment as a bare fact.

What the new comment says, in three parts:

1. **What it proves.** The playmaker is the first shipped consumer to hold both keys, and two
   of its four maintenance operations create files, which needs a resolved write target.
   Nothing in `bin/fusion-paths` moved to bring the key across: a consumer's key set is one
   grep over its own prompt, so naming `$OUT_BACKLOG` in `agents/playmaker.md` is the whole of
   the change. The case proves that derivation.
2. **What it does not prove.** That the playmaker reshapes ideas already in the store and
   originates none, and that its four operations run only under a confirmation the run holds.
   Those bounds are prose, in `rules/fusion-workbench-conventions.md` `## Backlog entries` and
   `agents/playmaker.md` `## Two mandates, by dispatch path`. No assertion here reaches them.
3. **The instruction to the next reader**, stated as a sentence rather than left to inference:
   read a green result as "the key is granted", never as "the write is bounded". The name
   carries the same warning, so a reader scanning the vitest output alone still sees it.

The comment mentions that a sibling lint checks the two mandates are *stated* on both surfaces.
It does not name that file: `hooks/lib/__tests__/playmaker-backlog-mandate-lint.test.ts` is
step 7's, landing in parallel with this step, and a citation I could not verify at the moment I
wrote it would have been a dangling one.

### The block's header comment

Not named in step 6's Files line, but inside its block and made false by step 2. It read "No
shipped prompt names OUT_BACKLOG — no agent files an entry — so the consumer for the write key
is a fixture prompt driven through a staged copy of the script." The first clause is now wrong
and the third is still right for a different reason, which is worth keeping: the staged-fixture
cases exercise the derivation path itself, independently of what any shipped prompt happens to
name today. The rewrite keeps that rationale, records that the old wording was once true, and
points at the shipped-prompt cases at the end of the block as the place each consumer's actual
key set is pinned.

### The `next` justification in *emits neither to a shipped prompt that names neither*

The assertion is untouched and stayed green. Its comment justified `next` by saying the skill
renders the ranking out of `portfolio.md` and touches nothing else, which stopped being the
whole story when step 4 gave it the confirmation relay. The comment now names the relay, says
what it carries (operation words and entry paths copied out of a report, never a path resolved
into the store), and states the change in the constraint's status: for `next`, holding no key
went from an observation to a live constraint, because the dispatch-prompt example in
`skills/next/SKILL.md` hands the skill a key the moment it spells either token. Verified in the
shipped file: `grep -c 'OUT_BACKLOG\|SCAN_BACKLOG' skills/next/SKILL.md` is 0, and the example
at `:168`–`:171` writes `<entry path>`.

## The withheld-key half: nothing to restore

The step's dispatch asked whether the negative half survives anywhere once the playmaker case
flips. It does, on three consumers, and step 6's own text settles the question by naming them:
"the shaper case and the memo case all still hold". Measured rather than assumed, by running
the resolver against the shipped prompts:

| Consumer | `SCAN_BACKLOG` | `OUT_BACKLOG` | Pinned by |
|---|---|---|---|
| `playmaker` | `shared/backlog` | `shared/backlog` | the rewritten case |
| `shaper` | `shared/backlog` | absent | *gives shaper the read key and withholds the write key* |
| `memo` | absent | `shared/backlog` | *gives memo the write key and withholds the read key* |
| `next`, `direct` | absent | absent | *emits neither to a shipped prompt that names neither* |

Both directions of the asymmetry are still asserted, on a consumer where each is still true,
and the both-absent case still covers the two user surfaces. I added no case. The suite's
coverage of "a key is withheld from a consumer that must not have it" is unchanged in strength;
what changed is that the playmaker is no longer one of the examples.

## Verification

`cd hooks && npx vitest run` — **exit 1**. 1 failed, 1013 passed (1014 tests across 48 files).

The single failure is `rules-emission-golden.test.ts`, red since steps 1 and 3 grew two rule
files: `fusion-workbench-conventions.md` 49 992 → 51 925 bytes, and the per-agent totals with
it. Step 8 regenerates that golden deliberately and reads the whole diff at once, so it was
left red here. No second failure: the `fusion-paths.test.ts` failure that step 5's log recorded
alongside it is the one this step removed.

The step's own acceptance ran clean on its own: `cd hooks && npx vitest run
lib/__tests__/fusion-paths.test.ts` — exit 0, 86 passed, the same count as before the edit.

Step 7's lint file had not landed in the working tree at the time of this run (48 files, 1014
tests), so its five cases are not in these numbers. The suite arithmetic in `## Testing
Strategy` predicts 1019 across 49 once it does; step 8 measures it.

## Not done here

No commit. The plan step is marked `[DONE]` in the planning file; the orchestrator commits.
