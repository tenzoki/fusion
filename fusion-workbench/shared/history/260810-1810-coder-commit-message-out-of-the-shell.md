# coder — `I:260810-1535-commit-apostrophe` (Turn 1)

**Status:** Complete
**Task:** take the shell out of the commit-message path in `agents/orchestrator.md` Phase 2 Step 3b
**Source record:** issue `260810-1535_*_the-orchestrators-commit-procedure-truncates-any-message-containing-an-apostrophe.md` (`...-truncates-any-message-containing-an-apostrophe`), in `$SCAN_ISSUES`
**Session:** `260810-1646-orchestrator-session.md`

## Route taken

Option 1 from the record: the message is written to a file with the `Write` tool and reaches `git`
only as `-F <file>`. No character in the message can be special because no shell parses it. Option 2
(keep `bash -c`, quote more carefully) was rejected as the record specifies — it is the shape that
failed, made conditional on getting the quoting right every time.

**One deviation from the dispatch prompt's wording, and it is deliberate.** The prompt said the fix
"composes with the commit lock through the explicit `acquire` / commit / `release` form". I took that
literally and dropped `with` for the commit sequence, but not only because the message needs it —
after the `-F` change the message is no longer on the command line at all, so `with … -- bash -c
'git add <paths> && git commit -F <file>'` (the form both committing skills already use) would also
have satisfied the acceptance. The reason to prefer the explicit form here is the *paths*: inside a
single-quoted `bash -c` argument, a file path containing an apostrophe reintroduces the identical
defect one layer down. The explicit form runs `git add` as a plain command with no nesting, so the
whole sequence — message and paths — leaves the shell's quoting rules out of it, not just the
message. The cost is that `release` must now be run by hand on every exit path, and the prompt says
so explicitly.

I did **not** change `rules/workbench-stash-and-lock.md` (read-only per the dispatch). It needs no
change: it already says the `with` form is canonical and explicit `acquire`/`release` is for special
cases like internal control-flow. Step 3b now names the second condition (an argument that is text
the session did not author as a literal) at the call site. If that condition should live in the rule
rather than in one caller, that is a separate queued change.

## What changed

`agents/orchestrator.md` — Phase 2 Step 3b only, steps 3–7 restructured to 3–5:

- **Step 3** is now "write the commit message to a file". Absorbs the old step 5 (message format
  block, unchanged) and replaces the old step 6 ("Use HEREDOC"). Names the tool (`Write`), the path
  (`/tmp/fusion-commit-msg-<task-id>.txt`, task-ID-scoped so parallel sessions cannot collide), and
  the forbidden alternatives (`echo`, heredoc, `-m`). Carries the measured evidence — `045a14f`,
  the `project's` apostrophe, the three lines executed as commands, the exit 0, the `4f16c60`
  repair — because the failure is silent and the next author needs to know why the rule exists.
- **Step 4** is the acquire / stage / commit / release block, four plain commands, no `bash -c`.
  The old step 4's staging constraint (task-relevant files + workbench tracking, never `git add -A`,
  be explicit) survives as comments on the `git add` line. Adds the release-on-every-exit-path
  obligation and what it buys back.
- **Step 4** closes with the case split the record demanded: `with <tag> -- <cmd…>` for commands
  whose arguments are all fixed literals; explicit `acquire`/`release` when the sequence has
  internal control-flow **or** any argument is text the session did not author as a literal. Plus
  the sentence that stops the next author reaching for `with` because it is labelled canonical.
- **Step 5** is the unchanged `commit` event emission (old step 7).

No other section of `agents/orchestrator.md` was touched. Cross-references to "Step 3b step 1"
(validation) and "Step 3b step 2" (self-healing) at `:381` and elsewhere still resolve — those two
step numbers did not move.

`skills/commit/SKILL.md` and `skills/cleanup/SKILL.md` — **the nesting defect is absent in both.**
Their `bash -c` argument carries only `git add <paths> && git commit -F <msg-file>`; the message is
already in a file. What both did carry is a smaller member of the same class: each said to write the
scratch file with a "HEREDOC" without specifying the delimiter, and a bare `<<EOF` still expands
`$var` and executes backticks in the message body. Both now name a quoted delimiter
(`<<'FUSION_MSG_EOF'`); cleanup, which has the `Write` tool, names that first. `/fusion:commit`'s
`allowed-tools` is `[Bash, Read, Glob, AskUserQuestion]` — no `Write` — so the heredoc is its only
route and the quoted delimiter is the fix there.

## Verification

`cd hooks && npm test` — **exit 1**, one failing test, and it is not mine:
`derivable-enumerations-lint.test.ts > lists exactly the lib/*.ts files that exist` fails because
`hooks/lib/domain-cascade.ts` (new, untracked, another coder's task this Turn) is absent from the
`hooks/lib` table in `README-hooks.md`. The assertion diff names exactly that one file. I touched no
`.ts` file and not `README-hooks.md`.

The first full run of the suite failed on **my** change and the lint was right: `path-literal-lint`
rejected the issue-store path literal I had written into the citation in step 3. Rewritten to name
the record by ID and point at `$SCAN_ISSUES` (a key the orchestrator prompt already uses seven
times, and which `bin/fusion-paths orchestrator` values). `npx vitest run
lib/__tests__/path-literal-lint.test.ts` — exit 0, 19/19.

**Direct demonstration** (scratch git repo with a `.fusion-setup` marker, so the real commit lock
runs): a message containing `orchestrator's`, `project's`, `doesn't`, a backtick pair around
`` `bash -c` ``, and a literal `$HOME` was written by heredoc, committed through the exact Step 3b
sequence (`acquire orchestrator` / `git add` / `git commit -F` / `release`), and read back with
`git log -1 --format=%B`. `diff` against the source file is empty — verbatim, `$HOME` unexpanded,
backticks intact, lock acquired and released.

**Reproduction of the old form, and it took three attempts to do honestly.** My first two contrast
runs did *not* reproduce the truncation, because writing the failing command from this shell forced
me to escape the apostrophe — which is precisely what the orchestrator would not do. Only writing
the command text to a script file, exactly as the prompt would emit it, reproduced it: `bash` died
with `unexpected EOF while looking for matching "`, the message's later lines ran as commands
(`command not found: be`, `command not found: folder`), and no commit landed. Same failure family as
`045a14f`.

## Not touched

`fusion-workbench/tasklist.md` task 1 checkbox and the `_p_` → `_c_` rename on the issue record.
Neither is in the dispatch's "files you own this Turn" list, three other coders are editing the
queue file this Turn, and the dispatch reserves staging and commit to the orchestrator. Flagged in
the report instead.
