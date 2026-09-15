The `paused` transition sentence names `dropped` as an exit and then forbids every terminal exit
---
`rules/fusion-workbench-conventions.md:216` states the allowed transitions and contradicts itself inside one sentence pair. The bolded enumeration permits `paused` → `dropped`; the sentence immediately after it forbids any transition between `paused` and a terminal value in either direction. `dropped` is terminal by the same document's own table twelve lines above.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260915-2028_*_a-fifth-status-value-for-work-items.md, 260915-2028_*_what-shape-does-the-work-items-fifth-status-value-take.md

**Evidence.** `rules/fusion-workbench-conventions.md:216`:

> **`paused` is entered from `open` or `claimed` and left to `open`, `claimed` or `dropped`**, and it is the one live value an item returns from. No transition joins it to a terminal value in either direction: work that landed passed through somebody working on it, which is `claimed`.

`rules/fusion-workbench-conventions.md` `## Backlog entries — work items`, value table: `done` and `dropped` are both terminal. The reason clause names only `done` ("work that landed"), so the intent is that `paused` → `done` is the forbidden edge and `paused` → `dropped` is allowed — which is what the plan's own state diagram draws (`260915-2028_*_a-fifth-status-value-for-work-items.md` `### The status lifecycle`, `paused --> dropped : Drop (the wait ended badly)` beside "`paused --> done` is deliberately absent"). The plan step 1 carries the same wrong wording it asked for: "out of it to `open`, `claimed` or `dropped`; never to or from a terminal value".

`agents/orchestrator.md:406` and its **Drop** row put no status precondition on dropping, so the operative surface already allows what the second clause forbids.

**Scope.** `rules/fusion-workbench-conventions.md` is always-on and charged to all eleven dispatch paths: every agent reads both clauses on every dispatch. `rules/critical-stance.md` §4 makes an overlapping or incoherent case split a defect of the same kind as a wrong result.

**Acceptance.** The sentence names the one forbidden edge rather than a class that contains an allowed one — `done` in both directions, and `dropped` reachable from `paused` — and the plan's step-1 wording is corrected with it or annotated. Reading `## Backlog entries — work items` end to end yields one answer to "may a paused item be dropped".

Resolved: the blanket clause was the wrong half, and it is gone. `rules/fusion-workbench-conventions.md` `## Backlog entries — work items` now reads "`done` is the value no edge joins to `paused` in either direction", which names the one forbidden edge and leaves `paused` → `dropped` standing where the bolded enumeration puts it; the reverse direction out of either terminal value is already the general rule two paragraphs below and under `## Terminal states are history`, so nothing restates it. The two statements now agree read end to end: entry from `{open, claimed}`, exit to `{open, claimed, dropped}`, `done` excluded both ways. `260915-2028_*_a-fifth-status-value-for-work-items.md` step 1 carried the same wrong wording and was corrected in place to "no edge joins it to `done` in either direction", so the instruction that was followed no longer contradicts what shipped. The edit cost 3 bytes on every dispatch path.
