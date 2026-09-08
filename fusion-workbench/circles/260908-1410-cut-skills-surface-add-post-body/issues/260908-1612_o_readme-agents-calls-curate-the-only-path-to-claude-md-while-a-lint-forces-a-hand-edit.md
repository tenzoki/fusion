README-agents calls curate the only path to CLAUDE.md while a lint forces a hand edit

---

`README-agents.md`'s `/fusion:curate` row states that the skill is "the only path to `CLAUDE.md`". A shipped gate contradicts it: `hooks/lib/__tests__/derivable-enumerations-lint.test.ts` fails the suite the moment a new `skills/<name>/` directory exists without a `/fusion:<name>` token in `CLAUDE.md`, and that token has to land in the same commit as the directory. The curator's survey-and-gate pass cannot supply it, because the curator proposes from the project's recorded history and a lint obligation is not history.

---
**Filed by:** planner, Kai Stalmann <ks@qantr.com>

**Evidence.** The claim is at `README-agents.md`, the `/fusion:curate` row of the skill table under `### skills/ — one file per slash command`. The gate is the `claudeMdDrift` block of `hooks/lib/__tests__/derivable-enumerations-lint.test.ts`, whose failure text is `skills/<name>/ exists but CLAUDE.md never mentions /fusion:<name>`. The practice already departs from the claim: commit `5c240eb7` added `/fusion:news` to `CLAUDE.md` by hand in the same commit as `skills/news/`, and `git log --oneline -- CLAUDE.md` shows several further non-curator commits.

**Origin.** Surfaced while planning `260908-1612_*_cut-the-skills-surface-and-add-the-post-step-body.md`, whose step 11 performs exactly the hand edit the claim forbids, for `/fusion:post`.

**Acceptance test.** The `/fusion:curate` row states what curate is actually the only path to, so that a reader deciding whether a same-commit `CLAUDE.md` token needs a gate gets the right answer from the row alone. Either the claim is qualified (the only path to a *reconciliation* of the file), or the exception is named beside it.
