# Coder — step 10 of the protected-path removal

**Date:** 2026-08-12 15:46
**Agent:** coder
**Status:** Complete
**Dispatched by:** orchestrator
**Plan:** `260812-1232_*_remove-the-protected-path-half-of-the-compliance-guard.md`, step 10

---

## What was asked

The acceptance run the release process requires before a guard change ships: exercise the shipped
hooks against a project root that is not this repository, because both halves of the write
protection stood down here by self-detection and everything measured during steps 1 to 9 was
measured in a tree where the mechanism was already inert. Six checks from the plan, four additions
from claims the earlier steps made, from the project root and from a subdirectory. No file in the
tree changes except this entry, the plan's step marker, and any record a real finding earns.

## Verification

`cd hooks && npm test` — **exit 0.** 48 files, 986 tests, 59.84 s. Identical to the baseline at
`fa2f00b`. `npm run build` was run first and exited 0, so `hooks/dist/` is the current source; every
measurement below was taken against `hooks/dist`, which is the artifact `hooks/hooks.json` executes,
not against `tsx` over the TypeScript.

## The setup, and why it is representative

Two scratch consuming projects under `/private/tmp/fusion-accept-260812/`, both left in place:

    proj/    the main subject: fusion-workbench/.fusion-setup, rules/, agents/, src/api/, src/web/,
             sub/deep/, notes.txt, and a fusion-guard.json rewritten per check
    proj2/   a second project, used only for the plugin-layer advisory
    plugin/  a copy of hooks/config.json + hooks/dist, with guard.protectedPaths added back —
             a stale install, for the same check

Three properties make the run representative rather than a re-run of the suite in another directory.
The roots carry no `.claude-plugin/plugin.json`, so `isFusionPluginCwd()` answers false and the guard
does not stand down; this was confirmed by the run itself, since a stood-down guard emits the
"Self-detect" allow and none appeared. `/private/tmp` rather than `/tmp` was used, and the root was
asserted equal to its own realpath, which is the macOS symlink trap the harness documents: an
unresolved root makes an absolute `file_path` unrelativisable and every path-matching check passes
vacuously. And each hook was spawned as a real subprocess with its cwd set explicitly, with
`FUSION_ALLOW_RULES_WRITE` and `CDPATH` stripped, feeding the PreToolUse and PostToolUse envelopes
that Claude Code sends.

One correction to my own method is worth recording, because it would have produced a false pass. The
first driver took a cwd argument and never applied it, so every "from a subdirectory" call ran from
the project root. It was caught by the result rather than by review: the event log recorded
`rules/x.md` from both directories, where `project-relative.ts` says a subdirectory must record the
absolute path. Every measurement below was retaken after the fix, and the two spellings are the
witness that the cwd now reaches the child.

## The plan's six checks

| # | Check | Root | Subdirectory | Observed |
|---|---|---|---|---|
| 1 | a write to `rules/x.md` is allowed and emits `guard_allow` | pass | pass | `{}` both times; one `guard_allow` row each |
| 2 | a `Bash` call emits nothing and does not reset the block counter | pass | pass | 6 calls, 0 event rows, `escalation.json` byte-identical; and with two denies standing, 3 Bash calls left `consecutiveBlocks` at 2 |
| 3 | churn events still land | pass | pass | `churn.json` written, 4 `tracker_record` rows |
| 4 | a handcrafted legacy halt still blocks and still clears | pass | pass | both retired triggers block; `clear-halt.js` clears from either directory |
| 5 | a project declaring `guard.protectedPaths` gets the retired-key advisory and nothing else | pass | pass | one `guard_advisory` + one `guard_allow`; no block, escalation untouched |
| 6 | `.guard-state/` grows no `protected-snapshot.json` | pass | pass | 0 matches for `protected-snapshot*` or a `reverted/` directory anywhere under either project |

### 1 — the write that used to be denied

`Edit rules/x.md` returns a bare `{}` from both directories. The event rows differ in exactly one
field and the difference is the documented one:

    cwd = <root>            {"event":"guard_allow","tool":"Edit","file":"rules/x.md"}
    cwd = <root>/sub/deep   {"event":"guard_allow","tool":"Edit","file":"/private/tmp/.../rules/x.md"}

`projectRelative` returns a path that lands outside cwd as an absolute string. That is the behaviour
`hooks/lib/project-relative.ts` describes, and it now shows up in the event log rather than in a
verdict.

### 2 — the Bash property, in both of its halves

Six innocuous `Bash` calls, three from the root and three from `sub/deep`, against a project with a
valid configuration: `events.jsonl` stayed at its previous line count and `escalation.json` compared
byte-identical. The counter half was measured later, with a real deny in flight rather than in the
abstract: two decision-governed denies took `consecutiveBlocks` to 2, three `Bash` calls left it at
2, and the next deny took it to 3 and raised the halt. That is issue `260707-0750_*_bash-allow-resets-block-counter-defeats-halt-escalation.md`'s property,
measured on the block source that survives.

**The "emits nothing" half is conditional and the condition now has a live trigger.** The
diagnostics loop sits above the Bash branch, so a project with any configuration diagnostic gets one
`guard_advisory` per Bash call as well. Measured: 20 Bash calls against the project declaring the
retired key produced 20 advisory rows and nothing else. `hooks/guard.ts` states this cost in the
comment above the loop and calls it a deliberate departure. It is not a defect; it is a property that
was cheap while nothing shipped that triggers it, and this removal shipped something that does.

### 3 — churn

Four tracker calls wrote `churn.json` with `keyAnchor: "workbench-root"` and emitted four
`tracker_record` rows. The subdirectory call is the one worth naming: an `Edit` of `notes.txt` driven
from `sub/deep` incremented the SAME `notes.txt` entry to `totalChanges: 2` rather than creating a
second key. The churn key is anchored to the workbench root, so it is spelling-stable across working
directories, which is the property `churn-key-anchor.test.ts` holds and the one the guard's own path
match does not.

### 4 — the legacy halt

Both retired triggers were seeded into `escalation.json` — `protected_path` from the deleted CHECK 2
and `protected_path_measured` from the deleted tracker halt — in the real `EscalationEvent` shape
(`level`, `trigger`, `message`, `timestamp`, `toolName`, `filePath`). Write tools blocked from the
root and from `sub/deep`. The message names the command in full, with the project root resolved
correctly even when the guard ran from a subdirectory:

    cd /private/tmp/fusion-accept-260812/proj && node /Users/k1/.../hooks/dist/clear-halt.js

`clear-halt.js` run from `sub/deep` found the workbench by walking up, printed both legacy events
verbatim, cleared the halt, and writes resumed from both directories. Bash passed under the halt, as
`guard.ts` documents and as the user accepted on 2026-08-07.

A false finding of mine belongs here rather than in the pass column. My first fixture spelled the
event fields `reason` / `tool` / `file` instead of `message` / `toolName` / `filePath`, and
`clear-halt.js` printed `[undefined] protected_path_measured: undefined`. That is my fixture being
invalid, not a defect: `coerceState` does not validate the elements of `recentEvents`, which step 1's
executor recorded as deliberate. The check was retaken with the correct shape and the explanation
reached the screen intact.

### 5 — the retired key

    Guard configuration at <root>/fusion-guard.json: "guard.protectedPaths" no longer exists —
    fusion removed the protected-path mechanism it configured, so declaring the list protects
    nothing and nothing reads it. The key was ignored; the rest of this file is unaffected.
    Delete the line to stop this advisory.

One advisory, one allow, no block, `escalation.json` unchanged. The write it advised about was
`rules/x.md`, a path the declared list names, and it went through. "Nothing else" holds.

### 6 — no snapshot file

`find` over both projects returns 0 matches for `protected-snapshot*` and 0 for a directory named
`reverted`. `.guard-state/` holds `churn.json`, `escalation.json` and `events.jsonl` and nothing else.

## The four additions

### 1. The advisory repeats per guarded call, unbounded, and the number is 428 bytes

Confirmed and quantified. One `guard_advisory` row per guarded call, with no throttle anywhere on the
emission path (grepped `guard.ts` and `lib/events.ts` for a cap, a dedupe or a throttle: no match).

| Driven | Advisory rows |
|---|---|
| 20 write-tool calls, from the root | 20 |
| 20 `Bash` calls, from the root | 20 |
| 20 `Bash` calls, from `sub/deep` | 20 |

One row is **428 bytes**, the length being carried by the message and the absolute path of the file
it names. So 1 000 guarded calls cost **418 KiB** and 10 000 cost **4.08 MiB**, added to a log
nothing prunes.

An anchor from a real project, read without writing to it: `krk/fusion-workbench/.guard-state/events.jsonl`
holds 37 872 rows in 18 MB, of which 5 175 are `guard_allow`. Had that project ever declared the
retired key, it would carry at least 5 175 extra advisory rows, roughly 2.2 MB, plus one per `Bash`
call — and the Bash count is unknowable from the log precisely because an innocuous Bash call writes
nothing. The visible floor is the wrong end of the estimate.

The monitor is not at risk and step 9's reading of it holds. `bin/monitor:185` gives advisories their
own `MAX_ADVISORIES_RETURNED = 8` rather than a share of the warning budget, with a comment naming
the retired key as the case, so a burst makes the panel taller and evicts no block, halt or churn
warning. The unbounded cost is the file, not the panel.

### 2. The advisory is not scoped to the project layer

Confirmed against a stale install: a copy of the plugin whose `hooks/config.json` still declares
`guard.protectedPaths`, driving a project that declares nothing at all. The advisory fires and names
the plugin's own file:

    Guard configuration at /private/tmp/fusion-accept-260812/plugin/hooks/config.json:
    "guard.protectedPaths" no longer exists — ...

Step 7's departure from the `guard.enabled` precedent does what it was written to do. A consumer
running an install from before today hears about it without having to declare anything.

### 3. `fusion-guard.json` is no longer protected against agents

Confirmed, and in all three shapes the floor and the measurement used to cover:

- `Write <root>/fusion-guard.json` is allowed; the rewritten file, carrying an `_agentWasHere` key,
  survived the PostToolUse hook unchanged. Allowed from a subdirectory too, which is the case the
  floor's second, absolute spelling existed for.
- `Edit <root>/agents/coder.md` is allowed and the new content survives the tracker.
- A shell write to `rules/x.md` — the measurement's old subject, reached through the route no
  classifier could predict — lands and stays. Both hooks ran around it.

This is the loss the removal accepted, observed rather than assumed.

### 4. The decision-governed check still works, and it is the only thing that blocks

Armed from the scratch project's own `fusion-guard.json`: one `decisions` entry in category `api`,
`categoryPaths: {api: ["src/api/**"]}`, `categorySensitivity: {api: "high"}`.

    Edit src/api/service.ts   ->  block, "affects area governed by 1 decision(s)", counter 0 -> 1
    Edit src/web/page.ts      ->  allow, counter reset to 0
    deny, deny               ->  counter 2
    3 innocuous Bash calls   ->  counter still 2
    deny                     ->  counter 3, haltActive true, guard_halt row
    Edit notes.txt           ->  block, [HALTED] with the full clear command
    clear-halt.js            ->  cleared; ungoverned write allows, governed write denies again

Four event rows, in the shape a reader can tell apart: two `guard_block` with `Decision: 260812-1600`,
then a `guard_halt` detailed `Halt raised by this block`, then a `guard_halt` detailed `Halt active —
write tool call blocked`. That distinction is what `guard-halt-event.test.ts` kept.

## Two findings, both filed

Neither is a failure of a check. Both are things the run measured that no record carries.

**`260812-1546_*_check-3-the-guards-only-remaining-block-source-allows-from-any-subdirectory-and-nothing-tests-it.md`.**
The same configuration, the same absolute `file_path`, three working directories: the root blocks,
`<root>/src` allows, `<root>/sub/deep` allows. `guard.categoryPaths` is matched against a
cwd-anchored spelling, so a project-relative glob only matches from the root. The behaviour is
documented — `session-start.ts` warns about it at SessionStart, and this run confirmed the warning
fires and reads "from here they inspect the wrong directory and let through what they would otherwise
stop" — but nothing tracks it and nothing tests it. `protected-snapshot-subdirectory.test.ts` was the
suite's only end-to-end case for a guard verdict under a subdirectory cwd and went in step 5; the
plan's claim that its lesson survives in `churn-key-anchor.test.ts` and `session-start-subdirectory.test.ts`
holds for churn and for the warning, and neither asks the question of a verdict. The residual's
tracking record, `260804-2100`, is about the protected list and is correctly described as moot, which
leaves the class itself untracked at the moment it reached the only check that can still block.

**`260812-1546_*_the-record-of-the-floors-loss-does-not-say-the-file-it-stopped-defending-arms-the-last-block-source.md`.**
`hooks/lib/config.ts:125-133` records the loss as "nothing in the guard defends this file from an
agent", bounded by the file being git-tracked. True, and understated: that file is what arms CHECK 3.
Measured in three steps — governed write blocks, the agent rewrites `categorySensitivity` to `low`
and the write to the config file is allowed, the governed write then allows. An agent can turn off
the last block source, and the stated bound is a diff a human reads afterwards. The floor's removal
is decided and this does not reopen it; what is filed is that three surfaces recording the cost each
stop one clause short, and the open decision about whether the escalation counter survives is being
weighed on how live CHECK 3 is.

## What this run does not cover

Stated so the green is read for what it is.

- **The plugin's own repository is untested by construction and stays that way.** The write-tool
  stand-down still fires here, and this run says nothing about whether it should — that is the open
  decision `260812-1232_*_does-the-write-guards-fusion-repo-stand-down-survive-the-loss-of-its-subject.md`.
- **No real Claude Code session was driven.** The hooks were spawned exactly as `hooks.json` spawns
  them, with the envelopes it sends, and that is a faithful reproduction of the hook contract rather
  than of the client. A permissions-layer or matcher change in Claude Code would not show up here.
- **An upgrade was not performed.** The legacy halt was handcrafted into a fresh project rather than
  carried across an actual version change. The state file is the whole of what an upgrade carries, so
  the reproduction is exact for what it claims, and it does not exercise `/fusion:setup` on an
  already-configured project.
- **The two real consuming projects were not touched** beyond a read of `krk`'s event log for the
  anchor above. The scratch-copy rule for a destructive-shaped verification is
  `260810-1820_*_an-executor-verified-a-gate-by-mutating-a-file-another-executor-held-in-the-live-tree.md`.

## Housekeeping

The scratch projects are left in place at `/private/tmp/fusion-accept-260812/` (`proj`, `proj2`,
`plugin`) so the measurements can be re-run. Nothing outside that directory was written except this
entry, the two issues, and the plan's step marker and status.

No commit — the orchestrator commits.

## Note on rules loading

`bin/fusion-rules coder` emitted the chat voice profile (`chat-voice-de.yaml`) and no long-form
writing profile, which is correct: `coder` is not one of the nine prose agents. This entry follows
the artifact language, English, per `rules/fusion-workbench-conventions.md` `## Project language`.
