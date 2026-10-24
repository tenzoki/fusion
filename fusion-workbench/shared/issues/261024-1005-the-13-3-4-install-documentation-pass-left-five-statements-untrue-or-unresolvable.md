The 13.3.4 install documentation pass left five statements untrue or unresolvable
---
19810b74 corrected the install, update and release docs from analysis 261024-0606. Five statements in the texts it touched, or wrote, are still false or point at nothing; the 13.3.5 help sentence joins them.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** 261024-0606-do-the-documents-still-describe-how-fusion-is-installed-updated-run-and-released.md; commits 19810b74, 8280c372

1. **`install.sh` header, `FUSION_REF` line**: "Every release is tagged v<version>". False: `git tag -l` has no tag for v10.8.0 to v10.13.x, v10.15.0 to v10.19.0, or v11.8.1 (release commit 9c7101aa). `README.md` `## Install`, `Overrides:` was corrected for the v10 gap but omits v11.8.1. The analysis (W8) covered only `README.md`.
2. **`install.sh` launcher usage text**, `fusion --update   re-download the latest over HTTPS`. Every doc 19810b74 touched now says it re-installs the head of `main` (or the `FUSION_REF` in the caller's environment); the launcher's own `--help` still says "the latest".
3. **`README-hooks.md` `## Where to look when something breaks`**: the commit dropped "Problem 12" as dead, and the same table still ends three rows with "Problem 10.", "Problem 11." and "Problem 13.". `git grep 'Problem 1[0-3]'` outside the workbench finds only these three; none resolves. The analysis (S7) named all four.
4. **`README-agents.md` `## Releasing` step 4** cites "decision `260816-1707`" by bare stamp. Two decisions carry that stamp (`260816-1707_*_which-install-path-is-the-authoritative-one-for-end-users.md` and `260816-1707_*_to-whom-is-the-new-workbench-tracking-rule-emitted-when-its-consumers-are-a-human-and-a-skill.md`), and `rules/fusion-workbench-conventions.md` `## Filename Patterns` says a bare stamp is not a citation. The commit raised the reference-resolution lint's `stampBare` baseline 11 to 12 to admit it.
5. **`skills/help/SKILL.md` `### 4. Update`, 13.3.5 sentence**: "the named `rollback --end-fence` retry finishes the undo". Nothing is undone on that path: `endLeftFence` in `hooks/migrate.ts` settles the stored maintenance end and says "the codec refuses every later rollback of this migration", `result=json-control`. The store stays migrated.

**Acceptance.**
- `install.sh` names the tag gaps or drops "Every release is tagged"; `README.md` names v11.8.1 among the untagged releases, or states the gap without a list (`rules/critical-stance.md` §5).
- The launcher's `--update` usage line matches `README.md`'s `fusion --update` comment.
- No "Problem N." reference remains in `README-hooks.md`.
- `README-agents.md` step 4 cites the decision by its storeless basename, and the lint's `stampBare` returns to 11.
- The 13.3.5 help sentence says the retry ends the fence and settles the record, and that the store stays under JSON control. `cd hooks && npm test` and `bash -n install.sh` exit 0.
