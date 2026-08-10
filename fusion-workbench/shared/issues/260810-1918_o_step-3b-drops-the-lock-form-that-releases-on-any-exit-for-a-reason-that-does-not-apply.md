Step 3b drops the lock form that releases on any exit, for a reason that does not apply

---

`agents/orchestrator.md:429` gives the reason the commit step no longer uses `with`:

> Use the explicit `acquire` / `release` form … **or** when any argument is text the session did not
> author as a literal — a commit message above all. A commit is that second case, which is why this
> step does not use `with`. Never reach for `with` here on the grounds that it is labelled
> canonical: the message would have to travel inside its `--` argument, and that is the defect above.

The message does not travel inside the `--` argument. Step 3 (`agents/orchestrator.md:405`) already
put it in a file, and step 4 passes `git commit -F /tmp/fusion-commit-msg-<task-id>.txt` — a fixed
literal path the session wrote out itself, which is the case line 429 says `with` *stays correct
for*. The two skills that commit prove it: `skills/commit/SKILL.md:94` and
`skills/cleanup/SKILL.md:93` both run `with <tag> -- bash -c 'git add <path> <path> && git commit -F
<msg-file>'` and carry no message text at any point. The same range that wrote line 429 also wrote
the `-F` instruction into both of them.

So the stated justification is a non sequitur, and what it buys is negative: `with` "acquires, runs,
and releases on any exit" (`rules/workbench-stash-and-lock.md:132`). The four-command block at
`agents/orchestrator.md:419-426` has no `trap`, no `||`, no `set -e` discipline — nothing that runs
`release` when a command in the middle fails. Line 427 states the obligation in prose ("Run
`release` on **every** exit path, a failed `git add` or `git commit` included") one line after
showing a sequence that does not do it. That is the shape this repository's own rules call a
convention rather than an enforcement.

Third consequence: `rules/workbench-stash-and-lock.md:135` is the authoring home for the commit lock
and still says *"The `with` form is canonical; explicit `acquire`/`release` is for special cases like
internal control-flow (retry after bugfixer in orchestrator Phase 2 Step 3b)."* Line 429 adds a
second criterion that the rule file does not carry. Two definitions of when to use which form, in a
topic `rules/fusion-workbench-conventions.md` explicitly partitioned out to one home.

---

**Failure scenario.** Task completes; the orchestrator runs the four commands as four Bash calls.
`git add` names a path the bugfixer reverted, so it exits 128. The agent stops at the failing call
and reports the task as errored. `release` is never reached. `fusion-workbench/.commit-lock/` stays
held with this session's holder file and a live PID, so `is_stale_lock` (`bin/fusion-commit-lock:119`)
will not force-release it until 60s have passed — and a parallel `/fusion:commit` blocks the whole
time. A `git commit` that fails on an empty index or a rejecting pre-commit hook does the same.

**Fix direction.** Either

(a) restore `with orchestrator -- bash -c 'git add … && git commit -F <msg-file>'` for the linear
    case, keeping explicit `acquire`/`release` only for the branch line 429's *first* criterion
    genuinely names (the bugfixer retry in 2c); or

(b) keep the explicit form and give the block a shape that releases — a `trap
    '"$FUSION_PLUGIN_ROOT/bin/fusion-commit-lock" release' EXIT` around the sequence, or
    `… || { release; exit 1; }` on each command — so the obligation at line 427 is executed rather
    than requested.

Whichever is chosen, `rules/workbench-stash-and-lock.md` `## Commit lock` moves with it in the same
commit; it is the authoring home and currently disagrees.

**Filed by:** coderev, review of session `260810-1646` Turn 1, range `5ef92eb..940d522`.
