`rules/protected-path-discipline.md` enumerates the shipped protected list and now omits `.claude/rules/**`

---

`rules/protected-path-discipline.md:11` reads:

> `guard.protectedPaths` in `hooks/config.json` is the list — `agents/**`, `rules/**`, `skills/**`, `hooks/config.json`, `hooks/hooks.json`, `settings.json`, `bin/monitor` and `.claude-plugin/plugin.json` — and it is the plugin's **default**, not the answer for a given project.

The phrasing is exhaustive ("is the list", eight entries joined by "and"), and as of task 8 of the current queue the shipped list has nine entries: `.claude/rules/**` was added to `hooks/config.json` alongside `rules/**`, closing `260801-1020_*_guard-protects-rules-but-not-claude-rules.md`.

**Failure scenario:** the rule is loaded into all sixteen agents at Setup. An agent that reads it as the enumeration it claims to be concludes `.claude/rules/CODING-HYGIENE.md` is unprotected, writes it, and meets a halt the rule told it could not happen there. `rules/protected-path-discipline.md:5` is explicit that the text exists so an agent never meets an unexplained revert and works around it; an incomplete list is exactly that failure with the rule as its source.

The same paragraph's second half — the `fusion-guard.json` merge, the declared-empty-list narrowing, the self-protection floor — is unaffected and stays as written.

Not fixed inside task 8 by construction. The queue's scope note (`fusion-workbench/tasklist.md`, "None is a duplicate of another") states that `rules/protected-path-discipline.md` is cited by tasks 1 and 7 but edited by none of the ten, and that a task whose implementation makes a statement in that file false files a new finding rather than absorbing it. This is that finding.

One adjacent enumeration was checked and is **not** affected: `README-hooks.md:260` names four of the entries inside an argument about which paths are the work in fusion's own repository. It already omitted four and reads as illustrative rather than exhaustive, so it stays correct.

Filed by: coder, while implementing task 8 (`I:260801-1020-claude-rules`).

---
Resolved: 2026-08-09 — `rules/protected-path-discipline.md:11` now reads
`agents/**`, `rules/**`, `.claude/rules/**`, `hooks/config.json`, `hooks/hooks.json`,
`settings.json`, `bin/monitor` and `.claude-plugin/plugin.json`, which is the shipped list in
`hooks/config.json` exactly.

Two changes met here, and the record's failure scenario was live for both:
- the omission this record filed — `.claude/rules/**`, added to the shipped list by task 8 — is
  added to the enumeration;
- `skills/**` is REMOVED from both, by the user's decision that skill files are theirs to edit.
  Had the enumeration been left alone, it would have run the same failure in the opposite
  direction: an agent reading it would have believed a skill file was protected and refused a
  write the guard now allows.

The enumeration stays an enumeration. It was not replaced with a pointer at
`hooks/config.json`, because an agent reading the rule at Setup has no reason to open the
plugin's configuration and the whole point of the sentence is that it can be read where it
stands. That keeps the drift risk this record found: the two lists are pinned to each other by
`hooks/lib/__tests__/config.test.ts` on the config side only, and nothing executable compares
the rule's prose against either. A third change to the shipped list will need this paragraph
edited by hand, exactly as this one did.

`README-hooks.md:260`, checked and cleared as illustrative when this record was filed, was
edited anyway: it named `skills/**` among the paths that are "the work" in fusion's own
repository, and that had become false.
