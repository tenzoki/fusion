/fusion:migrate Step 6's yes-branch flows into Step 7 before the sweep's rewrites are committed, so "its own commit" cannot hold
---
After a yes, Step 6 runs the sweep's write, says "the record content it wrote is committed as its own commit", and goes on to Step 7 in the same run. Step 7's JSON migration then rewrites live narratives over the uncommitted sweep edits, often the same files. Nothing stops for the commit, and `bin/fusion-migrate run` does not check for a dirty tree. Before 13.1.2 this sequence was unreachable in git mode, since the write was always refused; the fix makes it the normal re-run path on a Markdown-controlled workbench.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** `261009-1833-migrate-names-a-four-commit-split-but-gives-no-path-lists-so-staging-it-needs-a-generated-list.md`, `261015-1310-reviewer-closing-pass-over-the-migrate-step-6-package.md`

**Evidence.**

- `skills/migrate/SKILL.md` `## Step 6 — Sweep the citations`, the `EXIT=5` rewrites-above-zero bullet: "On a yes run … report its summary and say the record content it wrote is committed as its own commit", then the closing paragraph: "Then go to Step 7."
- `skills/migrate/SKILL.md` `## Guardrails`: "No `git add`, no `git commit`." So the skill cannot make the commit itself, and the user is not asked to.
- `hooks/migrate.ts`: no porcelain or dirty-tree check (`grep -n 'porcelain\|dirty' hooks/migrate.ts` finds nothing); `run`'s preconditions in `bin/fusion-migrate`'s header name none.
- The consequence, already seen once: `261009-1833-…`'s evidence says the six citation-repair files of a trial run "sat inside the 192 modified ones and had to be separated by hand".
- inference, not executed: where the sweep and the migration touch the same live narrative, the two changes land in one working-tree diff and no later split recovers "its own commit".

**Fix direction.** After a yes in Step 6, in `MODE=git`, stop the run the way Step 5 does: commit the sweep's rewrites, then run `/fusion:migrate` again, and the re-run (census zero) reaches Step 7. Or ask in Step 7, before the migrate question, for a clean tree.

**Acceptance.** No path through Steps 6 and 7 as written runs `fusion-migrate run` over uncommitted sweep rewrites in a tracked workbench, and a text or block assertion in `hooks/lib/__tests__/store-name-migration.test.ts` pins the stop.
