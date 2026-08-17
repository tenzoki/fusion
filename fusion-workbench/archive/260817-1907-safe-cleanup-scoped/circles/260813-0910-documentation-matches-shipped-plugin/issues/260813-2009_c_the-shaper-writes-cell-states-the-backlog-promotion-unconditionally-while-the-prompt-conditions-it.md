The shaper Writes cell states the backlog promotion unconditionally; the prompt leaves a multi-idea entry untouched

---
`README-agents.md:25` lists, among the shaper's anticipated-circle writes, "the marker rename to closed and the `Promoted:` line on the backlog entry the draft came from", with no condition on it. `agents/shaper.md:96-105` makes both writes conditional on the entry holding one idea, and mandates writing nothing at all to an entry holding several.
---

## Both sides read

**Documentation side**, `README-agents.md:25`, end of the Writes cell:

> … In anticipated-circle mode a new Circle directory `circles/<stamp>-<slug>/` holding its `_a_circle.md` record and the six artifact subdirectories, **plus the marker rename to closed and the `Promoted:` line on the backlog entry the draft came from**

**Artifact side**, `agents/shaper.md`, the bullet's own second paragraph:

> **An entry is promoted whole or not at all.** The rename says this entry *became* this Circle. That is true of an entry holding one idea, the shape the store is designed for … and false of an entry holding several: the Circle is one of them, and closing the entry retires the rest unread. The playmaker never recommends such an entry for shaping, for this reason (`agents/playmaker.md` Step 2b). **When one reaches you anyway, make *which idea is this Circle* your first clarification round, leave the entry untouched — no rename, no `Promoted:` line** — and report what is still in it. Splitting an entry is the user's act, never yours.

The prompt therefore has two branches, and the second writes nothing to the backlog store at all.

## Why it matters, and why it is mild

The Writes column's job is to say where an agent may write, and on either branch the answer is the same set of locations — so a reader using the table to check scope is not misled. What the unconditional phrasing loses is the guarantee behind the write: that a closed backlog entry means *this entry became this Circle*, and never *one of this entry's ideas did*. That guarantee is the reason the branch exists, and it is the kind of claim this Circle exists to make exact.

The neighbouring `playmaker` row (`README-agents.md:40`) states the store's maintenance side without the bound either, so the two rows are consistent with each other and both under-state the rule. Only the shaper row was rewritten in this Turn.

## Scope

`README-agents.md` only (shipped doc). No code behaviour is affected.

## Recommended fix direction

Qualify the clause: the rename and the `Promoted:` line land on the backlog entry the draft came from **when that entry holds one idea**; an entry holding several is left untouched and reported back. Six words, and the row stops promising a write the prompt forbids in a case it explicitly anticipates.

Filed by: coderev (review of Circle Turn 2, range `28f3029..5d51abd`, commit `9a11254`).

---
Resolved: The clause is qualified. It now reads "plus — only when that entry holds a single idea — the marker rename to closed and the `Promoted:` line on the backlog entry the draft came from; an entry holding several is left untouched and reported back", which states both branches `agents/shaper.md:96-105` defines rather than the first alone. The neighbouring `playmaker` row was rewritten in the same step and now bounds its own backlog writes: the `_o_`/`_p_` rename is autonomous, and a split, merge, close or deferral needs a user confirmation the run holds for that operation.
