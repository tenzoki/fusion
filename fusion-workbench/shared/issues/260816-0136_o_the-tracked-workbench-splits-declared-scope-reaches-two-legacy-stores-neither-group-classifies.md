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
