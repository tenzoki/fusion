The edge exception removed the apply pass's staleness check and put nothing in its place

---

`### Pass 2 — apply` now carries an exception for the two work-item head fields. It says staleness is judged on the entry's own basename, then defines both possible basename states as non-stale. No input produces `stale` for an edge entry, and nothing else is checked either — not that the dependent is still live, not that the field line still exists, not that the record is still where the ledger said. The one subject that writes into a user's work-item record is the only one whose approved write now has no pre-write verification at all.

---

**Filed by:** analyst, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260918-0738-curator-run.md, 260918-0822_*_the-edge-entrys-post-write-compare-no-longer-checks-the-bytes-the-user-approved.md, 260918-0712_*_implementation-depends-on-edges-proposed-and-confirmed.md

## The defect

`agents/curator.md` `### Pass 2 — apply` states the general rule and then overrides it for these two fields:

> Before applying an entry, **re-read its before-text from disk**. Where disk and ledger disagree, mark the entry `stale` and apply nothing for it. That check is what makes a two-dispatch run as safe as a one-dispatch run.

The exception's four bullets replace it:

- **Staleness is judged on this entry's own basename**, absent or present in the list on disk — never on the whole line matching the ledger's Before.
- **Applying appends that basename** to the line as found.
- **A basename already present is `applied` with nothing written**, not `stale`.
- **The post-write compare reads the line back** and requires this entry's basename plus every basename the line carried before the write.

The basename is absent or it is present. Absent appends and reports `applied`. Present writes nothing and reports `applied`. **There is no third state, so `stale` is unreachable for this consequence group** while `stale` remains in the outcome vocabulary the same section enumerates. A branch no input reaches is the defect `rules/critical-stance.md` §4 names, arriving from the same side as an unreachable case in a case split.

## What the removed check was catching, and what now passes through

The two passes are separated by a user gate. `skills/curate/SKILL.md` puts the survey and the apply in two dispatches with a human answer between them, so the interval is minutes to days, and the tree moves in it. Four states the old check caught and the exception does not:

1. **The dependent reached a terminal `**Status:**`.** `### The corpus, and the live/terminal bound` ends "this subject writes into a live work item's head and nowhere else". Nothing in the apply pass re-reads `**Status:**`, so an item closed at the gate takes the write anyway. That is the one bound the whole live/terminal section exists to hold, and it is held only at survey time.
2. **The field line was removed or rewritten by hand.** Work-item maintenance is the orchestrator's at the user's word, and a user who has just been shown a ledger of proposed edges is exactly the user who may go and edit the field themselves.
3. **The item was split.** A split moves work and rewrites the head; one happened in this item's own session on 260918-0706, between the spec that the run cited and the run itself.
4. **The field line does not exist.** "Appends that basename to the line as found" has no line to find. **This is the majority case, not an edge case:** of the seven work-item records in this workbench, four carry no `**Cross-references:**` line and six carry no `**Depends-on:**` line. The schema admits `(absent)` as a Before value; the apply pass does not say what to do with one. The insertion point is derivable — the record template in `rules/fusion-workbench-conventions.md` `## Backlog entries — work items` fixes the field order — but the prompt never says to derive it, and two entries into one absent field on one dispatch are not addressed at all.

## Why the exception itself is right and only its scope is wrong

The reasoning that produced the exception holds. Two entries into one comma-separated line do collide under a whole-line check, the collision fired on the first run at a yield of two, and per-basename staleness with an append is the correct unit, because the approved unit is one basename. What the repair did was widen "do not compare the whole line" into "compare nothing", which the collision never required. The per-basename test can stand beside a precondition read without weakening either.

## Acceptance test

Applying an edge entry re-reads the dependent's record and stops before writing where any of these does not hold, marking the entry `stale` and naming which: the record resolves from the basename; its `**Status:**` is one of the five values with the dependent live; and the target field is present, or the entry's Before reads `(absent)` and the record carries no such line. A record whose state moved between survey and apply produces `stale` rather than a write, demonstrated by changing `**Status:**` to `done` between the two dispatches and reading the outcome line. The `(absent)` case names where the new field line goes, or says it derives the position from the record template. `stale` is reachable for the two edge groups, or the outcome vocabulary says in one clause that it is not and why.

Resolved: `agents/curator.md` `### Pass 2 — apply` now opens the edge exception with a three-precondition read of the dependent's record, checked in order, each failure `stale` and naming which — (1) the record resolves from the `**File:**` basename by the one workbench-wide lookup, no match or more than one is `stale`; (2) `**Status:**` is one of the three live values, a terminal one, a legacy vocabulary or an absent line being `stale`, which is where the live/terminal bound is now enforced after the gate rather than at survey time only; (3) the field's presence agrees with the entry's Before, where `(absent)` against an existing line holds **only** if an earlier entry of this same apply pass created it and is otherwise `stale`. That third clause is what keeps the two-entries-into-one-line case, which the exception exists for, from re-colliding with the precondition. `stale` is therefore reachable for both edge groups. The `(absent)` case is a **defined write and never a no-op**: one new line `**<field>:** <basename>`, placed by the record template's field order in `rules/fusion-workbench-conventions.md` `## Backlog entries — work items` — `**Depends-on:**` after `**Active spec/plan:**`, `**Cross-references:**` after `**Depends-on:**`, each falling back to the last field above it the record actually carries, both always above `**Filed by:**` — with the majority measurement (four of seven records carry no `**Cross-references:**` line, six no `**Depends-on:**`) written in beside it. The section also now states what the exception gives up, in one sentence, at the point a reader meets it: the whole-line before-text comparison and nothing else.
