The first-add pass reads every file the rename pass just moved as untracked
---
`/fusion:migrate` renames a v11 workbench's stores with `git mv` (Step 4) and leaves the renames staged; Step 7 then runs `bin/fusion-migrate` in the same invocation. `firstAdds` (`hooks/migrate.ts`) reads only committed history (`git log --reverse -M --diff-filter=AR`), so every path the rename pass moved is in no commit, and each missing filer's person half becomes `{rule: "unknown", evidence: "untracked"}`. The file is tracked (it is in the index), and its first add is in history under the old path, so the evidence is false and the person half is lost wherever a v11 workbench migrates in one session.
---
**Filed by:** code-implementer, Kai Stalmann <ks@qantr.com>

**Evidence.** The seventh install case (`codec/src/__tests__/install.test.ts`, the v11 twin), at step 12e of `261001-1804_*_plan-fj04-the-migration-of-a-legacy-workbench-proven-on-copies.md`: the twin commits the v11 fixture as `Install Test <install-test@example.invalid>`, runs the shipped rename block, and migrates without committing. `bin/fusion-record show` of the closure plan gives `filed_by {actor: "legacy-unknown", person: null}` with `derived["/filed_by/person"] = {rule: "unknown", evidence: "untracked"}`. Step 12e's acceptance expected either that commit's author or `no-repository`. The case asserts the observed value, so the fix moves it.

**Acceptance.** On a repository whose last commit holds a v11 workbench and whose index holds the rename pass's staged `git mv`, `survey` names the committing author as `git-first-add` for a file whose filer is missing, with that commit as evidence; a file that is untracked in the index stays `untracked`. The seventh install case then asserts the twin's fixture author.
