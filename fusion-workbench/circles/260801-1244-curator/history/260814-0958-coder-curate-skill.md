# Coder session — the `/fusion:curate` skill and its three registrations

**Date:** 2026-08-14 09:58
**Agent:** coder
**Status:** Complete
**Circle:** 260801-1244-curator
**Plan:** `260814-0845_*_plan-curator.md`, step 3
**Verification:** `cd hooks && npm test` — exit 0, 49 files, 1024 tests; `bin/fusion-paths curate` — exit 0, zero bytes on stderr

---

## What landed

**`skills/curate/SKILL.md`.** A thin dispatch-and-gate surface, per the plan's answer to spec question 1: the procedure lives in `agents/curator.md`, and this body carries only the relay. `allowed-tools` is `[Bash, Read, AskUserQuestion, Agent(fusion:curator)]` — no `Write`, no `Edit`, because the skill writes nothing at all. Both writes in the operation are the agent's, and only the second dispatch reaches a normative surface.

Seven steps: resolve paths, dispatch survey, read what came back, the scale confirmation when the blast-radius stop fired, the gate, dispatch apply, report outcomes. The gate follows the plan's `## Data Structures` answer to question 5 literally — the prompt names the run file's path, the count per consequence group in most-consequential-first order, the candidate count as text saying they are not on offer, and the blast-radius verdict; it never contains the ledger, and one line below the options invites per-entry approval by id. Groups are the follow-up, `multiSelect`, one option per non-empty group. Two questions at most, the second strictly narrowing the first, which is the shape `/fusion:next` Step 5b already uses.

The apply dispatch passes the three parameters in the order `agents/curator.md` `## Dispatch parameters` declares them, and `**Approved:**` carries `all` or an explicit id list and nothing else. A group selection is resolved to the ids that group holds before it is passed; the skill never hands the agent a sentence to interpret.

## Two decisions worth stating, because neither was forced

**The skill names exactly one resolver key, `$OUT_HISTORY`, and uses it for one check.** `bin/fusion-paths` derives a consumer's key set by one grep over its own body, so every key named is a scope granted. The minimum that would work is no key at all — `/fusion:log-activity` gets `WORKBENCH` alone and reads the tree from there. `$OUT_HISTORY` earns its place on one guard: the ledger path this skill relays into an apply dispatch has to be a run file in the history store, and a reported path that does not start with that value halts the run instead of handing the apply pass a document nobody wrote. That is the whole use. The emitted set is `WORKBENCH`, `CIRCLE` and `OUT_HISTORY`, which is what the resolver prints.

**User-facing strings are described in English, not written in German.** `/fusion:next`, `/fusion:direct` and `/fusion:seed-from-plane` all embed German quotes, which reads as the convention until `rules/fusion-workbench-conventions.md` `## Project language` is opened: skill bodies under `skills/` are named there as an exempt surface, English in every project, because they ship to consuming projects of every language. The two rules only appear to conflict — the body is shipped text and is English, while what it renders is chat output and takes the consuming project's chat language. So each prompt is specified in English and the `## Tone` section says to render it in the language the `**Language:**` line resolves to. The existing German quotes in the three older skills are a live inconsistency with that rule; they are outside this step's file list and were left alone.

## The three registrations

- **`hooks/lib/__tests__/fusion-paths.test.ts`** — `"curate"` added to the `SKILLS` array, which drives the key-set agreement assertion and the "resolves every skill too, with no stderr" loop.
- **`CLAUDE.md`** — `/fusion:curate` appended to the user-invocable skill listing. That listing declares itself the authoritative set, and `derivable-enumerations-lint.test.ts` checks it against `skills/` in both directions.
- **`README-agents.md`** — one row in the skill table, whose parser requires the slash command and the file column to agree.

## The row the previous task left open, put right

`agents/curator.md` `## Tool Discipline` has named `/fusion:curate` since step 1. Step 2 could not name it back: the roster lint's phantom-skill check reads `README-agents.md`, and a `## Dispatch parameters` row naming a skill that did not exist failed it. Those three `Passed by` cells named only the roles that existed then. They now name the skill and the step of its body each parameter is passed at, which is the form every other cell in that column carries.

## Two falsified claims in a file on the list, corrected

Both were falsified by this change, and both sit in `README-agents.md`.

- The `## Dispatch parameters` preamble said every `Passed by` cell was read against "all sixteen `skills/*/SKILL.md` bodies". There are seventeen now. The figure was removed rather than refreshed — "every `skills/*/SKILL.md` body" — following the decision `260814-0845_*_are-the-sixteen-agent-claims-corrected-or-derived-away.md`, answered option 2, which step 2 applied to the agent-count claims of the same shape.
- `## Inheritance model` said "For the other 15:", against a fleet of seventeen agents of which one declares a `tools:` allowlist. Step 2 corrected the five claims a lint re-derives and this one is not among them, so it was still standing. Now "For the rest:", figure removed for the same reason.

## What was deliberately not done

- **`rules-emission-golden.test.ts` and `RULE_BASELINE` are untouched.** Arming the growth bound is step 5. The budget report firing for every role until then is the expected state, not a regression.
- **`/fusion:cleanup`'s staleness line is step 4** and no part of it was written here.
- **`README.md` was not touched.** Its skill mentions are an open set — the lint checks only that every name it uses resolves — and no plan step names the file.

## One finding left standing, named rather than fixed

`hooks/lib/__tests__/fusion-paths.test.ts`'s `SKILLS` array is hand-written and does not cover `cadence` or `seed-from-plane`. Nothing asserts that array against `skills/`, so the two skills are silently outside the key-set agreement assertion and the no-stderr loop. Adding `"curate"` does not change that, and closing it is not this step's scope: it is a coverage gap in a test file the plan names for one line, and the honest fix is either an assertion tying the array to the tree or a derivation like the enumeration lint's `skillDirs()`. Reported rather than done.
