The log-only predicate reads HEAD alone, so a wrapped command landing two commits can lose its row

---
`emit_commit_event` decides whether a commit landed by comparing `before` against HEAD, but
`commit_is_log_only` inspects HEAD only. A wrapped command that lands two commits whose last is
log-only emits nothing, although a non-log commit landed inside the same held region.

---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>

**Where.** `bin/fusion-commit-lock:333-339`. `before` is the pre-command HEAD passed from the
`with` branch at line 415; line 338 compares it with the post-command HEAD, and line 339 then
asks `commit_is_log_only`, which at line 328 reads `git show --name-only --format= HEAD` and so
sees the last commit of the range and no other.

**What changes.** Before `8d4bbe07` such a command emitted one row, naming the final HEAD. It now
emits none. The intermediate commits were never carried by a row either way, so what is new is
the loss of the one row the wrapped command was owed.

**Unspent today.** Every shipped call site stages and commits once per acquisition:
`skills/commit/SKILL.md:118` and `:131`, `skills/cleanup/SKILL.md:72`,
`agents/orchestrator.md:299`. `agents/coder.md:26` and `agents/ontocoder.md:44` wrap an arbitrary
`<git command>`, which is where a two-commit shape would come from.

**Fix direction.** Ask the range rather than the tip: compare the sorted output of
`git diff --name-only "$before" HEAD` against the log's toplevel-relative path, keeping the
existing empty-output guard. `before` is the short hash already read at line 409 and is empty
only when HEAD did not exist, a case line 338 has already returned on.

**Acceptance test.** Wrap `sh -c 'git commit -m a <code file> && git commit -m b <log only>'` in
`fusion-commit-lock with` and assert one `commit` row is appended.

**Cross-references:** `260912-2041_*_should-the-commit-lock-skip-its-row-when-the-commit-carries-nothing-but-the-log.md`

Resolved: the predicate is asked of the range the caller already decides on. `commit_is_log_only`
takes `before` and reads `git diff --name-only "$before" HEAD`, keeping the empty-output guard; the
root-commit case, where `before` is empty because HEAD did not exist, falls back to `git show
--name-only --format= HEAD`, which the record's reading of line 338 did not cover. Pinned by the
two-commit case in `hooks/lib/__tests__/fusion-commit-lock.test.ts`, which wraps a code commit and a
log-only commit in one `with` and asserts the row — red against HEAD's script, green against the fix.
