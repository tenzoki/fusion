A union-merged log merge is read as log-only, so three shipped statements about merges are false

---
`commit_is_log_only` suppresses the row for a merge commit whose combined diff lists the event
log alone. That is the ordinary shape of a merge between two checkouts under the `merge=union`
driver the workbench's own `.gitattributes` sets, and three shipped places state the opposite.

---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>

**The three statements.**

- `bin/fusion-commit-lock:323-324`: "a commit with no listed path is not a log-only commit: a
  merge lists none under `--name-only`, an empty commit lists none either, and both still emit."
- `rules/commit-lock.md:68`: "A commit that lists no path is not a log-only commit: a merge lists
  none and an empty commit lists none, and both emit their row."
- `hooks/lib/__tests__/fusion-commit-lock.test.ts:389`: "a merge lists nothing under
  `--name-only`".

A merge lists nothing only when its result equals one parent on every path. `git show` defaults
to the combined diff on a merge, which lists every path whose content differs from all parents.
A union merge produces exactly that for the log, because the union of two appended blocks equals
neither side.

**Measured, twice, against the real script.** Fixture: `git init`, `.gitattributes` carrying
`fusion-workbench/orchestrator-events.jsonl merge=union`, two branches each appending one line to
the log, then `bin/fusion-commit-lock with test -- git merge --no-ff -m merge side` with
`FUSION_SESSION_ID` exported. The merge commit exists (`git rev-list --merges -1 HEAD` is
non-empty), the union driver resolved the log to three lines, and no `commit` row was appended:
the log grew by the one union line and nothing else. The same suppression occurs for a conflicted
merge whose only conflicted path is the log, where `git show --name-only --format= HEAD` prints
that single path.

**Why the test does not catch it.** The merge case at
`hooks/lib/__tests__/fusion-commit-lock.test.ts:388-402` merges two branches touching `side.txt`
and `base.txt`, which are disjoint, so the combined diff is empty and the merge lists nothing.
The case pins the half that is true and nothing exercises the half that is not.

**Scope.** `bin/fusion-commit-lock`, `rules/commit-lock.md`, the hook test. The lock is
contractually merge-capable (`agents/coder.md:26` and `agents/ontocoder.md:44` wrap an arbitrary
`<git command>`, and the test itself wraps `git merge`), so this is reachable, not hypothetical.
No skill body wraps a pull or a merge today, which is what keeps the severity below High.

**Two fix directions, pick one and say which in the prose.** Either make the predicate
merge-aware, returning 1 when `git rev-list --merges -1 HEAD` is non-empty, which restores the
absolute the three statements assert; or leave the behaviour and correct all three statements to
say what holds, that a merge emits unless its combined diff lists the log alone.

**Acceptance test.** The fixture above, asserting a `commit` row is appended for a union merge
whose only differing path is the event log, and a second case asserting the same for a conflicted
merge resolved only in the log.

**Cross-references:** `260912-2041_*_should-the-commit-lock-skip-its-row-when-the-commit-carries-nothing-but-the-log.md`

Resolved: the strict direction, on the user's ruling — `bin/fusion-commit-lock` `commit_is_log_only`
returns 1 whenever `git rev-list --merges -1 "${before}..HEAD"` is non-empty, so a merge landed in the
held region always emits and the absolute the three statements assert holds again. Two of the three
therefore stood as written and were only re-argued rather than corrected: the script comment and
`rules/commit-lock.md` `### The lock writes the commit event` now say a merge emits BECAUSE a merge
landed, not because it lists nothing, since the second half of each sentence was the false one. The
merge check is scoped to the range and not to HEAD's history, or a merge that predated the wrapped
command would force a row. Pinned by two cases in `hooks/lib/__tests__/fusion-commit-lock.test.ts`,
a union merge under a fixture `.gitattributes` carrying `merge=union` and a conflict resolved only in
the log, each asserting the fixture's combined diff lists the log alone before asserting the row —
both measured red against HEAD's script and green against the fix.
