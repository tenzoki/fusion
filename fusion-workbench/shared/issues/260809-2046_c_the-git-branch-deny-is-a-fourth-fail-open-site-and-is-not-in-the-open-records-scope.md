# The git branch deny is a fourth fail-open site and is not in the open record's scope

---

**Severity:** Medium — an unwritable state directory turns the branch-switch deny into an allow, and the record queued to fix that class does not name this site
**Domain:** code
**Filed by:** coderev (incremental review of `6b94e17..HEAD`)
**Affects:** `hooks/guard.ts:350-368` — `guardBashCommand` STEP 1: `recordBlock` → `saveEscalation` → `emitBlockEvent` → `block(...)`
**Cross-references:**
`fusion-workbench/shared/issues/260809-1825_o_an-unwritable-guard-state-directory-turns-the-protected-path-deny-into-an-allow.md` — same defect, whose **Affects** names CHECK 1, CHECK 2 and CHECK 3 only, and whose acceptance criteria list the halt, the protected path and the decision-governed path

---

## What is wrong

`260809-1825` states the shape correctly: a record about a decision stands ahead
of the decision, so a `saveEscalation` throw discards a deny that was already
made. It enumerates three sites, all inside `main`'s write-tool path.

There is a fourth, on the Bash path. `guardBashCommand` has the identical
sequence, and it guards the **git branch policy** — the one policy fusion
documents in three places as running unconditionally, including in the plugin's
own repository.

Because the enumeration drives the fix and the acceptance criteria, a change
that satisfies `260809-1825` as written would leave the branch deny failing
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
`260809-1825` exactly, which is what identifies the two as one defect.

## Suggested direction

Fix with `260809-1825` rather than separately — same reordering, one more site.
Extend that record's **Affects** and acceptance criteria to cover
`guardBashCommand` STEP 1, and close this one against it.

Worth checking while there, and not asserted here: STEP 3's override note
(`hooks/guard.ts:378-394`) also saves before falling through to `allow()`. A
throw there costs the advisory rather than a verdict, so it is the cheaper
direction — but it is the same call and should be looked at once rather than
found later.

## Acceptance criteria

- [ ] With `.guard-state/` unwritable, `Bash` with `git switch main` still emits
      `{"decision":"block", …}` and exits 0.
- [ ] `260809-1825` names this site, or this record is closed by the commit that
      closes it.
