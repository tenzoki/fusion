The tracked-workbench split declares a scope that reaches two legacy stores, and neither of its groups classifies them

---
`0a514e6` rewrote `rules/fusion-workbench-conventions.md:74` to declare the tracked/untracked split's scope by exclusion: *"the split below ranges over **every root entry outside the artifact directories** (`circles/`, `shared/`, `archive/`, `stilwerk/`, which are simply tracked)"*, and the commit claims *"Membership matches scope with no overlap and no remainder."* Nine lines above, `:64` states that a workbench may carry two further root entries, `stashes/` and `.migration-v2-backup/`, deliberately absent from the tree. Those two are root entries, they are outside the four named directories, and neither the records bullet nor the live-state bullet names them. A project reading the section for its `.gitignore` gets no answer for the two directories the file has just told it it might have.

---

## The two readings, stated plainly

Measured against the **layout tree** at `:26-61`, the claim is exact: ten root entries outside the four artifact directories, four in the records bullet (`orchestrator-events.jsonl`, `.guard-state/events.jsonl`, `portfolio.md`, `.fusion-setup`), seven in the live bullet (`agentstate.yaml`, `orchestrator-live.md`, `.guard-state/` minus `events.jsonl`, `.commit-lock/`, `.session-marker`, `.active-circle`, `monitor`), with `.guard-state/` split across both by the rule at `:79`. Every tree entry is covered exactly once. That is what the commit measured, and it is right.

Measured against the **sentence**, it is not. The sentence says "every root entry", and `:64` is in the same section for the express purpose of saying that the tree is not the full set of root entries a workbench may hold. Two entries the file itself names fall in scope and out of membership.

Both edits are this session's: `0a514e6` wrote the scope, `f73dfe4` rewrote the legacy-store paragraph forty minutes later. Neither pass had reason to look at the other.

## Why it is worth closing rather than shrugging at

The section is one of the five always-on rules, read on every dispatch by every agent, and its stated job is to answer "does this get tracked". The two stores are exactly the entries where the answer is least obvious: they are frozen content, so "a past version answers nothing" reads as live state, while "written once, never rewritten" reads as a record. A consuming project that carries a `.migration-v2-backup/` from fusion v2.3–v2.5 has to guess.

## Part 2 — the one other place that enumerates this split disagrees with it

`.gitignore:67`, inside the block the rule points at (`:83`: *"This repository applies exactly that split; see its `.gitignore`"*):

```
# KEPT: orchestrator-events.jsonl, tasklist.md, portfolio.md.
```

Two faults. `tasklist.md` was removed on 2026-08-15 and is named nowhere in the layout tree. And `.fusion-setup`, which `0a514e6` added to the records group this session, is missing — though the file *is* tracked here (`git ls-files fusion-workbench/.fusion-setup` returns it), so the behaviour is right and only the comment is wrong. The `.guard-state/events.jsonl` exception is correctly explained in the lines below it and needs no change.

## Fix direction

1. `rules/fusion-workbench-conventions.md:74` — extend the exclusion to name the frozen stores, e.g. *"(`circles/`, `shared/`, `archive/`, `stilwerk/`, which are simply tracked, and any `stashes/` or `.migration-v2-backup/` a workbench still carries, which follow `archive/`)"*. That is one clause and it also answers the question a consumer would have asked.
2. `.gitignore:67` — drop `tasklist.md`, add `.fusion-setup`.

Both are small; the always-on rule surface has roughly 9 400 bytes of head-room, and clause 1 costs under 100.

**Found by:** coderev, reviewing `f4f01b0..3a0408a` (commits `0a514e6`, `f73dfe4`).

---
Resolved (part 1 only): `rules/fusion-workbench-conventions.md:74` now scopes the split to **every root entry outside the artifact and legacy stores** — `(circles/, shared/, archive/, stilwerk/ and the two above, all simply tracked)`. The deciding question was answered by classifying rather than by silence: a frozen store follows `archive/` and is simply tracked, so it is out of the split's scope by the same rule that puts the artifact directories out of it. Scope and membership now match with no remainder against both the tree and the sentence.

Part 2 (`.gitignore:67` — drop `tasklist.md`, add `.fusion-setup`) is NOT done: `.gitignore` was outside this pass's permitted file set. It remains open work and needs a follow-up.

---
**Reconciliation 260816-0713 (reconciler, HEAD `f77633f`) — the `_p_` marker is correct. Part 1 is
on disk, part 2 is not.**

- **Part 1, verified.** `rules/fusion-workbench-conventions.md:74` reads *"the split below ranges
  over **every root entry outside the artifact and legacy stores** (`circles/`, `shared/`,
  `archive/`, `stilwerk/` and the two above, all simply tracked)"*. Scope and membership match
  against both the tree at `:26-61` and the sentence itself, with no remainder.
- **Part 2, not done.** `.gitignore:67` still reads `# KEPT: orchestrator-events.jsonl, tasklist.md,
  portfolio.md.` — `tasklist.md` was removed on 2026-08-15 and `.fusion-setup` is still unnamed,
  though `git ls-files fusion-workbench/.fusion-setup` confirms the file is tracked, so the behaviour
  is right and only the comment is wrong.

**One thing the fix direction did not know.** `.gitignore:69`, two lines below the comment part 2
corrects, writes `/fusion:archive` where `rules/fusion-workbench-conventions.md:81` now reads "the
archive step of `/fusion:cleanup`". It is the residual of open record
`circles/260815-0007-remove-eight-mechanisms-and-cap-growth/issues/260815-1633_o_eight-shipped-surfaces-still-present-the-three-demoted-skill-names-as-user-commands.md`.
One pass over that comment block discharges both records' `.gitignore` halves; whoever takes part 2
should take it.

Also seen: 260816-0713 by coderev — the `d83c1b4` rewrite closes the scope gap (the two groups now tile the ten non-artifact root entries exactly), but the replacement clause "and the two above, all simply tracked" asserts that a tracked workbench tracks `stashes/` and `.migration-v2-backup/`. Nothing supports that and neither store exists in this repository, so the claim is untestable where it was written.

---
Resolved (part 2, and the appended `Also seen:` clause): closed at HEAD `433e206`+1 by session
`shared/history/260816-0804-orchestrator-session.md`.

- **`.gitignore:67`** — the KEPT line now reads `orchestrator-events.jsonl, portfolio.md,
  .fusion-setup.` `tasklist.md`, removed from fusion on 2026-08-15, is gone; `.fusion-setup` is
  named. Each of the three was checked rather than assumed: `git check-ignore` exits 1 for all
  three and `git ls-files --error-unmatch` returns all three. No ignore pattern changed — the
  behaviour was already right and only the comment was wrong, exactly as the fix direction said.
- **`.gitignore:69`** — `/fusion:archive` is replaced by "the archive step of `/fusion:cleanup`",
  matching `rules/fusion-workbench-conventions.md:81`. This is the `.gitignore` half of
  `circles/260815-0007-remove-eight-mechanisms-and-cap-growth/issues/260815-1633_o_*.md`, taken here
  because the reconciliation note on this record said one pass over the comment block discharges
  both. That record keeps its `_o_` marker and gains a line recording the discharge; its eight
  other surfaces stand.
- **`rules/fusion-workbench-conventions.md:74`** — the `Also seen:` objection is discharged. The
  parenthesis no longer asserts that a tracked workbench tracks the two legacy stores; it states the
  rule they follow: `(circles/, shared/, archive/, stilwerk/, all simply tracked, and any stashes/
  or .migration-v2-backup/ a workbench still carries, which follow archive/)`. That is the
  conditional shape this record's own fix direction proposed and the first implementation did not
  take. Scope and membership still tile the ten non-artifact root entries with no remainder against
  both the tree at `:26-61` and the sentence.

**Cost, stated rather than buried.** The clause is +80 bytes on an always-on rule file, so
`hooks/lib/__tests__/fixtures/rules-emission.golden` was regenerated by the one command its own
header prescribes at `rules-emission-golden.test.ts:170-182`. The diff is 30 insertions and 30
deletions in one hunk: `fusion-workbench-conventions.md 55104 → 55184` and each stanza's `total`,
in all 15 agent stanzas, and nothing else. `RULE_BASELINE` did not move, so the hard universal-core
growth bound is not weakened — head-room after the edit is 8 870 bytes of the 12 000-byte budget.

**One wrong turn, recorded because the reasoning is the reusable part.** The first implementation of
part 2 also put `.guard-state/events.jsonl` on the KEPT line, reading the records bullet at `:76` as
a tracking list. It is a classification list, and this file's own `:81` keeps the two apart: the
guard log is a record whose preservation comes from the archive roll, not from tracking the live
file. `git check-ignore -v` resolves it to `.gitignore:77`, and `git ls-files` shows nothing tracked
under `.guard-state/`, so the line would have claimed as kept a file the same file ignores, two
lines above the sentence saying so. Reverted before commit.

Verification: `cd hooks && npm test` — exit 0, 40 files, 764 tests. Run by the orchestrator
independently of the executor's own run.

---
**Reconciliation 260816-1345 (reconciler, HEAD `dd560ab`): the `_c_` marker is correct. All three
halves are on disk and were re-checked rather than read from the note above.**

- **Part 1.** `rules/fusion-workbench-conventions.md:74` reads the conditional form the record's own
  fix direction proposed: `(circles/, shared/, archive/, stilwerk/, all simply tracked, and any
  stashes/ or .migration-v2-backup/ a workbench still carries, which follow archive/)`. The
  `Also seen:` objection is discharged with it: the parenthesis no longer asserts that a tracked
  workbench tracks the two legacy stores.
- **Part 2.** `.gitignore:67` reads `# KEPT: orchestrator-events.jsonl, portfolio.md, .fusion-setup.`
  `tasklist.md` is gone and `.fusion-setup` is named. Re-verified independently: `git check-ignore`
  exits 1 for all three and `git ls-files --error-unmatch` returns all three, so the comment now
  describes the behaviour.
- **The borrowed half.** `.gitignore:69-70` reads "what preserves it is the archive step of
  `/fusion:cleanup`", matching `rules/fusion-workbench-conventions.md:81`. The record it belongs to,
  `circles/260815-0007-remove-eight-mechanisms-and-cap-growth/issues/260815-1633_o_*.md`, keeps its
  `_o_` marker and carries the discharge line.

One stale path in the record above: the 260815-1633 reconciliation note cites this file at its old
`_p_` name. Left as written, per open decision
`shared/decisions/260816-0119_o_can-anything-carry-the-rename-to-citation-obligation-when-a-record-marker-moves.md`.
