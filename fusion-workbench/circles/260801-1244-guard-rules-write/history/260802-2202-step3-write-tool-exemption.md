# Step 3 — C5a on the write-tool path

**Status:** Complete
**Agent:** coder
**Circle:** `circles/260801-1244-guard-rules-write`
**Plan:** `circles/260801-1244-guard-rules-write/planning/260802-1856_o_plan-guard-rules-write.md` `### Step 3`

## What was implemented

Two files, exactly the two the step names.

`hooks/guard.ts` — CHECK 2 now reads "blocked, with exactly one exemption". A matched
protected path that satisfies both `rulesWriteExemptionActive(process.env)` and
`isProjectRulePath(filePath)` skips the block, pushes one `clear`-level entry onto the
in-memory `escalation.recentEvents` (trigger `rules_write_exemption`, message from
`rulesWriteDetail`, carrying `toolName` and `filePath`), emits one `guard_advisory`
with the tool name, the path and the same detail string, and falls through to CHECK 3.
No `saveEscalation` at the exemption site. The block branch is unchanged in substance —
it moved inside `if (!exempted)` and nothing else about it changed.

The comment at the site pins the three properties the step names: CHECK 1 stays above
it, the note is persisted by whichever later branch saves (one save per call), and the
exemption waives this check and nothing else, so an exempted `Edit` produces
`guard_advisory` followed by `guard_allow`.

The module docstring's numbered list said protected paths are "unconditionally blocked".
That sentence became false with this change, so it was corrected rather than left to
drift — one line, naming the flag and pointing at `lib/rules-write-exemption.ts`.

`hooks/lib/__tests__/guard-rules-write-integration.test.ts` — a second `describe` with
seven cases. `lib/rules-write-exemption.ts` was read and not touched; it needed nothing.

## The advisory shape, and the citation that was wrong

The plan cites `hooks/guard.ts:159-177` for the advisory shape to mirror. Those lines are
prose inside the docstring of `guardBashCommand`. The plan itself flags this in its
`## Current State` table and gives the real location, `hooks/guard.ts:293-309`, which at
the edited file is the branch-switch override's note. That block was read and mirrored:
load, push a `clear` entry, emit `guard_advisory` with the same detail string. Two
deliberate differences from it, both stated in the plan: this note fills the `file`
argument to `emitEvent` and the `filePath` field of the escalation entry, because a
rules-write exemption always has a path and a branch override does not; and it does not
call `saveEscalation`, because unlike the Bash path — whose allow route writes nothing —
every route out of CHECK 2 on the write-tool path already saves exactly once.

## Two corrections carried in from the parallel work, both applied

**The plan's verification line is not reachable as written.** It says
`Edit ./rules/anything.md`. A relative `./rules/x.md` matches no protected pattern
(`normalizeToRelative` returns a relative path untouched, and `rules/**` compiles to
`^rules/.*$`, which `./rules/x.md` fails), so that case would be allowed with the flag
unset too and would pass for the wrong reason. Every case here passes an absolute
`resolve(root, "rules/x.md")`, which is both what Claude Code sends and what the guard
can relativize. The flag-unset control was run first and does block, so the flag-set
allow is a real change of verdict and not a restatement of the status quo.

**The two un-canonical spellings arrive uncollapsed on this path.** Step 2 canonicalises
inside `isProjectRulePath` for `rules/` (trailing separator matches `rules/**` while
`rules` does not) and `rules/../agents/coder.md` (matches `rules/**` textually, writes
`agents/coder.md`). The last case covers both. It uses `runGuard` with a raw relative
`file_path` on purpose: an absolute path goes through `resolve`, which collapses both
spellings before the guard ever sees them, so the relative route is the only way to
reach the predicate with them. The case carries a control — relative `rules/x.md` with
the flag set is allowed — so the two denials are attributable to canonicalisation and
not to relative paths being rejected wholesale.

## The halt case, asserted on state and not only on verdict

Against a project pre-seeded with `{ haltActive: true, consecutiveBlocks: 3 }` and the
flag set, the edit to `rules/x.md` is blocked with `[HALTED]`, the only event written is
`guard_halt`, `haltActive` is still `true`, `consecutiveBlocks` is still `3`, and no
`rules_write_exemption` entry was recorded. Setting the flag neither clears nor resets
the halt, and the exemption branch is not even reached — CHECK 1 returns above it.

## Falsification

The new cases were run against the unmodified guard (`git show HEAD:hooks/guard.ts`
swapped in, then restored): **3 failed, 8 passed.** The three that fail are exactly the
allow-side assertions — the exempted `Edit`, the exempted write under `rules/retired/`,
and the control inside the canonicalisation case — each failing with
`expected 'block' to be undefined`. The four deny-side cases pass at HEAD by design:
they assert behaviour this step must preserve, not behaviour it adds.

## Verification

- `cd hooks && npx vitest run lib/__tests__/guard-rules-write-integration.test.ts` —
  11 passed (4 harness cases from Step 1, 7 new).
- `cd hooks && npm test` — **851 passed, 19 files**, against a baseline of 844 measured
  on this working tree before the edit. `npm test` is `tsc && vitest run`, so the type
  check is included.
- `git status --porcelain` outside `fusion-workbench/` — exactly two paths,
  `hooks/guard.ts` and `hooks/lib/__tests__/guard-rules-write-integration.test.ts`.

`npm test` runs `tsc` first and therefore emits into `hooks/dist/` as a side effect:
`dist/guard.js`, `dist/guard.d.ts` and the two `dist/lib/rules-write-exemption.*` files
from Step 2's module. Those were restored to `HEAD` and removed after the run, because
`hooks/dist/**` belongs to Step 10, which rebuilds and commits it deliberately. They are
build output and `npm run build` regenerates them.

## Not done, and left for the steps that own it

The Bash surface is untouched: `MutationOptions.exempt` is still unwired and
`lib/bash-mutation-guard.ts` was not opened. `lib/config.ts` was not opened.
`bin/monitor` still omits `guard_advisory` from `WARNING_EVENT_TYPES`, so an exempted
write is in `events.jsonl` but not yet on the dashboard — Step 5.
