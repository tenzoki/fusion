# The git branch deny is a fourth fail-open site and is not in the open record's scope

---

**Severity:** Medium — an unwritable state directory turns the branch-switch deny into an allow, and the record queued to fix that class does not name this site
**Domain:** code
**Filed by:** coderev (incremental review of `6b94e17..HEAD`)
**Affects:** `hooks/guard.ts:350-368` — `guardBashCommand` STEP 1: `recordBlock` → `saveEscalation` → `emitBlockEvent` → `block(...)`
**Cross-references:**
`260809-1825_*_an-unwritable-guard-state-directory-turns-the-protected-path-deny-into-an-allow.md` — same defect, whose **Affects** names CHECK 1, CHECK 2 and CHECK 3 only, and whose acceptance criteria list the halt, the protected path and the decision-governed path

---

## What is wrong

`260809-1825_*_an-unwritable-guard-state-directory-turns-the-protected-path-deny-into-an-allow.md` states the shape correctly: a record about a decision stands ahead
of the decision, so a `saveEscalation` throw discards a deny that was already
made. It enumerates three sites, all inside `main`'s write-tool path.

There is a fourth, on the Bash path. `guardBashCommand` has the identical
sequence, and it guards the **git branch policy** — the one policy fusion
documents in three places as running unconditionally, including in the plugin's
own repository.

Because the enumeration drives the fix and the acceptance criteria, a change
that satisfies `260809-1825_*_an-unwritable-guard-state-directory-turns-the-protected-path-deny-into-an-allow.md` as written would leave the branch deny failing
open.

## Measured

Scratch consuming project, `.guard-state/` at mode `0555`, `hooks/dist/guard.js`
as a subprocess:

```
--- writable, Bash `git switch main`:
{"decision":"block","reason":"fusion policy: agents never switch git branches autonomously …"}
exit=0

--- UNWRITABLE .guard-state, Bash `git switch main`:
{}
[guard] Error: Error: EACCES: permission denied, open '…/.guard-state/escalation.json.tmp'
exit=0
```

`{}` is the allow. The Edit-of-a-protected-path case in the same run reproduces
`260809-1825_*_an-unwritable-guard-state-directory-turns-the-protected-path-deny-into-an-allow.md` exactly, which is what identifies the two as one defect.

## Suggested direction

Fix with `260809-1825_*_an-unwritable-guard-state-directory-turns-the-protected-path-deny-into-an-allow.md` rather than separately — same reordering, one more site.
Extend that record's **Affects** and acceptance criteria to cover
`guardBashCommand` STEP 1, and close this one against it.

Worth checking while there, and not asserted here: STEP 3's override note
(`hooks/guard.ts:378-394`) also saves before falling through to `allow()`. A
throw there costs the advisory rather than a verdict, so it is the cheaper
direction — but it is the same call and should be looked at once rather than
found later.

## Acceptance criteria

- [x] With `.guard-state/` unwritable, `Bash` with `git switch main` still emits
      `{"decision":"block", …}` and exits 0.
- [x] `260809-1825_*_an-unwritable-guard-state-directory-turns-the-protected-path-deny-into-an-allow.md` names this site, or this record is closed by the commit that
      closes it.

---
Resolved: `f9c4214`, verified at HEAD by the reconciler (260809-2252). The record was closed by
rename with no resolution note and with both criteria unticked; the ticks above and this footer
are the reconciler's.

- Criterion 1 — CONFIRMED. With `.guard-state/` at `0555`, `Bash` carrying `git switch main`
  answers `{"decision":"block","reason":"fusion policy: agents never switch git branches…"}`
  at HEAD, against `{}` at `f9c4214^`. Code at `hooks/guard.ts:381-392`; pinned by
  `hooks/lib/__tests__/hook-fail-open.test.ts:290-309`.
- Criterion 2 — CONFIRMED by its second disjunct. `260809-1825_*_an-unwritable-guard-state-directory-turns-the-protected-path-deny-into-an-allow.md`'s body was never edited to name
  this site, but one commit closed all three records, which is what the criterion offered as the
  alternative. The first disjunct is not met and does not need to be.

The record's "worth checking while there" note about the Bash STEP 3 override path was also
addressed, at `hooks/guard.ts:411-433`.
