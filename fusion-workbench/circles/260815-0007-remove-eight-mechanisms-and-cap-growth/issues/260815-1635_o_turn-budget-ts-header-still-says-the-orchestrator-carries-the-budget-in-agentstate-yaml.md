`hooks/turn-budget.ts`'s header still says the orchestrator carries the budget in `agentstate.yaml`

---

P-11 removed `progress.max_turns` from `agentstate.yaml` and updated `CLAUDE.md`'s
`bin/fusion-turn-budget` row to say so. The module header of `hooks/turn-budget.ts` still states, in
the present tense, that the orchestrator carries the resolved budget in that file. The file was not
in step 11's list and was not touched.

---

## Context

`hooks/turn-budget.ts:14-18`:

> A prompt cannot merge three configuration layers, so the budget had to become something the prompt
> READS. This is that read: one call at Setup, one line of output, and the orchestrator carries the
> answer in `agentstate.yaml` where `progress.max_turns` already had a home and where it was already
> read as data rather than assumed.

At HEAD there is no `max_turns` field anywhere in the state file's format
(`agents/orchestrator.md:983-986`), and `agents/orchestrator.md:1018` lists it in the derivation
table as a field you now read from `bin/fusion-turn-budget` itself. `CLAUDE.md:38` was corrected in
the same commit:

> The orchestrator substitutes none — it writes no number anywhere in the budget's place (there is
> nowhere to write one: `agentstate.yaml` stopped carrying a `max_turns` field on 2026-08-15 with the
> rest of its counters)

So the two documents that describe the same mechanism now disagree, and the wrong one is the module's
own header — the place a reader lands first when they open the helper.

**Why no gate caught it.** The sentence carries no path-shaped token and no asserted enumeration, so
neither `reference-resolution-lint` nor `derivable-enumerations-lint` can see it. It is the second
class named in the plan's `**Decidability:**` head — bare names in prose — arriving in a `.ts` header
rather than in a `CLAUDE.md` inventory row.

## Suggested direction

Rewrite the clause to match `CLAUDE.md:38`: the prompt reads the value at Setup and holds it for the
session; there is no field. The historical half of the sentence — that `max_turns` was once a field
and was already read as data — is worth keeping, in the past tense, because it is the argument for
why the helper prints one line.

## The same sentence was corrected in its sibling, in this commit

`hooks/lib/__tests__/turn-budget-lint.test.ts` carried a near-verbatim copy of the clause and P-11
rewrote it:

```
-// session by `bin/fusion-turn-budget` at Setup; carried in `agentstate.yaml`
-// where `progress.max_turns` already had a home and where it was already read
-// as data.
+// session by `bin/fusion-turn-budget` at Setup, on a resume exactly as on a
+// fresh session, and held for that session only. It was also persisted, as
+// `progress.max_turns` in `agentstate.yaml`, until 2026-08-15 [...]
```

The same commit also inverted that lint's `carries the budget in agentstate.yaml` case into
`does NOT carry the budget in agentstate.yaml`. So the correction reached the test that gates the
prompt and did not reach the module the test is about — one phrase in two files, one copy fixed.
That is the two-copies-drift pattern this project files defects about, arriving inside a single
commit rather than across releases.
