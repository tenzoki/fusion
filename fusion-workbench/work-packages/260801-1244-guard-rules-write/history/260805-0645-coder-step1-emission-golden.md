# Session: Step 1 — the emission golden as a test

**Date:** 2026-08-05
**Agent:** coder
**Status:** Complete
**Circle:** `260801-1244-guard-rules-write`
**Plan:** `260804-2356_*_plan-ausstieg-kontextsteuer-und-auslieferung.md`, Step 1
**Baseline:** `c9bf59e` plus the uncommitted `hooks/dist` rebuild already in the working tree. Not committed — the orchestrator commits after validation.

**Voice profiles:** `bin/fusion-rules coder` emitted no `stilwerk/` path, although
`fusion-workbench/stilwerk/` holds all four files. Absence noted per `rules/agent-setup.md`.
`CLAUDE.md` carries no `**Language:**` line, so the documented default is `en`; the dispatch
asked for a German report, so I read `chat-voice-de.yaml` directly and applied it to the chat
report. The same emission gap is recorded in
`260804-2100-coder-step5-guard-error-on-the-dashboard.md`; it is a standing observation
about the helper, not a finding of this session.

---

## The three sentences

The measured total is **145 144 bytes for ten of the sixteen agents and 150 817 for the other
six**, so the plan's "145 144, alle 16 Agenten" is wrong for the six design-diagram agents
(analyst, conceptrev, investigator, planner, shaper, taskplanner), which additionally load
`rules/design-diagrams.md` at 5 673 bytes. The test goes red when an `emit_if_exists` line is
removed, and it stays red for an *added* always-on file even after the golden has been
regenerated, because the ceiling is a literal in the test source that regeneration cannot touch.
Updating the golden is one deliberate command, `UPDATE_RULES_GOLDEN=1 npx vitest run
lib/__tests__/rules-emission-golden.test.ts`, which rewrites the fixture and then fails on
purpose so the flag can never be left on in a green run.

---

## Files

| File | State |
|---|---|
| `hooks/lib/__tests__/rules-emission-golden.test.ts` | new, 6 tests |
| `hooks/lib/__tests__/fixtures/rules-emission.golden` | new, 16 blocks |

Nothing else changed. `bin/fusion-rules` and `.claude-plugin/plugin.json` were mutated
temporarily for the falsification runs below and restored; both verified byte-identical
afterwards by `shasum` and by an empty `git status --porcelain`.

## The measurement, per agent

Measured with `FUSION_PLUGIN_ROOT` forced to this repository and the working directory set to an
empty temp directory, so no project-side rules, no manifest and no voice profile can enter the
count.

| Agent | Files | Bytes |
|---|---|---|
| analyst | 8 | 150 817 |
| bugfixer | 7 | 145 144 |
| coder | 7 | 145 144 |
| coderev | 7 | 145 144 |
| conceptrev | 8 | 150 817 |
| consultant | 7 | 145 144 |
| editor | 7 | 145 144 |
| investigator | 8 | 150 817 |
| ontocoder | 7 | 145 144 |
| ontorev | 7 | 145 144 |
| orchestrator | 7 | 145 144 |
| planner | 8 | 150 817 |
| playmaker | 7 | 145 144 |
| reconciler | 7 | 145 144 |
| shaper | 8 | 150 817 |
| taskplanner | 8 | 150 817 |

The seven always-on files (`emit_if_exists`, `bin/fusion-rules:269-275`) sum to exactly 145 144,
which reproduces the plan's headline number. The six agents above it carry
`rules/design-diagrams.md` (5 673) from the `IS_DIAGRAM_AGENT` branch at `bin/fusion-rules:295`.

The pattern tables (`coding`, `ontology`, `normative`, `verb`, `investigator`) contribute
**nothing** on the plugin side: no file in `rules/` matches any of those patterns, so
`coder`, `coderev`, `bugfixer`, `ontocoder`, `ontorev` and `investigator` land on the bare
145 144. Every one of those patterns is satisfied only by files a consuming project supplies.

## Design of the test

Six tests, two of which carry the weight.

**The golden** pins, per agent, the ordered list of emitted paths with each file's byte size and
the agent's total. It fails on any change in either direction, including a cut that removes more
than it meant to. It is meant to be regenerated when a cut is deliberate.

**The ceiling** is `CEILING = 150_817`, a literal in the test source, and it exists precisely
because the golden is regenerable. An always-on rule file added tomorrow appears in no golden
line, and a regenerated golden would absorb it without complaint. The ceiling does not absorb it.
Two assertions hold it in place:

- `keeps every agent under the ceiling` — the growth net.
- `keeps the ceiling pinned to the golden's high-water mark` — `CEILING` must equal the highest
  per-agent total, so a regenerated golden that moved the high-water mark leaves the suite red
  until someone edits `CEILING` by hand, in the same commit. That hand edit is the visible moment
  where the question "am I raising the tax for all 16 agents?" gets asked.

### Why the release cap is version-gated

The plan asks for a second assert at 105 354. Asserted literally against HEAD it is red for all
sixteen agents today, and shipping a permanently red test would leave the suite red for steps 2
through 5 and hide every other failure behind it.

The cap therefore asserts what the plan actually wants it to do — *block step 6*. The test reads
`.claude-plugin/plugin.json`; while the version is `5.8.0` (pre-cut) the cap is not yet due and
the ceiling is what holds the line. The moment the version moves past `5.8.0` without the cut
having happened, the cap turns hard red and names every agent that is over. Verified by
temporarily setting the version to `5.9.0`: the test failed and listed all sixteen.

This is a deviation from the plan's literal wording, taken so that the number stays live and
falsifiable instead of decorative. `RELEASE_CAP = 105_354` is unchanged in value and marked
"never raise".

### How the golden is updated

```
cd hooks && UPDATE_RULES_GOLDEN=1 npx vitest run lib/__tests__/rules-emission-golden.test.ts
```

The run rewrites the fixture from live measurement and then fails on purpose, with a message
naming the three follow-up steps: read the fixture diff, lower `CEILING` if the high-water mark
moved, re-run without the flag. The deliberate failure is what keeps the flag from being left on
in a green run. The command is documented in the test's header comment and again in the golden's
own header, so a developer meeting a red golden finds the instruction in whichever file they
opened first.

### Environment independence

`FUSION_PLUGIN_ROOT` is overridden per call to this repository. A developer almost always has it
pointing at the installed copy — mine was `/Users/k1/.fusion` — which carries the older
`origin/main` rule set. A test that inherited it would have measured the install and reported
whatever was last installed.

The working directory is a fresh `mkdtemp`. Project-side rules and voice profiles are excluded by
construction rather than by a filter, and `emits nothing but plugin rule files when no project
rules are in reach` asserts the exclusion held instead of assuming it. Running from the repository
root would have been wrong twice over: `./rules` there *is* the plugin's own rules directory, so
every pattern-matched file would be counted a second time under a different path string.

The subprocess pattern follows `hooks/lib/__tests__/fusion-paths.test.ts`, which is the closer
precedent than `monitor-warnings-panel.test.ts` — both drive a `bin/` bash script through
`execFileSync` and read stdout, with no HTTP seam involved.

## Falsification

Three runs, all against the real script.

**1. A removed `emit_if_exists` line.** Deleted
`emit_if_exists "$PLUGIN_RULES_DIR/decision-record-examples.md"` from `bin/fusion-rules`. Two
independent tests failed: the golden mismatch (named `analyst` first, all sixteen blocks
differing) and the ceiling pin (`CEILING (150817) no longer equals the highest per-agent total
(146626)`). Restored, `shasum` verified.

**2. An added always-on file, with the golden regenerated to absorb it.** This is the harder half
of the plan's second falsification. Added a duplicate `emit_if_exists` for `design-diagrams.md` to
the always-on block, so all sixteen agents carried it, then regenerated the golden so the growth
was fully recorded. The clean run was still red: `Rule text grew past the ceiling of 150817 bytes`
listing six agents at 156 490, plus the ceiling-pin failure. The golden alone cannot make the
suite green again; the ceiling has to be raised by hand. Restored.

**3. A version bump without the cut.** Set `.claude-plugin/plugin.json` version to `5.9.0`. The
cap test failed with all sixteen agents listed and the message naming plan steps 2 and 4 as the
prerequisite. Restored.

Full suite after restoration: **1543 tests in 27 files, all passing** (`npx vitest run` from
`hooks/`), up from 1537 in 26. `npm test` was not run, per the dispatch: it invokes `tsc` and
rebuilds `hooks/dist`, which step 5 owns.

## Findings for the orchestrator

Three, all reported rather than acted on. Step 1 was scoped to the two new files.

**F1 — the plan's baseline is wrong for six agents.** "Ausgangswert 145 144 Byte, alle 16 Agenten"
holds for ten. The six design-diagram agents start at 150 817. This propagates into the plan's
derived expectations: after step 2 they land at 110 273 rather than 104 600, which is *above* the
105 354 release cap, and only step 4 brings them back down to 101 789. Step 4 was already
described as non-optional; this makes it load-bearing for the cap rather than merely for margin.

**F2 — steps 2 and 4 together do not bring `coder`, `coderev` and `bugfixer` under the cap.** The
plan says two contradictory things about them. Step 2's Wirkung says "jeder der 16 Agenten lädt
40 544 Byte weniger", and the same paragraph says those three "erhalten inhaltlich unverändert
alles, verteilt auf zwei Dateien". Both cannot hold. If they keep the full 50 559 bytes of
protected-path text across two files, their total after steps 2 and 4 is 145 144 − 8 484 =
**136 660**, which is 31 306 over the release cap, and step 6 stays blocked. The cap as written
("kein Agent über 105 354") is not reachable while any agent keeps that file whole. Either the cap
means "no agent other than the three coding agents", or the reference half has to shrink rather
than move. This is a decision for the plan, not for the executor.

**F3 — the plugin's own pattern tables emit nothing.** `coding`, `ontology`, `normative`, `verb`
and `investigator` match no file in the plugin's `rules/`. Step 2's second option ("`coder`,
`coderev` and `bugfixer` bekommen ein zweites Muster neben `coding`") therefore has no plugin-side
precedent to follow, and the first option (name the file so it hits the existing `coding` pattern)
would make `protected-path-internals-coding.md` the first plugin file ever to match a pattern
rather than an `emit_if_exists` line. Neither is wrong; the executor of step 2 should know that
`emit_pattern_in_dir "$PLUGIN_RULES_DIR"` is currently dead code on every path.

## What step 2 inherits

The golden's block for each of the three coding agents is where step 2's split shows up. A correct
split leaves their totals unchanged (the same bytes across two files, plus a header and a pointer
line) and drops the other thirteen by 40 544. That shape is readable directly in the fixture diff:
one file line becoming two for three agents, one file line disappearing for thirteen.
