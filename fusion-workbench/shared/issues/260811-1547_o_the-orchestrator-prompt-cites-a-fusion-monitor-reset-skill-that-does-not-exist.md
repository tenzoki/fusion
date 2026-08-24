# The orchestrator prompt cites a `/fusion:monitor-reset` skill that does not exist

---

**Severity:** Low — a dangling citation in a prompt paragraph, arguing for a real behaviour with a non-existent witness
**Domain:** code
**Filed by:** coder (task 21, while writing decision `260811-1534` and citing the same claim)
**Affects:** `agents/orchestrator.md:192`
**Cross-references:**
`hooks/lib/__tests__/reference-resolution-lint.test.ts` (the gate that would catch this, if it read this citation form);
`shared/decisions/260811-1534_*_does-the-guard-event-log-get-an-upper-bound-and-what-happens-to-the-evidence-in-it.md` (this record's first downstream reader — the claim was copied into a decision record before being checked)

---

## What is wrong

`agents/orchestrator.md:192` reads:

> `fusion-workbench/orchestrator-events.jsonl` is append-only across all sessions. The Phase 4
> sequence-diagram generator reads it cross-session for historical context, and
> `/fusion:monitor-reset` archives it rather than deleting in place.

There is no `monitor-reset` skill. `ls skills/` gives sixteen directories — `archive`,
`cadence`, `circle-pop`, `circle-stash`, `cleanup`, `commit`, `direct`, `help`,
`log-activity`, `memo`, `migrate`, `next`, `revise-claude-md`, `seed-from-plane`, `setup`,
`unlock` — and `CLAUDE.md` names that same set as authoritative. `grep -rn "monitor-reset"`
across `skills/`, `agents/`, `rules/`, `bin/` and `README*.md` returns this one line and
nothing else: it is not a skill whose directory went missing, it is a name with no referent
anywhere in the tree.

## Why it matters more than a broken link

The sentence is not decoration. It is the *reason* given for the instruction beside it —
never truncate the event log, use touch-or-append and not `>`. An agent reading it takes
"something already archives this file" as established, and the instruction's justification
rests on a mechanism that does not exist. That is exactly how the claim propagated: it was
cited a second time, in a decision record about a different append-only log, before anybody
checked whether the skill was real.

## Why the lint did not catch it

`reference-resolution-lint.test.ts` resolves **path-shaped** citations —
`(?:rules|agents|skills|docs|hooks|bin|templates|stilwerk)/…` — against the tree. A
`/fusion:<name>` slash-command reference is a different citation form and no gate reads it,
although the set it must resolve against is as mechanically derivable as any the lint already
checks: one directory under `skills/` carrying a `SKILL.md`.

## Suggested direction

Two separable pieces, and the first does not depend on the second.

1. Correct `agents/orchestrator.md:192`. Either name the mechanism that really does archive
   the log, or state plainly that nothing does and let the append-only instruction stand on
   its own — it does not need a second reason.
2. Extend `reference-resolution-lint.test.ts` to resolve `/fusion:<name>` against
   `skills/*/SKILL.md`, in `agents/*.md`, `skills/*/SKILL.md`, `rules/*.md` and the READMEs.
   Built-in Claude Code commands are not in that namespace, so the rule has no exceptions to
   carve.

## Acceptance criteria

- [ ] `grep -rn 'monitor-reset' agents/ skills/ rules/ bin/ docs/ README*.md` returns nothing,
      or returns only a line that names it as a mechanism that does not exist.
- [ ] Every `/fusion:<name>` occurrence in the shipped prompts resolves to a directory under
      `skills/` holding a `SKILL.md`, checked by a test rather than by hand.

---
**Reconciliation 260817-1836** (reconciler, domain `code`). Re-verified reproducible at HEAD `2552586`: `agents/orchestrator.md:209` still cites `/fusion:monitor-reset`, and `ls skills/` returns twelve directories, none of them that one. The reference lint still resolves only path-shaped citations, not slash-command names. Marker stays open. Log: `shared/history/260817-1836-reconciliation.md`.

---
**Correction appended 260824** (ontocoder, plan step 5 of `circles/260824-1853-close-every-open-defect/planning/260824-1905_*_plan-close-every-open-defect.md`). The sentence under `## Suggested direction` item 2, "Built-in Claude
Code commands are not in that namespace, so the rule has no exceptions to carve", is retracted. One
exception exists in a shipped skill body: `skills/setup/SKILL.md` names the retired
`/fusion:migrate-workbench-v2` to explain why `.migration-v2-backup/` is on an exclusion list (at
`:49` when the exception was found on 260811, at `:60` at the 260817 reconciliation). The proposed
lint was never built, and acceptance criterion 2 as written fails against the tree; a lint would need
the line-level exemption its sibling `commit-message-path.test.ts` uses for a line that marks its
reference as retired or absent. Filed as
`shared/issues/260811-1617_*_record-260811-1547-states-its-proposed-lint-has-no-exceptions-and-a-shipped-skill-already-is-one.md`.
