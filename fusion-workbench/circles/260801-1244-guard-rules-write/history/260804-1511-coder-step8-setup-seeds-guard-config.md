# Step 8 — `/fusion:setup` seeds `fusion-guard.json`

**Agent:** coder
**Circle:** `circles/260801-1244-guard-rules-write` — plan Step 8
**Date:** 260804, 15:02–15:15
**Status:** Complete
**Outcome:** One new step (`Step 0f`) in `skills/setup/SKILL.md`. The twice-run acceptance test passes with a real edit between the runs. `npx vitest run` green at **1344 passed, 25 files** — unchanged from Step 7's baseline, since nothing this step touched is executed by a test.

---

## The three answers the brief asked for first

**The twice-run test passes, with an edited file in between.** The block was extracted from the skill by `grep` rather than retyped, so the test runs what ships (and asserts the pattern occurs exactly once in the file). Run 1 against an empty scratch directory produced a copy byte-identical to `templates/fusion-guard.json`, sha256 `e5b66ef7…dc21c`, matching the hash Step 7 recorded. The file was then replaced with a hand-edited configuration declaring `guard.protectedPaths: ["only/this/**"]`. Run 2 exited 0, printed nothing, and left that file byte-identical: `diff -u` empty, sha256 unchanged at `b72844f8…29d7`.

**On a second Setup run in a project that already has the file, the guard denies the whole `Bash` call.** Not the `cp` declining quietly — a `block` verdict with the reason *"The segment `{ cp "$FUSION_PLUGIN_ROOT/templates/fusion-guard.json" ./fusion-guard.json` writes `fusion-guard.json`, which is under compliance guard protection … STOP and ask the user."* That is Step 6's self-protection floor working correctly: it keys on `existsSync`, so the file is unprotected exactly until it exists and protected from then on. The classifier is static and cannot see that the shell's `[ -f ]` would have skipped the copy. **This is why the shipped step is not the single command the plan describes** — see below.

**Nothing in the suite covers this.** Two lints read `skills/setup/SKILL.md` — `path-literal-lint.test.ts` (no type-folder store literals in prompts and skills; it also cross-checks the `$OUT_*`/`$SCAN_*` keys the file names) and `glob-nomatch-lint` / `marker-format-lint` over the same prompt surface. All of them check *form*, none executes the seeding block, and I did not invent a test for a shell snippet. The behaviour is verified by the twice-run script and by a direct guard measurement, both recorded below rather than committed.

---

## What was written

`skills/setup/SKILL.md`, new `## Step 0f — Ensure the guard configuration file is present locally`, placed between Step 0e and Step 1. Three elements:

1. Two sentences of prose: what reads the file (the guard hooks, on every guarded tool call, merged over the plugin's `hooks/config.json`), and that it belongs in version control because it decides what the guard protects. A third sentence states that it lands at the *project root*, beside `fusion-workbench/` rather than inside it, and points at the skill's existing "never prepend `cd`" rule as the thing that keeps it there.
2. A read-only presence probe printing `fusion-guard.json present` / `fusion-guard.json absent`.
3. The seeding block, run only in the `absent` branch, character-for-character in Step 0e's shape:

```bash
[ -f ./fusion-guard.json ] || { cp "$FUSION_PLUGIN_ROOT/templates/fusion-guard.json" ./fusion-guard.json && echo "fusion-guard.json template copied — inherits the plugin's guard defaults until you edit it"; }
```

followed by 0e's own closing sentence about `$FUSION_PLUGIN_ROOT` being unset or the copy failing: note it in the history file, do not block Setup.

## The deviation, and why it is not a rephrasing

The plan asked for a single guarded `cp`. What ships is a probe plus that same `cp`, and the difference is load-bearing.

`/fusion:setup` is not a once-per-project command. `agents/orchestrator.md:11-19` makes Setup the orchestrator's first action on **every** session, whatever the user asked for. So the one-command form would not have produced one awkward message at some point; it would have produced a guard denial at the top of every session, forever, in every project that has the file — each one a `guard_block` event on the dashboard's warnings panel and a `consecutiveBlocks` increment (`hooks/lib/escalation.ts:186`, reset only by a later allowed *write-tool* call at `hooks/guard.ts:896`). The deny reason itself instructs the agent to stop and ask the user, about a no-op.

The three candidate responses, and why the probe wins:

- **Ship it and explain the deny in prose.** Rejected: a sentence does not stop the deny, and an agent that meets a deny mid-Setup with a "STOP and ask the user" reason will do exactly that.
- **Reword the command so the classifier does not see the destination.** Rejected outright. That is the failure `rules/protected-path-discipline.md` `## What to do instead` exists to forbid, and the deny is *correct*: writing an existing `fusion-guard.json` through a tool call is precisely what Step 6 built the floor to prevent.
- **Do not issue the write when it would be denied.** Taken. The probe is read-only and always allowed, and the copy is issued only in the case where the guard permits it. Nothing is worked around; a command that should be denied is simply never sent.

Two things keep this from drifting away from the plan's intent. The `[ -f ]` guard stays inside the copy, so the block is self-idempotent when extracted and the plan's verification runs exactly as written. And the probe-then-branch structure is not invented here: `Step 0c` (the concurrent-session check) already has it, so a reader meets a shape the file has used since v2.8.0 rather than a new one. The step says in one sentence why it has two commands where 0b, 0d and 0e have one, so the next person to tidy the file does not delete the probe as redundant.

## Measurements

### The guard, on the seeding block

Run through `lib/__tests__/helpers/guard-harness.ts` (`withProject` + `runBash`, fresh subprocess per case, `tsx guard.ts`), four command shapes × two project states:

| Command | `fusion-guard.json` absent | present |
|---|---|---|
| The Step 0f seeding block | allow | **block** — names `fusion-guard.json` |
| `cp /tmp/src.json ./fusion-guard.json` | allow | **block** |
| `cp "$FUSION_PLUGIN_ROOT/…" ./fusion-guard.json` | allow | **block** |
| Step 0e's plane block (control) | allow | allow |

The control row matters: it shows the deny is about *this file* rather than about the compound shape all four seeding steps share. The unresolved `$FUSION_PLUGIN_ROOT` in the source operand does not trip the fail-closed rule, because only a `cp`'s written operand is a target — row 3 allows in the absent case, which is the check that proves it.

### The twice-run acceptance test

Extracted block, scratch directory, `FUSION_PLUGIN_ROOT` pointed at this repository:

| Step | Result |
|---|---|
| occurrences of the block in the skill | 1 |
| run 1, empty directory | file created, exit 0, echo printed |
| run 1 output vs `templates/fusion-guard.json` | `cmp` clean, sha256 `e5b66ef7…dc21c` |
| edit between runs | replaced with a project configuration declaring `protectedPaths: ["only/this/**"]`, sha256 `b72844f8…29d7` |
| run 2 | exit 0, no output |
| run 2 vs the edited file | `diff -u` empty, sha256 unchanged |

Editing the file between the runs is what makes this test worth running: against an untouched copy, a block that re-copied the template every time would still pass.

### Suite

`npx vitest run` in `hooks/`: **1344 passed, 25 files**, exit 0. Identical to Step 7's figure, as expected — one markdown file changed and no test executes it. `npm test` was deliberately not run: it builds first and would rewrite the `hooks/dist/` that plan Step 10 owns.

## Scope and consequences for later steps

`skills/setup/SKILL.md` and the plan's own Step 8 entry (marked `[DONE]` with a `[SHAPE CHANGED]` bullet recording the deviation, since the step text alone would now mislead). `templates/fusion-guard.json`, the root copy, `hooks/lib/config.ts` and `install.sh` untouched. `install.sh:80` was re-read rather than taken on trust: `templates` is in the explicit copy list, so `$FUSION_PLUGIN_ROOT/templates/fusion-guard.json` exists under an HTTPS install.

Two notes for Step 9, neither filed as an issue because Step 9 already owns the surface:

- Its `README-hooks.md` item ("the user-facing description of `fusion-guard.json`") should say that `/fusion:setup` seeds the file, and that once seeded the guard protects it — a user who tries to `mv` or `rm` it through an agent meets a deny that is easier to accept when it was announced.
- `agents/orchestrator.md` inlines Setup for self-initiated runs but carries only Step 0b of the seeding steps, not 0d, 0e or now 0f. The asymmetry predates this step and is not made worse by it, so nothing was changed there; it is recorded in case a later reader expects the two Setups to match.

No commit made — the orchestrator commits after validation. No issue filed, no decision marker moved.
