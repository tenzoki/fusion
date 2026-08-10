Seven citations left the reference lint's existence check when they gained a second root variable

---

`hooks/lib/__tests__/reference-resolution-lint.test.ts:212` defines `ROOT_VAR_RE`, which recognises
exactly two root variables: `$FUSION_PLUGIN_ROOT` and `$CLAUDE_PLUGIN_ROOT`. A citation written with
either is resolved and its target is checked to exist.

Session `260810-1646` introduced a third. Both skills now resolve a source root once —
`$FUSION_SRC`, which is the work tree inside the plugin's own repository and the install everywhere
else — and the seven citations of `agents/orchestrator.md` in `skills/setup/SKILL.md` and
`skills/next/SKILL.md` were rewritten to use it. `ROOT_VAR_RE` does not know the name, so all seven
silently dropped out of the existence check.

The suite stayed green throughout, which is the point: nothing failed, coverage simply shrank.

---

**What still covers the target, and what does not.** `queue-ground-lint` reads
`agents/orchestrator.md` by name and pins `### The queue's ground` to exactly one occurrence, so the
*file* and that one *heading* are not unpinned. What is gone is per-site coverage: seven individual
citations are no longer checked to resolve, and a future citation written with `$FUSION_SRC` to a
path that does not exist would be accepted by every gate the project has.

**The fix is small and its size is the trap.** Adding `FUSION_SRC` to `ROOT_VAR_RE` restores the
seven. It does not address why a gate's coverage can shrink without a single test turning red, and
that is the part worth thinking about for a minute before typing: this is the second coverage hole
this session found by reading rather than by running, after the domain cascade's second copy
(`260810-1918`). Both are the same shape — a gate that enumerates what it recognises, and a change
that adds a case the enumeration does not carry.

Consider whether the lint should fail on an *unrecognised* `$VAR/`-rooted citation rather than
skipping it. A skip is what makes the shrinkage silent; a failure on the unknown name would have
turned red the moment `$FUSION_SRC` appeared, and the fix would have been part of that change instead
of a record filed after the fact.

**Scope note.** The executor that introduced `$FUSION_SRC` reported this itself; `hooks/**` was
outside its assigned files, which is why it is filed rather than fixed.

**Filed by:** orchestrator, session `260810-1646`, on the rooted-citations executor's report.
