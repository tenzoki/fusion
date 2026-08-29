# Four cardinal words still count items the removals deleted, and no gate reads a cardinal word

---

**Severity:** Medium
**Domain:** code
**Filed by:** `coderev`, review of `5d29b6d..518926d`, review file `260815-1501-coderev-turn-3-conceptrev-investigator-domain-values.md`
**Owner:** `coder`
**Affects:** `README-agents.md:185`, `skills/help/SKILL.md:103`, `bin/fusion-rules:408`, `bin/fusion-rules:437`
**Cross-references:** `260815-1403-coder-fold-investigator-into-analyst.md` (`## Judgements the step's file list did not pre-authorise` item 5, and `## What the twice-corrected step still missed`); `hooks/lib/__tests__/derivable-enumerations-lint.test.ts` `describe("enumeration lint: agent counts stated as closed numbers")`

---

Steps 7 and 8 deleted list items correctly and left the spelled-out number in front of each list saying how many there are. Three of the four are freshly false at HEAD; the fourth was already false and this Turn moved it further. The digit lint that exists for this class reads Arabic numerals in five named agent-count phrasings and nothing else, so none of the four is reachable by any gate.

---

**Verified 2026-08-15 at HEAD `518926d`.** `cd hooks && npm test` is green: 45 files, 831 tests.

## The four

**1. `README-agents.md:185` — "Two side loops", one bullet.**

```
Two side loops feed into the chain at any point (outside the orchestrator's scope):

- **reconciler** — periodically run between sessions …

## Plugin structure
```

The investigator bullet was the other loop. The executing coder recorded removing it (history file, judgement 5) and did not touch the word in front of it. Fix: `One side loop feeds into the chain …`, or restore a second entry if one is intended.

**2. `skills/help/SKILL.md:103` — "Three things to configure", two bullets.**

The third was *"**Investigator capture layout:** … copy `$FUSION_PLUGIN_ROOT/templates/investigator-capture-layout.md` …"*, correctly deleted with the template. This one is worse than the others because it is **user-facing help text**: `/fusion:help configure` reads this section out to a user, who is then told to expect an item that is not there. Fix: `Two things to configure:`.

**3. `bin/fusion-rules:408` — "the five producers", four.**

```
# 1c. Design-diagram agents (the five producers) receive the diagram doctrine:
```

The `IS_DIAGRAM_AGENT` case arm two hundred lines above it reads `planner|analyst|taskplanner|shaper` — four. The same commit that cut `investigator` and `conceptrev` out of that arm rewrote this comment and kept the count; the step's own history entry says *"charged to four producers now instead of five"*, so the number was known. The header comment at `bin/fusion-rules:56-59` names the four correctly, and `README-agents.md:194` and `:219` both name the four correctly — this is the one surface that disagrees. Fix: `(the four producers)`.

**4. `bin/fusion-rules:437` — "The other fifteen agents", fourteen.**

```
#     The other fifteen agents keep the pointer line at `## Commit lock` in
#     fusion-workbench-conventions.md; the three that may commit directly carry …
```

`ls agents/*.md` is 15, so orchestrator plus fourteen others. This one was already wrong before the Turn — it was written when the tree held 16 agents and went stale when `curator` landed at v8.2.0 — and the two removals moved it from one-too-few to one-too-many. The rest of the sentence is correct: `bugfixer`, `coder` and `ontocoder` are the three carrying the lock inline, and `/fusion:commit` and `/fusion:cleanup` are the two committing skills. Fix: `fourteen`.

## Why the class matters more than the four instances

`derivable-enumerations-lint.test.ts` has a whole `describe` block for stale counts, and its `CLAIMS` table is five regexes over **Arabic numerals** in five fixed phrasings, all of them agent counts in `CLAUDE.md`, `README.md` and `README-agents.md`. Every one of those five moved correctly this Turn — the gate worked. A count written as an English word, or counting anything other than agents, is outside it by construction, and three of the four above are in files the gate already reads.

Three removal steps remain in this Circle's plan and each deletes items from lists. The same shape will recur.

## Fix direction

Correct the four words. Whether the class earns a gate is a separate judgement and this record does not decide it — the honest options are a sixth `CLAIMS`-style check keyed on cardinal words (hard to cut cleanly: "two paths", "three surfaces" and "two passes" are all legitimate prose in the same files, so a naive word match would fire constantly), or nothing, on the reading that a spelled-out count is prose and belongs to the curator at gate G1 the way `CLAUDE.md:51` does. If the second is chosen, say so where the digit lint's header explains what it does not cover, so the next reader is not left assuming the block covers counts in general.


---

**Reconciliation 260819-1453 (reconciler, Domain `code`, Circle-store pass) — STAYS `_o_`. Re-measured at HEAD `e435f03` (v10.3.0). Three of four instances stand; one is fixed.**

| Instance | At HEAD |
|---|---|
| `README-agents.md:186` "Two side loops feed into the chain" | **stands** — one bullet follows (reconciler), then `## Plugin structure` |
| `skills/help/SKILL.md:115` | **fixed** — now reads "Two things to configure" |
| `bin/fusion-rules:409` "(the five producers)" | **stands** — four measured recipients |
| `bin/fusion-rules:437` "The other fifteen agents" | **stands** — `ls agents/*.md` is 15, so fourteen others |

The class claim is unchanged and is the point of the record: no gate reads a spelled-out cardinal. `derivable-enumerations-lint.test.ts` checks seven enumerations, all of them by parsing a list and diffing it against the tree; a bare English numeral in prose is invisible to every one of them.

---
Resolved: fixed — `README-agents.md:186` reads One side loop; the two `bin/fusion-rules` comments are plan step 7's and `skills/help` was already fixed; `README-agents.md:186`
