`rules/protected-path-discipline.md` enumerates the shipped protected list and now omits `.claude/rules/**`

---

`rules/protected-path-discipline.md:11` reads:

> `guard.protectedPaths` in `hooks/config.json` is the list — `agents/**`, `rules/**`, `skills/**`, `hooks/config.json`, `hooks/hooks.json`, `settings.json`, `bin/monitor` and `.claude-plugin/plugin.json` — and it is the plugin's **default**, not the answer for a given project.

The phrasing is exhaustive ("is the list", eight entries joined by "and"), and as of task 8 of the current queue the shipped list has nine entries: `.claude/rules/**` was added to `hooks/config.json` alongside `rules/**`, closing `shared/issues/260801-1020_*_guard-protects-rules-but-not-claude-rules.md`.

**Failure scenario:** the rule is loaded into all sixteen agents at Setup. An agent that reads it as the enumeration it claims to be concludes `.claude/rules/CODING-HYGIENE.md` is unprotected, writes it, and meets a halt the rule told it could not happen there. `rules/protected-path-discipline.md:5` is explicit that the text exists so an agent never meets an unexplained revert and works around it; an incomplete list is exactly that failure with the rule as its source.

The same paragraph's second half — the `fusion-guard.json` merge, the declared-empty-list narrowing, the self-protection floor — is unaffected and stays as written.

Not fixed inside task 8 by construction. The queue's scope note (`fusion-workbench/tasklist.md`, "None is a duplicate of another") states that `rules/protected-path-discipline.md` is cited by tasks 1 and 7 but edited by none of the ten, and that a task whose implementation makes a statement in that file false files a new finding rather than absorbing it. This is that finding.

One adjacent enumeration was checked and is **not** affected: `README-hooks.md:260` names four of the entries inside an argument about which paths are the work in fusion's own repository. It already omitted four and reads as illustrative rather than exhaustive, so it stays correct.

Filed by: coder, while implementing task 8 (`I:260801-1020-claude-rules`).
