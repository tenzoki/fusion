Two concurrent sessions share one /tmp commit-message path, so one can commit the other's message

---
The orchestrator writes every commit message to `/tmp/fusion-commit-msg-<task-id>.txt`. That
path carries no project, no checkout and no session, so two fusion sessions running against
two different projects on one machine write the same file whenever their task ids agree. Task
ids are short and conventional, so they agree often. Observed, not reasoned about.

---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>

## What happened

At 22:08 on 2026-09-05 this session's `/tmp/fusion-commit-msg-L1-RECONCILE.txt` was replaced by
a commit message belonging to a different session working on a different project. The
replacement is identifiable and leaves no room for another reading: it is written in German
against a project with 347 open defect records and a `menue.rs`, its `Source:` line names a
`260905-2054` reconciliation history file in that project's workbench, and it carries
`Claude-Session: https://claude.ai/code/session_01YGhmkbAMAFN41W32hjhy9B` where this session is
`session_01G3zwGUwFLp2LoJrEQbT8Wt`.

That `Source:` line is itself an instance of the open record
`260830-2254_*_a-record-citing-another-projects-workbench-record-is-reported-dangling-forever-and-no-citation-form-expresses-it.md`,
found by walking into it: this record's first version spelled the foreign path out, the citation
gate reported it store-prefixed, and the sweep would have rewritten a path that names nothing in
this workbench and never will. The stamp and the kind of file are named here instead, which is
what the vocabulary can express today.

Nothing was corrupted here, and that is timing rather than protection. This session had already
run `git commit -F` on that path at 21:31, thirty-seven minutes before the overwrite. Had the
order been reversed, the commit would have carried the other project's message onto this
project's tree, and `git commit` would have exited 0.

## Two mechanisms, and the second is the one that makes it likely

**The path is machine-global while the work is per-project.** `agents/orchestrator.md` Step 3b
step 3 fixes the path as `/tmp/fusion-commit-msg-<task-id>.txt`. `/tmp` is shared by every
session on the machine.

**The task id is the only varying part, and it is short by convention.** The `/tmp` directory on
this machine currently holds messages under the ids `T1`, `T1b`, `T2`, `T3`, `T4`, `S1`, `S2`,
`S3`, `S4`, `C1`, `C2`, `REC`, `REV`, `REL`, `FIN`, `CLOSE`, `MINT`, `PM`, `RB`, `TL`, `MKT`,
`STYLE`, `0K`, `56`, `123`, `D12`, `S12`, `S13`, `S14`, `S1011`, `S5678`, and this session's
`L1-A`, `L1-B`, `L1-C`, `L1-reconcile`, `L1-tools`. Two projects each numbering their first
task `T1` collide on the first commit of each.

**And the match is looser than it looks.** The observed collision was between `L1-RECONCILE`
and `L1-reconcile`, which are different strings. macOS mounts a case-insensitive filesystem by
default, verified on this machine by creating `/tmp/fusion-case-probe-A` and finding
`/tmp/fusion-case-probe-a` to exist. So ids that differ only in case are one file, and a
convention of distinguishing tasks by case does not help.

## Why the commit lock does not cover this

`rules/commit-lock.md` `### When it activates` anchors the lock at the workbench: "different
projects have independent locks; sessions on the same project share one lock". That is correct
for what the lock defends, the project's git index. It is exactly wrong for this: the resource
being shared here is a machine-global path, and the two parties contending for it are in
different projects and therefore hold different locks by design. The lock's scope and the
message file's scope disagree, and no amount of locking at the workbench closes a `/tmp`
collision.

## Acceptance

The path a session writes its commit message to is unique per session, so that two fusion
sessions on one machine cannot write each other's file whatever their task ids are and whatever
the filesystem's case behaviour is. The session identifier the SessionStart hook already exports
is one available discriminator; the checkout identifier is another; a `mkdtemp` directory per
session is a third and needs no identifier at all. This record does not choose between them.

Two properties any answer has to keep, because they are why the message is written to a file at
all (`260810-1535_*_the-orchestrators-commit-procedure-truncates-any-message-containing-an-apostrophe.md`):
the message never passes through a shell command line, and the path stays outside the workbench
so it is never reported by a staging read (`agents/orchestrator.md` Step 3b step 3, and the
`commit-message` class in `hooks/lib/staging-drift.ts`).

## Cross-references

`rules/commit-lock.md` `### When it activates` — the scope mismatch above.
`260810-1535_*_the-orchestrators-commit-procedure-truncates-any-message-containing-an-apostrophe.md`
— why the message is in a file, and the two properties to preserve.
