# The repair's authoring home says three readers scope by checkout, and this Circle built a fourth

---

`rules/workbench-tracking.md` is where C4 authored the reader's repair once, per plan step 9. Its
closing paragraph says **"Three readers apply that scoping"** and names three: `bin/fusion-events
turns`, `bin/monitor` and `bin/fusion-events presence`. Four apply it at HEAD. The fourth is the
orchestrator's Phase-4 session-flow diagram, which plan step 8 of this same Circle converted, and it
is missing from the enumeration in the file that exists to be the one place a reader learns what the
repair is.

---

**Filed by:** reconciler, Kai Stalmann <ks@qantr.com>

**Severity:** Medium. Nothing behaves wrongly — the diagram does filter. What is wrong is the one
authoring home for the repair, which under-reports its own subject by one and is the file every
future reader is sent to instead of the four sites.

**Evidence, read at HEAD `7774d56`.**

The claim, `rules/workbench-tracking.md` `## The event log carries a union merge driver`, last
paragraph:

> **Three readers apply that scoping, and two of the three drop what the third keeps.**
> `bin/fusion-events turns` and `bin/monitor` drop every line another checkout wrote […]
> `bin/fusion-events presence` keeps them […]

The fourth, `agents/orchestrator.md:915` (Phase 4, session-flow generation):

> Read `fusion-workbench/orchestrator-events.jsonl`, **drop the lines another checkout wrote**, sort
> what remains by `ts`, and generate a Mermaid sequence diagram from them

and `agents/orchestrator.md:1376` (Observability section 3), which is where that filter is defined:

> **Filter to this checkout before you sort.** Drop every line whose `checkout` differs from the one
> held at Setup step 2; a line carrying none counts as this checkout's own

That is the same scope-then-sort order the rule paragraph calls "the whole of the repair", applied by
a reader the paragraph does not count. It is a **dropping** reader, so the corrected sentence is
"three of the four drop what the fourth keeps", and the asymmetry the paragraph exists to explain is
unchanged.

**Where the miscount came from, since it was not the executor's.** Plan step 9 instructed "Name the
**three** readers by path and say which of them keeps other checkouts and which drop them", while
plan step 8 in the same plan was adding the diagram filter. The plan's own approach diagram already
drew four readings across three consumers (`EV` twice, `MON`, `SEQ`). The executor did exactly what
step 9 said.

**A second, smaller observation, filed here rather than separately because it is the same sentence's
blind spot.** `agents/curator.md:111` reads `orchestrator-events.jsonl` as corroborating evidence and
applies no checkout scoping at all, and nothing tells it to. Whether a corroborating-only read owes
the scoping is a real question and not obviously yes; the paragraph currently does not raise it.

**Why it matters.** This is the fourth wrong count this Circle has produced about its own subject —
after "all three" emit templates when there were four, acceptance criterion 5's "four sites" when
there were five, and criterion 6's "three records" when the plan referred six. Each was caught by a
review or a later pass and none by a gate. This one stands in the file the Circle designated as the
single authoring home for the repair, which is the worst place for it: a later reader who trusts the
enumeration will edit three readers and leave the diagram behind.

**Fix direction.** Correct the sentence in `rules/workbench-tracking.md` to four readers, name
`agents/orchestrator.md` Phase 4 / Observability section 3 by path beside the other three, and keep
the keeps-versus-drops split as three-of-four. Consider whether the curator's unscoped read is worth
one clause or its own record. The file is emitted to no agent, so it stands on no bounded surface.

**Scope.** `rules/workbench-tracking.md`. No code, no behaviour.

---
Resolved: `rules/workbench-tracking.md` `## The event log carries a union merge driver` now says **"Four readers apply that scoping, and three of the four drop what the fourth keeps"** and names the fourth beside the other three, as `agents/orchestrator.md` `### 3. Post-Session Sequence Diagram`, generated at Phase 4. The keeps-versus-drops asymmetry the paragraph exists to explain is unchanged and the paragraph was not restructured: one clause moved from "two of the three" to "three of the four" and one path joined the list of droppers. The count was measured rather than taken from the record: `grep -rn orchestrator-events rules agents skills hooks/lib bin CLAUDE.md README*.md docs` names the nineteen files that mention the log, and reading each for a scoping of lines by their `checkout` field leaves exactly four appliers — `bin/fusion-events turns` (`hooks/lib/events-query.ts` `countTurns`, via `isOurs`), `bin/monitor` `_read_events`, `bin/fusion-events presence` (`otherParties`, which keeps what the others drop) and the diagram at `agents/orchestrator.md:915` with its rule at `:1376`. `skills/setup/SKILL.md` and `skills/next/SKILL.md` call the helper and apply no scoping of their own, so they are readings through an applier and not appliers.

The second observation in this record is **not** discharged. `agents/curator.md:111` still reads the log as corroborating evidence with no checkout scoping, and nothing tells it to. Whether a corroborating-only read owes the scoping is a real question rather than a defect with a known direction, so it wants a decision record and not a clause appended here; it is left standing in this record's text rather than answered.
