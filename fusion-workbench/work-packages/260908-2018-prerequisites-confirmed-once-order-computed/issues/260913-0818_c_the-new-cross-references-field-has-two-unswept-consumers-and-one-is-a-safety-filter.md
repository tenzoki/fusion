# The new `**Cross-references:**` field has two unswept consumers, and one of them is the archive safety filter

---

This range promoted `**Cross-references:**` to a defined work-item head field and routed every
non-ordering citation into it. Two consumers that read the item head still know only
`**Depends-on:**`. One of them is `/fusion:archive`'s safety filter 2, which exists to stop a
cited item leaving the live tree.

---

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>

**Related:**
`260908-2018-prerequisites-confirmed-once-order-computed.md` (the item that defined the field);
`260911-1916_*_the-origin-rule-names-a-work-item-cross-references-header-the-item-template-does-not-define.md` (the closed defect this range fixed by defining the field);
`260908-2018_*_does-the-new-field-name-only-the-ordering-edge-or-the-four-relation-types-beside-it.md` (the ruling that split the two fields)

**Measurement anchor.** Every line number below was read in this work tree at commit `c2a12973`
on 2026-09-13.

## The defect

Three shipped surfaces changed in this range so that a binding citation between work items now
lands in `**Cross-references:**` and no longer in `**Depends-on:**`:

- `rules/fusion-workbench-conventions.md:103`, the Origin Rule's second corollary, read
  "references it by basename in its `**Depends-on:**` or `**Cross-references:**` header" before
  the range and reads "in its `**Cross-references:**` header" after it.
- `rules/fusion-workbench-conventions.md:221` states the new exclusive meaning: an entry in
  `**Depends-on:**` asserts a prerequisite and nothing else, and "every other citation an item
  carries ... goes in `**Cross-references:**`".
- `skills/migrate/SKILL.md:157` changed the converted head block accordingly. Before the range a
  surviving `## Dependencies` entry was written into `**Depends-on:**`; now it is written into
  `**Cross-references:**`.

`skills/archive/SKILL.md` was not swept. Its safety filter 2 still reads one field:

- `skills/archive/SKILL.md:78` — "any item another live item names in its `**Depends-on:**`
  field: moving it takes the target of a pointer out of every store its consumers scan. Filter 3
  covers the citing corpus; this clause covers the dependency field, which is a citation a grep
  over prose would miss."
- `skills/archive/SKILL.md:143` — "An item named in a live item's `**Depends-on:**` is excluded
  in every tier".
- `skills/archive/SKILL.md:146` — the walk itself, `sed -n 's/^\*\*Depends-on:\*\*[[:space:]]*//p'`,
  which reads that one field and no other.

Filter 3 does not cover the gap. Its corpus is the shipped text plus the project's own
`CLAUDE.md` and rule files (`skills/archive/SKILL.md:80`); it does not scan workbench records, so
a citation that lives only in a live item's head is invisible to it. Filter 2's last clause was
written precisely because filter 3 cannot see that field.

**Consequence.** A `done` or `dropped` item that a live item names in `**Cross-references:**` is
selected by tier 1 (`$SCAN_BACKLOG`, `**Status:** done` or `dropped`), passes both filters, and
is archived container and all. The live item's head then points at a container that is no longer
in any store the reader scans. The migration is the shortest path to that state: every entry it
converts now lands in the unprotected field.

**Second occurrence, lower cost.** `agents/orchestrator.md:397` enumerates the item head fields
the orchestrator maintains — "its four `**Status:**` values, its `**Claim:**` and its
`**Depends-on:**` field" — and omits the new one. The orchestrator is the agent that splits,
merges and closes items at the user's word, so it is the agent that writes these heads.

## Acceptance test

1. `skills/archive/SKILL.md` filter 2 and its Step 3 walk read both `**Depends-on:**` and
   `**Cross-references:**`, and an item named in either, by a live item, is excluded in every
   tier and listed with the item that names it. The prose at line 78 names both fields.
2. A scratch workbench holding a live item whose head carries
   `**Cross-references:** <target>.md` and a `done` item `<target>`: the archive survey reports
   `<target>` as excluded and names the citing item, in tier-1, tier-2 and tier-3 mode.
3. `agents/orchestrator.md:397` names `**Cross-references:**` alongside `**Depends-on:**`. That
   path carries a zero-head-room byte bound, so the addition is paid for inside
   `agents/orchestrator.md` itself.

## Scope

`skills/archive/SKILL.md` (the fix), `agents/orchestrator.md` (the second occurrence). No code
change: `hooks/lib/work-graph.ts` is correct to ignore `**Cross-references:**`, which orders
nothing.

---
Resolved: filter 2, its Step 3 prose and the walk in `skills/archive/SKILL.md` read `**Depends-on:**` and `**Cross-references:**` alike (the `sed` matches both heads with `-E` and the `head -n 1` that could read only one line is gone; a scratch workbench with a live item citing a `done` target through `**Cross-references:**` lists the target), and the orchestrator's field enumeration names `**Cross-references:**` beside `**Depends-on:**`; the commit that carries this line.
