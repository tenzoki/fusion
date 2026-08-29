# `clear-halt` distinguishes "no workbench" from "not halted", and every halt message carries the `cd`

**Agent:** coder
**Status:** Complete
**Date:** 260808-0139
**Record:** `260805-1134_*_clear-halt-meldet-erfolg-wenn-es-die-workbench-nicht-findet.md`
**Scope constraint:** only `hooks/clear-halt.ts`, its compiled output, and the files carrying the
halt message text (a parallel coder dispatch held `.gitignore` and `agents/orchestrator.md`)

---

## What was done

Directions 1 and 3 of the record, which it names together as the honest minimum answer. Direction 2
(an explicit path argument) deliberately untouched.

### Direction 1 — `hooks/clear-halt.ts` distinguishes and says so

The script called `loadEscalation()` first thing. With no workbench above the working directory that
returns the empty state, the empty state is not halted, and the script printed `Guard is not halted.
No action needed.` while the halt stood untouched in the project.

It now calls `findWorkbenchRoot()` (`hooks/lib/workbench-root.ts` — the existing locator, and the
same one `lib/escalation.ts` resolves the state path through, so the two can never disagree) *before*
loading any state. Null root: four stderr lines naming the directory that was searched from, saying
that nothing was checked, saying where a halt actually lives, and giving the command again with the
`cd` in front — then `process.exit(1)`, because a tool that found nothing has not succeeded.

Non-null root: the workbench path is printed first, on its own line, so the two remaining outcomes
are both answers about a named place. `Guard is not halted.` became `Guard is not halted in this
project.` for the same reason. The clearing path itself is unchanged.

No second locator was written.

### Direction 3 — the halt message carries the `cd`, at every site

`clearHaltCommand()` added to `hooks/lib/escalation.ts`. It returns
`cd <project-root> && node <plugin-root>/hooks/dist/clear-halt.js`, with the project root from
`findWorkbenchRoot()` and the plugin root from `CLAUDE_PLUGIN_ROOT`; each degrades to a visible
placeholder rather than being dropped, so the shape of the command survives a missing value.

It lives in `escalation.ts` rather than in a new module because both raising sites already import
that file, it is where the halt state itself lives, and two hooks that each build their own copy of
this sentence are two sentences that drift. Adding a function to an existing import was also the
smallest edit available inside the scope constraint.

Both raising sites now call it:

- `hooks/guard.ts` — the `[HALTED]` reason on the third consecutive block.
- `hooks/tracker.ts` — the `To resume afterwards` tail of the protected-path measurement halt.

Each carries a short comment saying the `cd` is not decoration.

## Every location of the halt message, and what it now says

Grepped for the wording rather than trusting the two hook sites, per the record.

| Location | Kind | Change |
|---|---|---|
| `hooks/guard.ts:~594` | live message | now `clearHaltCommand()`, plus the sentence saying the working directory decides |
| `hooks/tracker.ts:~355` | live message | same, in the measurement halt's tail |
| `hooks/lib/escalation.ts` | new authoring site | `clearHaltCommand()` |
| `hooks/clear-halt.ts:5` | header usage line | `cd <project-root> && node …` |
| `rules/protected-path-discipline.md:~51` | quoted in the rule all 16 agents load | quote updated, plus two sentences telling an agent to report the message `cd` and all |
| `README-hooks.md:195` | config table row | `cd` added, with the reason |
| `README-hooks.md:~209` | quoted halt block | quote updated |
| `README-hooks.md:~260` | `### Clearing a halt` | `cd` added; the measured incident and the new behaviour written out |
| `README.md:112` | config table row | `cd` added, with the reason |

`CLAUDE.md:126` names `clear-halt.js` in prose without spelling an invocation, so there was nothing
to fix and it is outside this dispatch's scope anyway. Occurrences under `fusion-workbench/` are the
issue record itself and closed historical records; left alone.

## Reproduction, both directions

Scratch project at `/tmp/fusion-clearhalt-*/proj` with a `.fusion-setup` marker and a seeded
`escalation.json` (`haltActive: true`, `consecutiveBlocks: 3`). This repository's own guard was never
halted. Compiled script, after `cd hooks && npm run build`.

**From `/tmp/no-workbench-*` (nothing above it):**

```
No fusion workbench found above /private/tmp/no-workbench-YwwxRg.
Nothing here could record a halt, so nothing was checked — this is not a report that the guard is clear.
A halt is project-scoped: it lives in <project-root>/fusion-workbench/.guard-state/escalation.json,
found by walking up from the working directory. Run this again from the project whose guard is halted:
  cd <project-root> && node /Users/k1/Projects/productive/fusion/hooks/dist/clear-halt.js
```

exit 1. The seeded halt was verified unchanged afterwards. Before the fix this run printed
`Guard is not halted. No action needed.` and exited 0.

**From inside the scratch project, halt active:**

```
Workbench: /private/tmp/fusion-clearhalt-3VeDQe/proj/fusion-workbench
Halt active. Consecutive blocks: 3
Recent events:
  [block] protected_path: write to agents/coder.md blocked
  [halt] consecutive_blocks: 3 consecutive tool calls blocked — halt activated

Halt cleared. Guard will resume normal operation.
```

exit 0; `escalation.json` went to `haltActive: false, consecutiveBlocks: 0`.

**Third run, same project, halt now cleared** — the surviving "not halted" path:

```
Workbench: /private/tmp/fusion-clearhalt-3VeDQe/proj/fusion-workbench
Guard is not halted in this project. No action needed.
```

exit 0.

## Build and suite

`npm run build` (`rm -rf dist && tsc`) produced the same 38 files as before, byte-diffed by name; no
external `require` or bare-specifier import in `dist` (only relative and `node:` builtins).

`npm test`: **1029 passed, 1 failed, of 1030** across 33 files.

The one failure is the expected one, and it is **not fixed here** per instruction.
`rules-emission-golden` — `rules/protected-path-discipline.md` grew 6583 → 6941 bytes (+358), so
every agent's total rises by 358 (e.g. `analyst` 92 642 → 93 000). The fixture was left alone; the
user sequences the regeneration. Nothing else in the suite moved, which also says no test asserted
the old halt wording.

## Not done, deliberately

- Direction 2 of the record (`clear-halt [projektpfad]`) — out of scope.
- The issue record is still `_o_`; no commit was made.

260808-0152
