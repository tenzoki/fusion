# Closure review — bounded executor dispatches

**Filed by:** coderev, Kai Stalmann <kai@qantr.com>
**Reviewed-range:** `637d0b04..20796615`
**Not-opened:** `skills/setup/SKILL.md`, `README-agents.md`, `README-hooks.md`, `CLAUDE.md`, `fusion.json`, `templates/fusion.json`, `rules/commit-lock.md`, `hooks/lib/__tests__/fusion-events.test.ts`, `hooks/lib/__tests__/reference-resolution-lint.test.ts`, `hooks/lib/__tests__/rules-emission-golden.test.ts`, `hooks/lib/__tests__/fixtures/rules-emission.golden`, `hooks/lib/__tests__/fixtures/surface-growth.golden`, `hooks/dist/events-query.js`, `hooks/dist/events-query.d.ts`, `hooks/dist/lib/events-query.js`, `hooks/dist/lib/events-query.d.ts`, `hooks/dist/lib/config.js`, `hooks/dist/turn-budget.js`, `fusion-workbench/orchestrator-events.jsonl`, `260907-1657-c5-cost-argument-check.md`, `260907-2012-break-even-arithmetic-for-the-dispatch-split.md`, `260907-0820_*_spec-bounded-executor-dispatches.md`, `260907-1450_*_plan-bounded-executor-dispatches.md`, and every `fusion-workbench/circles/260906-2258-bounded-executor-dispatches/history/*.md` entry in the range

**Bounded return:** this review reached its stopping time after one topic. See `## Where this pass stopped`.

## Summary

Two topics were opened. The dispatch reading in `hooks/lib/events-query.ts` and its wrapper
in `hooks/events-query.ts`: the four-value outcome field, the three-way partition and the
`unattributable`-before-comparison ordering are correct and carefully argued; the module's
refusal to say `violation` is the right call and its stated reasoning holds against the
inputs. Two defects were found there, both in the one figure the partition does **not**
cover, `unstamped` — neither a correctness bug in a scored figure, both causing the reading
to report a number the reader will misread. Then the return contract itself, where the
serious finding of this pass is: the bounded return's mandated shape and two passages that
read a verification result off it cannot both hold, and the conflict sits on a routing
decision the orchestrator makes at Step 3a.

## Totals

Critical 0 / High 1 / Medium 4 / Low 0.

## Findings

### H1 — the bounded return's "four statements and nothing else" leaves the verification result two other passages read off it nowhere to be written

`rules/bounded-dispatch.md:70-78` mandates four statements "and nothing else", none of them
a verification result. `agents/orchestrator.md:488` tells the orchestrator that on a
bounded return "`exit 0` and 'stopped at the bound' can both be true of one return", and
`rules/bounded-dispatch.md:133-135` routes "a failed verification" carried by a bounded
return into the continuation — both reading a field the same rule forbids the agent to
write, the second of them eight lines of prose from the prohibition.

It is not a wording nuance. `agents/coder.md:79-81` and `agents/ontocoder.md:92-97` mandate
a `Verification:` line whose "field is never left out", pinned across both prompts by
`executor-verification-report-lint.test.ts`. A bounded `coder` return satisfying one
contract breaks the other, and which way an agent resolves it changes what the Step 3a
guard sees: read as "no verification reported", a partial return that passed its checks is
indistinguishable from one that ran none.

Reached in ordinary operation rather than at an edge: the unit table's `coder` row names
`agents/coder.md` step 3 (`Implement`) as the unit, while steps 4 to 6 — Verify, Log,
Report — are not per-file, so a unit boundary between two files always falls before any
verification has run.

Filed as
`260908-2115_*_the-bounded-returns-four-statements-and-nothing-else-leaves-the-verification-result-two-other-passages-read-off-it-nowhere-to-be-written.md`,
with three fix options and the note that only one of them avoids adding prose to
`agents/orchestrator.md`.

**Scope:** `rules/bounded-dispatch.md`, `agents/orchestrator.md`, and by consequence the
report contract in `agents/coder.md`, `agents/ontocoder.md` and `agents/bugfixer.md`.

### M1 — `unstamped` is counted over the whole log while every other figure is filtered

`hooks/lib/events-query.ts:675-681`. The increment sits **above** both filters:

```
    const startMs = parseTs(line.ts);
    if (startMs === null || cutoffMs === null) {
      unstamped++;
      continue;
    }
    if (startMs < cutoffMs) continue;
    if (line.agent === undefined || !agents.has(line.agent)) continue;
```

So a `task_start` with an unreadable `ts` is counted whatever its agent and whatever its
date. A `planner` dispatch from March with a truncated stamp raises `unstamped`, though
`planner` is not in `BOUND_AGENTS` and March is before every reachable cutoff — that
dispatch could never have appeared in the reading under any outcome.

The module states the opposite principle for itself, in its own doc block at
`hooks/lib/events-query.ts:617-621`: steps 2 and 3 apply to an unpaired start as well,
"without that the `unpaired` figure would run over the whole file and over every agent,
which is the exact widening the cutoff exists to prevent, and it would not be comparable
with `counted` beside it." Every word of that applies to `unstamped` and is not applied to
it.

Sharper evidence that this is an oversight rather than a choice: the **second** increment
of the same counter, at `hooks/lib/events-query.ts:697`, is below both filters. One
counter, two populations. The printed number is the sum of a whole-log count and a
filtered count, so it follows no single stated rule and is not derivable from the header's
description of it.

Consequence at the wrapper: `hooks/events-query.ts:524-528` prints the figure with "They
are in no figure below", which invites the reader to add it to `counted` +
`unattributable` + `unpaired` to recover the dispatches in scope. That sum is wrong by
however many out-of-scope malformed starts the log holds.

**Fix direction:** move the `unstamped++`/`continue` below the cutoff and agent filters —
i.e. read `line.agent` and the cutoff first, then parse. That requires the cutoff
comparison to survive an unparseable start stamp; the natural order is agent filter,
then parse, then cutoff, then unstamped on a null parse. Confirm against C4's criterion
that names `unstamped` before changing it.

**Scope:** `bin/fusion-events dispatches` only. No other subcommand and no gate.

### M2 — an unparseable cutoff is reported to the user as unstamped dispatches

Same line, `hooks/lib/events-query.ts:676`: `if (startMs === null || cutoffMs === null)`.

When `cutoffMs` is null the condition is true for **every** `task_start` in the log, so
`unstamped` becomes the total number of dispatch starts and the reading returns no rows.
The doc block at `hooks/lib/events-query.ts:625-627` anticipates the empty reading and
calls it correct — "a cutoff that cannot be parsed keeps nothing … closed towards the
empty reading rather than the whole history" — and that judgement is right. What it does
not anticipate is the sentence the wrapper then prints, `hooks/events-query.ts:525-528`:

```
`${r.unstamped} dispatch(es) carry no readable ts on one of their two rows and could `
  + "neither be placed against the cutoff nor measured. They are in no figure below."
```

In that branch the claim is false of every dispatch counted. The stamps are fine; the
cutoff is not. A reader gets "412 dispatches carry no readable ts", concludes the event
log is corrupt, and never learns their `--since` value was rejected downstream of the
regex that let it through.

**Reachability, stated honestly:** the CLI guard at `hooks/events-query.ts:617-620`
rejects anything not matching `^\d{4}-\d{2}-\d{2}$`, and `BOUND_LANDED` is a valid
constant, so this needs a regex-shaped but impossible date — `--since 2026-13-45`,
`--since 2026-02-31`. I did not execute the helper to confirm `Date.parse` returns NaN for
those; the claim rests on reading `parseTs` at `hooks/lib/events-query.ts:162-167`, which
appends `Z` and returns null on NaN. Low reachability, but the failure mode is a confident
false statement about the project's data, which is the one output class this module's
header says it must not produce.

**Fix direction:** separate the two causes. Test `cutoffMs === null` once, before the loop,
and return a report that says the cutoff could not be parsed — either as its own field or
via a distinct stderr sentence — leaving `unstamped` to mean only what its name and its
doc comment say.

**Scope:** `bin/fusion-events dispatches` only.

### M3 — the older-install fallback continues a bounded return with no stall guard

`agents/orchestrator.md:466` names the stall guard as something
`rules/bounded-dispatch.md` holds, then gives the absent-file fallback: "continue at the
same site in a fresh dispatch and say so." No cap. `rules/bounded-dispatch.md:111` states
that "nothing caps the count in advance" and that the stall guard is the only bound, so the
degraded path drops the sole stopping condition. An agent that stops at its bound having
completed nothing — the overshoot case the rule itself describes at
`rules/bounded-dispatch.md:45-48` — is re-dispatched with nothing written to stop it.

Not a hypothetical branch: the rule file is new in this range and `$FUSION_PLUGIN_ROOT` is
the installed copy pinned for the session, so **every consumer is in this branch until
`fusion --update` and a restart**. It is the installed base's default state at release.

Filed as
`260908-2118_*_the-older-install-fallback-continues-a-bounded-return-with-no-stall-guard-and-that-is-every-consumers-state-until-they-update.md`,
with the byte cost of the fix stated against the 698 bytes of `agents/` head-room and a
cheaper alternative offered.

**Scope:** `agents/orchestrator.md` only.

### M4 — the unit-row gate is satisfied by the rule's intro sentence

`hooks/lib/__tests__/bound-agent-set.test.ts`, third case, titled "every bound agent has a
unit row in rules/bounded-dispatch.md", asserts
`!new RegExp(\`\\\`${a}\\\`\`).test(rule)` — the agent's name in backticks **anywhere in the
file**. All seven appear in the rule's opening paragraph at
`rules/bounded-dispatch.md:8-9`, so the case passes on that sentence alone and **deleting
the entire seven-row unit table would leave the gate green**. Its own failure message
declares that state impossible.

It matters because the unit table is the only thing telling a bound agent where its
boundary falls, and it is the exact defect the sibling file in the same range guards
against by name: `dispatch-bound-lint.test.ts:196-199` states that "a pattern whose only
evidence is an empty result is indistinguishable from a broken one" and adds a
measured-detector block for it. One doctrine, applied on one file and not the other, in one
range.

Filed as
`260908-2122_*_the-unit-row-gate-is-satisfied-by-the-rules-intro-sentence-so-deleting-the-whole-unit-table-would-not-fail-it.md`
with a row-anchored regex and a matching anti-vacuity case.

**Scope:** `hooks/lib/__tests__/bound-agent-set.test.ts` only.

## What was checked and found sound

Recorded so the next pass does not redo it.

- The four-value `DispatchOutcome` is disjoint and total over the rows that reach
  `rows.push` (`hooks/lib/events-query.ts:684-712`), and `counted` is exactly `within` plus
  `longer`, so `counted + unattributable + unpaired === rows.length`. The header's tiling
  claim in `bin/fusion-events` holds for the rows.
- `unattributable` is decided **before** the threshold comparison
  (`hooks/lib/events-query.ts:703-708`), which is what keeps a dispatch the reading cannot
  place out of `longer_than_threshold`. The comment says so and the code does it.
- The refusal to name a `violation` is argued from the fields a row actually carries and is
  correct: `agent`, `session_id` and the rest do not separate a skill body's dispatch from
  the orchestrator's, so the undecidability is real and the three `limit=` lines state it.
- `unstamped` on the end stamp (`hooks/lib/events-query.ts:695-699`) correctly drops the
  pair rather than scoring it, and the `minutes: null` / `-` rendering on an unpaired row
  (`renderDispatch`, `hooks/lib/events-query.ts:740-744`) avoids the zero that would read
  as an instant dispatch.
- Not identity-scoped, deliberately, and `isOurs` is called nowhere in the new function —
  verified by reading, not asserted.
- `parseTs` handles the log's unzoned-UTC emit convention by appending `Z`
  (`hooks/lib/events-query.ts:162-167`), so the cutoff synthesised as
  `${cutoffIso}T00:00:00` is UTC and not local.
- `bin/fusion-rules`'s `IS_BOUND_AGENT` case arm and the emission block at `1g` name the
  same seven agents as `BOUND_AGENTS`, in the same order, and the block's comment correctly
  states the orchestrator's exclusion and why.
- **The ISO-8601 string comparison is sound, and both shapes were checked rather than
  assumed.** `agents/orchestrator.md:463` computes the stopping time as
  `new Date(...).toISOString().slice(0,16)+"Z"`, which is minute-shaped UTC
  (`YYYY-MM-DDTHH:MMZ`); `rules/bounded-dispatch.md:29-31` has the agent read
  `date -u +%Y-%m-%dT%H:%MZ`, the identical shape. Both sides are UTC, both are
  fixed-width, so lexicographic comparison is chronological. This dispatch's own
  `**Stop by:**` value confirms the shape in practice. One residual, too small to file:
  `slice(0,16)` truncates rather than rounds the seconds, so a bound is up to 59 seconds
  shorter than the configured value.
- **All seven anchors in the unit table resolve** — `agents/coder.md:62`,
  `agents/ontocoder.md:74`, `agents/bugfixer.md:65` and `:89`, `agents/reconciler.md:117`,
  `agents/curator.md:206`, `rules/review-contract.md:57`. The `ontocoder` row's wider unit
  is correctly justified: `agents/ontocoder.md` step 6 does require the edit and its ripple
  updates in one coherent pass, as the rule claims.
- `dispatch-bound-lint.test.ts`'s `BOUND_CONTEXT` is the four literal strings, and the
  orchestrator's bound sites clear it: line 463 carries `<dispatch-minutes>` with no digit,
  and line 460's date-portability example uses `N` rather than a numeral. The test's own
  header states its narrowness honestly, including that the prompt's heading "The dispatch
  bound." is not one of the four context words — a measured limit, correctly disclosed, and
  not a finding.

## Where this pass stopped

**Completed:** two units. All four of the dispatch's named hardest looks are answered —
three of them clean, one yielding H1.

- The dispatch reading: `hooks/lib/events-query.ts` and `hooks/events-query.ts` read in
  full over the range, plus the `bin/fusion-rules` and `bin/fusion-events` diffs.
- The ISO-8601 string comparison: settled, sound, evidence above.
- The unit table's seven rows against their cited anchors: all resolve.
- The Step 3a guard against the lint's four literal strings: no literal reaches the prose;
  the lint's disclosed narrowness is honest.

`agents/orchestrator.md`'s full diff over the range was read, which was the previous
version of this section's stated next step. All five continuation sites are present and
each matches its row in `rules/bounded-dispatch.md`'s table: Step 3a item 5's
bounded-return-first bullet, Step 3b step 2b's no-step-2d note, Phase 3 step 1, Phase 4
step 2a, and the curator paragraph in the dispatch table. Step 3b step 2e's
attempt-versus-retry clarification and step 7's `agentstate.yaml` exemption are both
correct against the rule. The error-handling table row was updated to match. M3 came out
of that read.

A third unit then read `bound-agent-set.test.ts` and the rest of
`dispatch-bound-lint.test.ts` in full, which was the previous next step. M4 came out of it.
Both files are otherwise strong, and the note under M4 records what in them is sound so a
fix does not disturb it.

**Unfinished:** the eight files declared not-opened by
`260908-0852-coderev-message-between-checkouts-closure-pass.md`, which arrived with this
dispatch as carried scope. None was reached. Also unreached: `fusion-events.test.ts`, so
the dispatch reading's branch coverage was verified against the source and never against
the test that claims to cover it — the same class of gap M4 turned out to be; the two
golden fixtures; the compiled `hooks/dist/` output; the documentation surfaces
(`README-agents.md`, `README-hooks.md`, `CLAUDE.md`, `skills/setup/SKILL.md`,
`fusion.json`, `templates/fusion.json`, `rules/commit-lock.md`); and every history file in
the range.

**Next step:** open `hooks/lib/__tests__/fusion-events.test.ts`. M4 establishes that a gate
in this range can read stronger than it asserts, and that is the one remaining gate over
the code where two of this pass's four findings live.
