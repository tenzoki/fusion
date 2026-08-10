# coder — the skills' rooted citations follow the work-tree preference

**Status:** Complete
**Task:** `R:260810-1918-rooted-in-own-repo` (session `shared/history/260810-1646-orchestrator-session.md`, Turn 2, mode `issues`, domain `code`)
**Record:** `shared/issues/260810-1918_c_the-rooted-citations-read-the-installed-copy-inside-the-plugins-own-repo-where-the-helpers-do-not.md` (`_p_` → `_c_`)
**Review that filed it:** `shared/reviews/260810-1918-coderev-turn-1-range-5ef92eb-940d522.md`, finding L3.

## What was wrong

Turn 1 (`89b13f1`) rooted every citation of `agents/orchestrator.md` in the two skills through
`$FUSION_PLUGIN_ROOT`. That is right for a consuming project and wrong inside the fusion plugin's own
repository, where `$FUSION_PLUGIN_ROOT` names the installed copy and is pinned for the session while
`bin/fusion-rules` and `bin/fusion-paths` deliberately read the work tree. A developer running
`/fusion:setup` here would get rules and paths from the checkout and a cited prompt section from the
install: two versions of one file, differing in silence.

## What changed

Fix direction (a) from the record. Both skills now resolve a source root before their first citation:

```bash
if "$FUSION_PLUGIN_ROOT/bin/fusion-plugin-cwd" 2>/dev/null; then FUSION_SRC="$PWD"; else FUSION_SRC="$FUSION_PLUGIN_ROOT"; fi
```

- `skills/setup/SKILL.md` — header paragraph rewritten (the resolution, the reason, the no-upward-walk
  bound); the four citations at Step 2 and Step 3 now read `$FUSION_SRC/agents/orchestrator.md`; the
  `queue-check` snippet re-resolves the root inline.
- `skills/next/SKILL.md` — the same header paragraph, byte-identical to setup's so a diff shows drift;
  the three citations in the briefing render and Step 6.3 now read `$FUSION_SRC/agents/orchestrator.md`;
  the `queue-check` snippet re-resolves the root inline.

Three properties the change holds to deliberately:

1. **The criterion is reused, not re-derived.** `bin/fusion-plugin-cwd` is the same helper both path
   helpers call, so the skills now give the same answer rather than a second one. The helper was not
   modified; it was read-only for this task.
2. **No upward walk.** The check tests the working directory only. From a subdirectory of this
   repository it answers no, and every branch then behaves as in a consuming project — congruent with
   `hooks/lib/self-detect.ts` by design, and already warned about at SessionStart.
3. **The presence check works under both branches.** Each snippet re-resolves the root (a later shell
   call is a fresh shell, so the variable does not survive), and the `UNAVAILABLE` message names the
   resolved path as the copy in use: an install that predates the section, a work tree that does not
   carry it, or nothing at all when `FUSION_PLUGIN_ROOT` is unset.

An install too old to carry `bin/fusion-plugin-cwd` falls to the `$FUSION_PLUGIN_ROOT` branch, which
is the behaviour that preceded this change.

## Verification

`npm test` from `hooks/` — 41 files, 1113 tests, **exit 0**. `queue-ground-lint` still matches the
required citation form, since `$FUSION_SRC/agents/orchestrator.md` `### The queue's ground` contains
the substring it pins.

Both branches were demonstrated against a fixture built in the scratchpad (nothing in this tree was
mutated), running the queue-check snippets extracted verbatim from the two shipped skill bodies:

| Case | cwd | resolved copy |
|---|---|---|
| A | fixture plugin repo | the work tree (`MARKER: WORKTREE COPY`) |
| B | fixture consuming project | the install (`MARKER: INSTALL COPY`) |
| C | subdirectory of the fixture plugin repo | the install — the no-upward-walk bound |
| D | either branch, section stripped from the resolved copy | `queue-check: UNAVAILABLE`, naming that copy |
| E | `FUSION_PLUGIN_ROOT` unset | `queue-check: UNAVAILABLE` |
| F | this repository, real `$FUSION_PLUGIN_ROOT` | `/Users/k1/Projects/productive/fusion/agents/orchestrator.md` |
| F' | `$HOME` | `/Users/k1/.fusion/agents/orchestrator.md` |

F and F' are read-only greps against the two live copies; no file was written.

## Noted, not fixed

- **Reference-lint reach.** `hooks/lib/__tests__/reference-resolution-lint.test.ts` resolves
  `$FUSION_PLUGIN_ROOT/<path>` and `$CLAUDE_PLUGIN_ROOT/<path>` (`ROOT_VAR_RE`, line 212) and knows
  nothing about `$FUSION_SRC`, so the seven moved citations are no longer existence-checked there.
  Their target stays pinned by `queue-ground-lint`, which reads `agents/orchestrator.md` by name, and
  by the rooted citations in other shipped files. Adding `FUSION_SRC` to `ROOT_VAR_RE` would restore
  per-site coverage; `hooks/**` was outside this task's file set.
- **The self-citation in the header paragraph** still reads a bare `skills/cleanup/SKILL.md:11`, which
  belongs to issue `260810-1918_p_the-citation-rooting-reached-two-of-three-skills-and-its-own-example-is-unrooted.md`,
  in progress with another executor. Its surrounding words changed here ("takes the plugin-root route"
  where it read "takes that route"), so a string-match edit written against the old text will miss.
- **A single home for the resolution** would be a `bin/` helper printing the source root, which every
  consumer could call instead of carrying the two-line branch. Proposed, not built: `bin/` was
  read-only for this task.
