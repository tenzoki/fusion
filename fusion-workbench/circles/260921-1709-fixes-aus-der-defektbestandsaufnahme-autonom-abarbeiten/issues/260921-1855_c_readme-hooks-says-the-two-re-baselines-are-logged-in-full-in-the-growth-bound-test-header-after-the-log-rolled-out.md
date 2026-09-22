`README-hooks.md` says the two re-baselines are logged in full in the growth-bound test's header, and since the roll-out they are not
---
`README-hooks.md` `### Growth bounds on the shipped text`, the paragraph opening **One cleanup and one merge.**, states that the 2026-08-17 cleanup re-baseline and the 2026-09-05 merge re-baseline "are both logged in full, with their per-surface figures and what each absolved, in the header of `hooks/lib/__tests__/surface-growth-bound.test.ts`"; the paragraph before it, **Three armings.**, states that each arming "reproduces, as text in the file it armed, what its re-baseline let through". Step 17 of `260921-1726_*_the-33-open-defects-of-the-11-9-1-survey-worked-autonomously-as-one-package.md` rolled those three sections out of that header into `260921-1855-surface-growth-bound-arming-and-re-baseline-log-2026-08-15-to-2026-09-05.md`, leaving a six-line pointer in the test. Both sentences now send a reader to a header that carries the pointer and not the log.
---
**Filed by:** coder, Kai Stalmann <ks@qantr.com>

Evidence: `grep -n 'logged in full\|reproduces, as text in the file it armed' README-hooks.md` prints the two sentences; `grep -c '## The cleanup re-baseline' hooks/lib/__tests__/surface-growth-bound.test.ts` prints `0`.

Not fixed in step 17 because `README-hooks.md` is outside that step's file list, and the step's own citation grep (over the three section headings) could not see a pointer written as a description rather than a heading.

Acceptance: both sentences name the rolled record (by its markerless basename) as where the log is read, or are cut; `grep -n 'in the header of `hooks/lib/__tests__/surface-growth-bound.test.ts`' README-hooks.md` prints nothing for the re-baseline sentence; `cd hooks && npm test` exits 0.
---
Resolved: the commit that carries this line rewrites both README sentences: the armings paragraph now names the two rolled records (`260922-0939-rules-emission-golden-cut-log-and-retired-core-bound-argument-2026-08-05-to-2026-09-11.md`, `260921-1855-surface-growth-bound-arming-and-re-baseline-log-2026-08-15-to-2026-09-05.md`) and says the third arming stays as text in `hooks/lib/__tests__/rules-emission-golden.test.ts`; the re-baseline paragraph names the second record as where the log is read, with the test header as what points at it. Of the two acceptance routes the record offers (name the record, or cut the sentences), the first was taken: the sentences carry the pointer a reader needs.
