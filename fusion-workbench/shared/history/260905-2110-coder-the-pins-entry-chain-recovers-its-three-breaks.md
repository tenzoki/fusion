# The reference-resolution pin's entry chain recovers its three breaks

**Status:** Complete
**Filed by:** coder, Kai Stalmann <ks@qantr.com>
**Agent:** coder
**Date:** 2026-09-05 21:10
**Task:** Repair the uncovered gap in the `BASELINE` entry chain of
`hooks/lib/__tests__/reference-resolution-lint.test.ts`, filed as issue
`260904-2215_*_the-reference-resolution-pins-entry-chain-has-an-uncovered-gap-between-1336-and-1517.md`.

## What the walk found

The record's headline figure — one uncovered gap of 181 paths between 1336 and 1517 — is
wrong, and the reconciliation pass appended to it on 260905-2015 corrected it in place.
**My own walk agrees with the correction exactly**, arrived at independently before I read
its per-break figures against mine: three breaks on line 491, totalling 35 paths.

- 1466 against 1464 — 2
- 1462 against 1431 — 31
- 1376 against 1374 — 2

The method is the correction's: walk the entries newest-first and require each entry's
opening figure to equal the next one's closing figure. Every other adjacency on that line
holds exactly, the two entries that record a *decrease* included (`1462 -> 1460`, the style
diet; `1478 -> 1477`, the UX round), which is why a numeric sort of the chain reads worse
than the chain does. The chain's tail opens at 1336 and meets line 482's `1325 -> 1336`,
so the 181 the record named was never a gap in the chain — only in a line-by-line reading
of a comment whose middle line carries twenty-five entries.

## What each break was, and the commit it is attributed to

Recovered by walking `git log` over the test file and reading the `BASELINE` triple out of
each revision, which gives the number's commit-by-commit history; each break is then the
stretch between two chain entries that the commits cross.

**Break of 2 at 1374/1376 — commit `e4f789ed`** (2026-08-25, `docs(claude-md): three claims
the tree contradicts come out`). The one break whose commit wrote **no entry at all**: it
re-approved the number to 1376 while the trailing comment still opened at `1357 -> 1374`.
Its commit message states the transition and the unmoved anchors in prose. A token-multiset
comparison of `CLAUDE.md` across the commit confirms it and names the two paths, each a
second occurrence of a token already in the file: `skills/archive/SKILL.md` in the
`bin/fusion-source-root` Layout row and `skills/help/SKILL.md` in the `docs/` row.

**Break of 31 at 1431/1462 — six commits of 2026-08-27**, the bookkeeping-cost repair. The
chain already carried the seventh, the "six times across one session" summary entry, which
delegated the per-step notes to git history and gave no figures of its own. Each of the six
wrote a full re-approval note at the time; the notes were recovered and their transitions
written into the chain:

| Commit | Transition | Anchors |
|---|---|---|
| `67f7782a` v10.8.0, the machine-written event rows | 1431 -> 1447 | 197 -> 199 |
| `cc070d92` v10.8.1, SubagentStop completion + cadence anchor | 1447 -> 1456 | unmoved |
| `15847b73` the curator's anchored evidence pass | 1456 -> 1458 | 199 -> 201 |
| `ce4175c2` live-scope inventory + incremental activity log | 1458 -> 1461 | unmoved |
| `8ac9a533` critical-stance §5 + the 260827-0830 audience gate | 1461 -> 1463 | unmoved |
| `49a42e23` the archive gate goes conditional | 1463 -> 1461 | unmoved |
| `9c056b6c` gate 260827-0910 (the summary entry itself) | 1461 -> 1462 | 201 -> 204 |

**Break of 2 at 1464/1466 — commit `265a86fb`** (conventions partition round 1). Its own
note acknowledged the +2 in its parenthetical ("+2 more when CLAUDE.md gained the two new
rule-file Layout rows") and never wrote it as a transition, which is precisely what left
the chain reading 1466 against 1464. Confirmed by a token-multiset comparison of `CLAUDE.md`
alone across that commit: exactly +2, `rules/project-language.md` and `rules/backlog-entries.md`.

## What was written

Eight recovered entries, plus the transition figures restored to the six-times summary
entry, all appended into the existing single-line chain on line 491 — **net zero lines**
(`git diff --numstat` reads `1 1`), which is the unit the hook-test growth bound measures.
No rolled log was needed. Each recovered entry is marked `recovered 2026-09-05` and names
the commit it came from, so a reader can tell a recovery from a note written at the time.

A preface now opens the line: it states the audit, the method, the corrected figure, and the
two properties an auditor needs before counting positions — that the entries are not in
chronological order with each other and that the chain uses several connector spellings
(`Previous: `, `Earlier: `, `Earlier (`, `Earlier, same day`). Both were confirmed and both
were deliberately **preserved rather than tidied**; the preface says explicitly that no entry
carries an ordinal and that none should be given one.

The `BASELINE` numbers were not touched.

## Verification

`cd hooks && npx vitest run lib/__tests__/reference-resolution-lint.test.ts lib/__tests__/surface-growth-bound.test.ts`
— **exit 1**, 2 failed / 48 passed.

Neither failure is this task's, and that was measured rather than argued. With this file
alone restored to HEAD (`git checkout HEAD -- <this one path>`, no whole-tree command) and
everything else of the working tree left standing, the gate reads the same `paths: 1624,
anchors: 225` against the pinned 1622/224 — so the +2/+1 belongs entirely to the four
sibling coders' in-flight edits to `rules/agent-setup.md`, `skills/cadence/SKILL.md` and
`skills/setup/SKILL.md`. The file was then restored from a scratch copy and confirmed
byte-identical. The `skills` surface-growth failure names those same two skill bodies.

This edit cannot move either gate by construction: `surface()` enumerates files with
`statSync(abs).isFile()` and never descends into `hooks/lib/__tests__/`, which the chain's
own entries state twice.

## Files changed

- `/Users/k1/Projects/productive/fusion/hooks/lib/__tests__/reference-resolution-lint.test.ts`
