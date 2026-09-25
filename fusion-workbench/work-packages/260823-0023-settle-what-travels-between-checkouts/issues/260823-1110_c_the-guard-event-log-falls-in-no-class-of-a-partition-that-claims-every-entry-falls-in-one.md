The guard event log falls in no class of a partition that claims every entry falls in exactly one

---

**Severity:** Medium. The tiling property is the rule's own headline claim and step 1's acceptance criterion depends on it.
**Domain:** code
**Filed by:** coderev, reviewing C2 Turn 1
**Affects:** `rules/workbench-tracking.md:17`, `:24`, `:32`
**Cross-references:** plan step 1 in `260823-0800_*_c2-what-travels-between-checkouts-is-settled.md`; `.gitignore:70`

---

## What is wrong

`rules/workbench-tracking.md:17` states the property the partition is built on:

> **Every entry falls in exactly one class, and no entry falls in none.**

`.guard-state/events.jsonl` falls in none of the four. The class L row at `:24` names ".guard-state/ apart from its event log", excluding it explicitly, and no R row names it. The prose at `:30` calls it "a **record**", which is the vocabulary of the two-group split this rewrite replaced, and `:32` says the archive roll puts the rolled copies in R1 while the live file may stay in L, closing with "That is the one entry where the classification is split across two classes".

So the file's own text names an exception to its own headline claim, three lines after using a retired class name for the entry that is the exception.

The plan's step 1 acceptance is "a reader can name the class of any entry in the layout tree from this file alone". For `.guard-state/events.jsonl` a reader gets "record", which is not one of the four names, and then a sentence saying it is in two.

`.gitignore:70` carries the same retired word for the same file: "The guard's own event log (.guard-state/events.jsonl) is a record too".

## Why this is worth correcting rather than accepting

The rewrite's value is that a new root-anchored surface has one question to answer and four possible answers. An entry that answers "record", plus a paragraph, teaches the next author that the four classes are advisory. And the substance is settled already: the live file behaves exactly like class L, the rolled archive copies exactly like class R1. Nothing about the behaviour is in doubt; only the naming is.

## Verified

Read at HEAD `2f1e3a6`. The remaining fifteen layout-tree entries plus the two frozen stores each appear in exactly one row: `circles/`, `shared/`, `archive/`, `stilwerk/`, `stashes/`, `.migration-v2-backup/` in R1; `orchestrator-events.jsonl` in R2; `.fusion-setup`, `.asset-provenance` in R3; `agentstate.yaml`, `orchestrator-live.md`, `.session-marker`, `.active-circle`, `.commit-lock/`, `monitor`, `portfolio.md` in L. The tiling holds for every entry except this one.

## Direction, not a prescription

Say it in the classes the file defines: the live `.guard-state/events.jsonl` is class L, its rolled copies under `archive/` are class R1 like every other archived file, and that is one entry classified in one class with its evidence preserved by a mechanism rather than by tracking. Then either the headline claim needs no exception, or the exception is stated in the four-class vocabulary instead of the retired one. Correct `.gitignore:70` in the same pass.

---

Resolved: 2026-08-23 by coder. The partition was fixed and the headline claim left alone, which is
what the record asked for.

Class L's row now reads "`.guard-state/` in full, its event log included" rather than "apart from
its event log", so no entry of the layout tree falls outside the four classes. The paragraph on that
directory keeps its methodological point — the directory is the wrong unit to classify BY — and now
states the outcome plainly: each file in it is asked separately and every answer comes back class L,
for reasons that differ. The closing "it is a **record**" is gone; the log is class L, and what a
past version of it answers is preserved by a mechanism rather than by tracking.

The archive paragraph's exception is gone too, and nothing replaced it, because there was never an
entry in two classes. The live log and its rolled copies sit under two DIFFERENT entries of the
layout tree — `.guard-state/`, class L, and `archive/`, class R1 — so the roll moves bytes from one
entry to the other and each entry still falls in exactly one class. "That is the one entry where the
classification is split across two classes" was the sentence that falsified the tiling; it is
replaced by that reasoning.

`.gitignore:70` was corrected in the same pass and is recorded in the closure of
`260823-1110_*_the-gitignore-comment-still-describes-the-two-group-split-its-authoring-home-replaced.md`.

**One residual, stated rather than left to be found.** `CLAUDE.md`'s Layout row for this rule file
says it states "why `.guard-state/` is classified per file rather than per directory". That is still
true of the file — the unit of classification is the file, and the answers happen to be uniform —
which is why the wording was kept per file rather than collapsed to a directory-level claim. No
`CLAUDE.md` edit is needed and none was made.

**Measured.** `rules/workbench-tracking.md` is emitted to no agent (`bin/fusion-rules` names it
nowhere), so it stands on no bounded surface; the always-on core is unaffected by this edit and the
`rules-emission.golden` shows no movement for it.

**Files:** `rules/workbench-tracking.md`, `.gitignore`. Uncommitted at the time of writing; the
orchestrator commits.
