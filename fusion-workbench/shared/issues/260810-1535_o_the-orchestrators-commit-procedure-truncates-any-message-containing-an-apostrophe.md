The orchestrator's commit procedure truncates any commit message containing an apostrophe

---

`agents/orchestrator.md` Phase 2 Step 3b tells the orchestrator to use the commit lock as
`"$FUSION_PLUGIN_ROOT/bin/fusion-commit-lock" with orchestrator -- bash -c "git add <files>; git commit ..."`
and, two lines later, to "use HEREDOC for commit messages to ensure correct formatting".
Followed together, those two instructions produce a command whose heredoc body sits inside a
quoted `bash -c` argument. The first apostrophe in the message closes that quoting, and
everything after it is re-parsed by the outer shell.

Measured, not reasoned: commit `045a14f` in this repository landed with its message cut off
mid-sentence at `so a consuming project` — the apostrophe in `project's` ended the quoted
argument. Three further lines of the message were then executed as commands and reported
`command not found: be`, `command not found: folder`, `command not found: were`. The commit's
*content* was correct and complete; only the message was destroyed. It was repaired by
`git commit --amend -F <file>`, producing `4f16c60`.

---

**Why this is worth a record rather than a note.** The failure is silent in the direction that
matters. `git commit` succeeded, exit 0 was reported by the lock helper's own wrapper, and the
truncated message is only visible to someone who reads the commit back. The stray
`command not found` lines appeared *after* the success line, where they read as noise from the
lock helper rather than as evidence that the message was mangled. A session that does not read
its own commit back will not notice, and a project whose commit messages carry the reasoning —
which is this project's explicit convention — loses exactly the part the convention exists for.

**The trigger is common, not exotic.** An apostrophe is ordinary English punctuation. Any
message containing `project's`, `doesn't`, `agent's`, `it's` or a possessive of any kind hits
it. This repository's own commit history is full of such messages, written before the lock
instruction was added to Step 3b.

**Two candidate fixes, and they are not equivalent:**

1. **Write the message to a file, then `git commit -F <file>`, with no nested quoting.** The
   orchestrator has a `Write` tool and can produce the file directly. This removes the shell
   from the message path entirely, so no character in the message can be special. It also
   composes with the lock: `fusion-commit-lock acquire orchestrator`, then a plain
   `git commit -F`, then `release` — the explicit acquire/release form Step 3b already permits
   "if the commit sequence has internal control-flow".
2. **Keep `bash -c` and quote more carefully.** This is the shape that just failed, made
   conditional on getting the quoting right every time. It is the additive fix that leaves the
   hazard in place, and `rules/critical-stance.md` §2 names that pattern.

Option 1 is the integral fix: it removes the class rather than the instance.

**Scope note.** Step 3b's `with <tag> -- <cmd...>` form is documented in
`rules/workbench-stash-and-lock.md` as the canonical pattern, and it is the right pattern for
commands with no free text in them. The defect is not the `with` form; it is combining it with
a heredoc carrying prose. Whatever is written should say which of the two forms belongs to
which case, or the next author reaches for `with` again because it is labelled canonical.

**Related.** `/fusion:commit` and `/fusion:cleanup` are the two skills that also commit and
also wrap their commits in the lock. Check whether either carries the same nesting before
concluding this is one site.

**Filed by:** orchestrator, session `260810-1402`, after hitting it on its own second commit
of the session.
