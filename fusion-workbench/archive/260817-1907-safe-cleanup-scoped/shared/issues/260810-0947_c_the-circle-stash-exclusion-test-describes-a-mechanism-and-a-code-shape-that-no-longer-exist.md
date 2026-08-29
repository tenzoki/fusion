# The circle-stash exclusion test describes a mechanism and a code shape that no longer exist

---

**Severity:** Low — comments only; every assertion in the file is correct and passing
**Domain:** code
**Filed by:** orchestrator, from a finding the executor of task T6 reported outside its own scope (session `260810-0844-orchestrator-session.md`, Turn 2)
**Affects:** `hooks/lib/__tests__/circle-stash-git-exclusion.test.ts:176-177` and `:188`
**Cross-references:** commit `72b798e` (which corrected the same two claims in the skill body); `260810-0505_*_circle-stash-step-7-6-still-swallows-the-push-exit-code-the-branch-exists-to-avoid.md`

---

## The defect

Two comments in the test file state things that were true when it was written and are not
true now:

- `:176-177` says `git stash push <pathspec> --include-untracked` runs `git add --all`
  internally. It does not: with `--include-untracked` git runs a bare `git add -- <pathspec>`.
  The `-u` form is the one used *without* it, and that is the single case where the three
  spellings disagree — measured on an ignored workbench, `git add -n --all` exits 1, bare
  `git add -n` exits 1, `git add -n -u` exits 0. Commit `72b798e` corrected this wording at
  both places in `skills/circle-stash/SKILL.md` and left the test's copy of it standing.
- `:188` describes `|| true` swallowing the push exit code. That code no longer exists —
  `72b798e` replaced both terminators with a captured exit code and a failure branch.

## Why it is worth a record rather than a silent tidy

A test file is where a maintainer goes to learn what the code under test is supposed to do,
and both comments are load-bearing explanations rather than decoration. The `--all` one is
actively misleading in the one direction that matters: a maintainer reasoning from it would
conclude the probe's spelling is interchangeable with the real one, which is exactly the
inference the corrected wording exists to prevent.

The executor that found this was scoped to the skill body and correctly declined to widen
into the test file. This record is that decision's other half.

## Fix direction

Rewrite both comments against the code as it now stands, taking the wording from
`skills/circle-stash/SKILL.md` so the two do not drift apart again. No assertion changes.

While there: the file extracts the *first* bash block after its heading, which is what forced
step 7.6 to remain a single block during the `72b798e` work. That coupling is undocumented in
the test. A sentence naming it would save the next author the same discovery.

---
Resolved: 8796ade — both comments rewritten from the skill body as it now stands, with the measurement that git add -n -u is the one spelling that disagrees. The first-block extraction coupling is documented on extractBashBlock, which was discovered the hard way during 72b798e and written down nowhere. No assertion changed.
