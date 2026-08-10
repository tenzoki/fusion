A marker rename is claimed by two prompts, and one executor moved seven other executors' records

---

`agents/orchestrator.md:216` lists, among the things the orchestrator may do, *"Rename state markers
on files under `$SCAN_ISSUES` and `$SCAN_PLANS` (`_o_` to `_p_`, `_p_` to `_c_`)"*. `agents/coder.md:46`
instructs the executor to do the same thing at the end of its task: *"Issue → append `Resolved:` note
+ rename marker `_o_` (or `_p_`) → `_c_`"*. Both are read as permission by the agent holding them, and
in session `260810-1646` both acted on it — the orchestrator renamed `_o_` → `_p_` at dispatch, several
executors renamed `_p_` → `_c_` at completion, and the orchestrator renamed others itself when the
executor had not.

Nothing detects the overlap, because both parties produce the same result on the happy path.

---

**How it surfaced.** Turn 2 ran five executors in parallel, each owning a named subset of eleven
records filed by one review. One executor performed its four closures with
`for f in 260810-1918_p_*.md`. The glob matched all eleven, so seven records belonging to four other
running executors were renamed. It noticed, reverted in the next command, and reported it unprompted.

Verified afterwards by the orchestrator: all twelve in-flight records are intact, each current file
is byte-identical to its committed version in the region that existed before the session, and only
the markers moved and moved back.

**Why it is worth filing anyway.** Two prompts claim the same transition, and the consequence is not
the duplicate work — it is that no party can assume it is the only one renaming, so no party can
safely use a pattern. The executor's own diagnosis is the sharpest statement of it: the glob stood in
for paths written out, which is precisely what the staging rule it had just finished writing into
Step 3b forbids one file over. A rule stated for `git add` and not for `mv` is a rule the next
executor applies to `git add` only.

**Reach beyond this session.** A parallel batch is the case where this bites, and parallel batches are
now routine — this session has run two of them. With one executor per Turn the overlap is invisible,
which is why it survived this long.

**Options.**

1. **One owner.** Strike the rename from one of the two prompts. The orchestrator is the better
   candidate on paper: it already dispatches, already knows which records belong to which task, and
   already stages the rename into a commit. The cost is that the executor knows *when* the work is
   done and the orchestrator only knows when the report arrives, so the `Resolved:` note and the
   rename would separate.
2. **Keep both, forbid the pattern.** Leave the shared transition and state in both prompts that a
   marker rename names its files explicitly, never through a glob — the same rule as staging, applied
   to the surface it was not applied to.
3. **Make the transition atomic per record.** Append-and-rename as one step per record, so a partial
   batch cannot leave a record renamed but unannotated. Note that `260810-0819` is already filed
   against a neighbouring half of this — a marker rename that can be staged half-way.

Options 2 and 3 compose; option 1 excludes them. Whoever takes this should read `260810-0819` first,
since a single change may settle both.

**Filed by:** orchestrator, session `260810-1646`, on the Turn-2 commit-procedure executor's own
report of the incident.
