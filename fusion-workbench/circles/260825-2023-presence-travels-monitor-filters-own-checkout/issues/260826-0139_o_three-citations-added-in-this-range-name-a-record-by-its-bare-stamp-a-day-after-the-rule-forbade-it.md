Three citations added in this range name a record by its bare stamp, a day after the rule forbidding that landed

---

`rules/fusion-workbench-conventions.md` `## Filename Patterns` states that a bare stamp is not a citation and that a record is cited by its full filename with the marker wildcarded. The rule landed on 2026-08-24 in `git:2b055a0`. Three citations written on 2026-08-25 in this range use the bare-stamp form.

---

**Filed by:** coderev, Kai Stalmann <ks@qantr.com>

**Severity:** Low

**Evidence.** The rule:

> **A bare stamp is not a citation**: 111 of the 545 stamps in fusion's own corpus are carried by more than one file, measured 260824 over 876 records.

The three:

- `CLAUDE.md:43` — "sorting it moves a reader from vague to wrong rather than repairing it (issue `260823-1302`)"
- `CLAUDE.md:43` — "the call site guards with `[ -x ]` per decision `260810-0921`"
- `README-hooks.md:192` — "sorting it moves a reader from vague to wrong rather than repairing it (issue `260823-1302`)"

`bin/fusion-events`, written in the same step, gets this right: `:119` and `:106` both carry the full wildcarded path.

**Why it is Low and why it is still worth filing.** The surrounding rows in both tables carry the same bare-stamp form, so these three follow an established house style rather than diverging from one — but that style is what the 2026-08-24 rule retired, and no gate resolves a bare stamp, so nothing else will find them. The rows they sit in are the two authored summaries of the new helper, which is where a reader is likeliest to follow a citation.

**Fix direction.** Rewrite the three as full wildcarded paths. Whether the pre-existing bare stamps in the same two tables are swept with them is a scope question for whoever picks this up; this record claims only the three the range added.

**Scope.** `CLAUDE.md`, `README-hooks.md`.
