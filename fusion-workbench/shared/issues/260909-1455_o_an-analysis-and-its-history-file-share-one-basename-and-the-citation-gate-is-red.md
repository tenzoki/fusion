# An analysis and its history file share one basename, and the citation gate is red

---
Two live artifacts carry the basename `260909-1345-verification-of-the-size-versus-bookkeeping-analysis.md`,
one in the shared analyses store and one in the shared history store. The storeless citation form
resolves by one workbench-wide basename lookup, so that token now resolves to two files, and
`hooks/lib/__tests__/workbench-citation-lint.test.ts:306` fails on it.

---
**Filed by:** consultant, Kai Stalmann <ks@qantr.com>

## Evidence

Both files are untracked at HEAD `17845b95`, written 13:51 by the same pass. Reproduce with
`npx vitest run lib/__tests__/workbench-citation-lint.test.ts` from `hooks/`: 12 tests pass and
the collision assertion fails, naming the pair. The gate recomputes its corpus from the tree on
every run and carries no approvable baseline, so it stays red for everyone until a name moves.

Six live citations of that basename already exist: five `Verified in` lines in the sibling
issue records `260909-1345_*_the-size-analysis-understates-the-always-on-peak-and-the-august-cut.md`,
`260909-1346_*_the-rule-growth-bound-covers-the-core-while-the-hottest-path-grew-29-percent-back.md`,
`260909-1347_*_the-eightfold-bookkeeping-rise-excludes-337-legacy-stamped-records-from-the-two-anchor-months.md`,
`260909-1348_*_recommendation-7-names-an-archive-confirmation-the-cleanup-pipeline-does-not-put.md` and
`260909-1349_*_finding-17s-setup-pointer-claims-name-the-wrong-agents.md`, plus one in the history
file itself. Each intends the analysis, so whichever file is renamed, those six are read against
the surviving name before the rename lands.

## Acceptance

`npx vitest run lib/__tests__/workbench-citation-lint.test.ts` passes, with the two artifacts
carrying distinct basenames and any citation of either resolving to one file.
