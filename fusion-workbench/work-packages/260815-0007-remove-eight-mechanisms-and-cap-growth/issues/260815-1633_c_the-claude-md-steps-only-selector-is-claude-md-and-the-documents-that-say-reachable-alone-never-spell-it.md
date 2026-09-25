The `CLAUDE.md` step's `--only` selector is `claude-md`, and the two documents that call it reachable-alone never spell it

---

P-12 gave `/fusion:cleanup` a step selector whose vocabulary is fixed at
`skills/cleanup/SKILL.md:44-52`. Two of the three demoted skills spell their selector in their own
`description`; the third, `curate`, does not — and its selector is the one that differs from its
skill name. `CLAUDE.md:21` tells the reader all three are reachable "as `/fusion:cleanup --only
<step>`" without giving the substitution.

---

## Context

The vocabulary (`skills/cleanup/SKILL.md`, the `## Arguments` table):

| Name | Step |
|---|---|
| `archive` | Step 4 |
| `claude-md` | Step 5 |
| `log-activity` | Step 6 |

Where each is spelled:

- `skills/archive/SKILL.md:2` — "reachable alone as `/fusion:cleanup --only archive`". Matches the
  skill name.
- `skills/log-activity/SKILL.md:2` — "reachable alone as `/fusion:cleanup --only log-activity`".
  Matches the skill name.
- `skills/curate/SKILL.md:2` — "The `CLAUDE.md` step of /fusion:cleanup". **No selector given**, and
  the selector is `claude-md`, not `curate`.

`CLAUDE.md:21` names all three as "`/fusion:archive` (Step 4), `/fusion:curate` (Step 5, the
`CLAUDE.md` gate) and `/fusion:log-activity` (Step 6), each reachable alone as `/fusion:cleanup
--only <step>`". A reader who substitutes the skill name — which works for two of the three — types
`--only curate`, and `skills/cleanup/SKILL.md:53` requires exactly that to be rejected: "A name the
table does not carry is an error: say which name and list the valid ones."

The selector is spelled correctly in `README-agents.md:246` and `skills/help/SKILL.md:76`. It is the
two surfaces that make the reachable-alone *claim* that omit it.

## Suggested direction

Add `(reachable alone as `/fusion:cleanup --only claude-md`)` to `skills/curate/SKILL.md`'s
description, matching its two siblings, and spell the three selectors in `CLAUDE.md:21` rather than
writing `<step>`. The error path at `:53` is good behaviour and should stay; it just should not be
the first place a reader learns the name.

---

**Reconciliation 260819-1453 (reconciler, Domain `code`, Circle-store pass) — CLOSED. Both surfaces now spell the substitution, and a third states the trap.**

```
skills/curate/SKILL.md:2
  description: The CLAUDE.md step of /fusion:cleanup (reachable alone as
  `/fusion:cleanup --only claude-md`), kept as its own body rather than a command. …

CLAUDE.md:21
  … each reachable alone as `/fusion:cleanup --only archive`, `--only claude-md` and
  `--only log-activity`. **Two of those three selectors are the body's own name and one is
  not** — the `CLAUDE.md` step's selector is `claude-md`, and `--only curate` is rejected by
  the selector's error path.
```

The defect was that a reader told a body is "reachable alone" would derive the selector from the body's own name, which for this one body is wrong. Both surfaces now write the selector literally, and `CLAUDE.md:21` goes further than the record asked: it names the asymmetry as an asymmetry and says what happens to the wrong guess. A reader can no longer arrive at `--only curate` by the derivation the record identified.

---
Resolved: `skills/curate/SKILL.md:2` and `CLAUDE.md:21` now spell `--only claude-md` literally rather than leaving it to be derived from the body's name, and `CLAUDE.md:21` additionally records that `--only curate` is rejected by the selector's error path. Landed in `3a0408a`.
